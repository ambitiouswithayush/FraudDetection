# Gemini Analyst Not Working - Complete Debugging Guide

## 🔍 Issue Identified

**Problem**: Gemini AI Analysis is showing "AI Analysis unavailable. Check API Key" error

**Root Cause**: The Gemini API key isn't being properly passed to the `GoogleGenAI` client due to environment variable configuration issues.

---

## 🛠️ What We Fixed

### Enhanced Error Detection in `services/gemini.ts`

We improved the gemini service with:

**1. API Key Detection Chain**
```typescript
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
```

This checks three locations for the API key:
- `process.env.API_KEY` (defined in vite.config.ts)
- `process.env.GEMINI_API_KEY` (fallback)
- `import.meta.env.VITE_GEMINI_API_KEY` (Vite's native access)

**2. Initialization Logging**
If API key is not found, you'll see:
```
❌ CRITICAL: Gemini API Key not found in environment variables
   - process.env.API_KEY: undefined
   - process.env.GEMINI_API_KEY: undefined
   - import.meta.env.VITE_GEMINI_API_KEY: undefined
   ℹ️ Check your .env.local file has: VITE_GEMINI_API_KEY=your_key
```

**3. Enhanced Error Messages**
When API calls fail, you now get specific error details:
```
❌ Gemini Analysis Failed: {
  error: "INVALID_ARGUMENT: API key invalid",
  apiKeyPresent: false,
  timestamp: "2025-11-24T08:30:00Z"
}
```

**4. Intelligent Error Fallback**
The system detects different error types:
- Missing key → "API Key not configured"
- Invalid key → "Invalid or expired API Key"
- Rate limit → "API rate limit exceeded"
- Auth error → "API authentication failed"

---

## 🧪 How to Debug

### Step 1: Check Browser Console (Most Important!)

1. Open http://localhost:3000
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Look for messages with "❌" or "API Key"
5. The exact error message will tell you what's wrong

### Step 2: Understand Error Messages

| Message | Meaning | Solution |
|---------|---------|----------|
| "API Key not configured" | `.env.local` missing or empty | Create `.env.local` with your key |
| "Invalid or expired API Key" | Wrong format or expired key | Get fresh key from Google AI Studio |
| "API rate limit exceeded" | Too many requests | Wait 1-2 minutes |
| "API authentication failed" | Key rejected by Google | Verify key is correct |
| "Thinking..." → Analysis | ✅ Working! | No action needed |

### Step 3: Verify Your Setup

Run these commands:

```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Check content
cat .env.local
# Should show: VITE_GEMINI_API_KEY=AIza...

# 3. Verify format (must start with AIza)
grep "VITE_GEMINI_API_KEY=AIza" .env.local

# 4. Check vite config has correct references
grep "VITE_GEMINI_API_KEY" vite.config.ts
```

---

## ✅ Complete Fix Checklist

- [ ] `.env.local` file exists in project root directory
- [ ] `.env.local` has exactly: `VITE_GEMINI_API_KEY=your_key`
- [ ] API key starts with `AIza`
- [ ] No extra spaces or special characters in key
- [ ] Server has been fully restarted (kill and `npm run dev`)
- [ ] Browser Console (F12) shows no "❌" error messages
- [ ] Can click a transaction without getting "Check API Key" error
- [ ] See "Thinking..." when analyzing a transaction
- [ ] AI Analysis appears with fraud probability

---

## 🚀 Quick Fix Steps

### If Gemini Analysis is NOT working:

**Step 1: Create/Verify `.env.local`**
```bash
# Check if file exists
cat .env.local

# If missing or incorrect, create it:
echo "VITE_GEMINI_API_KEY=REMOVED_LEAKED_API_KEY" > .env.local
```

**Step 2: Fully Restart Server**
```bash
# Kill the running server (Ctrl+C)
# Then restart with:
npm run dev
```

**Step 3: Test in Browser**
```
1. Go to http://localhost:3000
2. Open Console (F12 → Console tab)
3. Click on any transaction
4. Check console for error messages
5. If no errors, see "Thinking..." then analysis appears
```

**Step 4: If Still Not Working**
- Read the error message in console carefully
- Check API key format (starts with `AIza`?)
- Verify internet connection
- Check Google Cloud Console for API quota

---

## 💡 Common Problems & Solutions

### Problem 1: ".env.local doesn't exist"
```bash
# Solution: Create it
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local
```

### Problem 2: "API Key Invalid"
```
❌ Check your key:
   - Must start with "AIza"
   - Must be exactly as shown in Google AI Studio
   - No extra spaces or characters
   - Get fresh key from: https://ai.google.dev/
```

### Problem 3: "Rate Limited"
```
429 Too Many Requests
   - Wait 1-2 minutes
   - Free tier has 15 requests/minute limit
   - Consider upgrading to paid plan if using heavily
```

### Problem 4: "Environment Not Updated"
```
Even after creating .env.local, changes don't apply:
   - Solution: Kill server (Ctrl+C)
   - Run: npm run dev
   - Browser: Clear cache (Ctrl+Shift+Delete)
   - Retry
```

### Problem 5: "Still Shows Fallback Message"
```
Analyst Panel shows: "AI Analysis unavailable. Check API Key"

This means ONE of:
   1. API key not found (check console for ❌)
   2. Google API call failed (check console for error details)
   3. Network unreachable (check internet connection)
   4. API key invalid (verify in Google AI Studio)
```

---

## 🔍 Advanced Debugging

### Check What Vite Loaded
In browser console, paste:
```javascript
console.log('process.env.API_KEY:', process.env.API_KEY);
console.log('import.meta.env.VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
```

If both show `undefined`, your API key isn't being exposed to the browser.

### Monitor Network Requests
1. Open DevTools → Network tab
2. Click a transaction
3. Look for requests to `generativelanguage.googleapis.com`
4. Check the response status:
   - 200 = Success ✅
   - 400 = Bad request (check key)
   - 401 = Auth failed (invalid key)
   - 429 = Rate limited (wait)
   - 500 = Server error (try later)

### Enable Detailed Logging
In `services/gemini.ts`, add before the try block:
```typescript
console.log('🚀 Calling Gemini API...');
console.log('API Key present:', !!apiKey);
console.log('Model:', model);
```

---

## 📊 Expected Behavior

### When Working ✅
```
1. Click transaction → "Thinking..." appears
2. 2-5 seconds pass → Loading animation
3. Analysis displays:
   - Fraud probability: 78% Confidence
   - Assessment: BLOCK / ALLOW / HOLD
   - Reasoning: Detailed explanation
   - Key Risk Factors: List of 3-5 factors
```

### When Not Working ❌
```
1. Click transaction → No "Thinking..."
2. Analyst Panel shows: "AI Analysis unavailable. Check API Key"
3. Console shows error messages starting with "❌"
```

---

## 🔧 Files Modified for This Fix

### `services/gemini.ts` (Enhanced)
- ✅ Added API key detection chain
- ✅ Added initialization logging
- ✅ Added detailed error messages
- ✅ Improved error handling with specific reasons

### Original Configuration Files (No Changes)
- `.env` - Has correct variable format
- `.env.local` - User creates with their key
- `vite.config.ts` - Correctly exposes variables

---

## 📞 Support Steps

### If Console Shows "❌ CRITICAL"
Your API key was never loaded. Do this:
1. Check `.env.local` exists: `cat .env.local`
2. Check format: `VITE_GEMINI_API_KEY=AIza...`
3. Restart server: `npm run dev`
4. Clear browser cache: `Ctrl+Shift+Delete`
5. Refresh page: `F5`

### If Console Shows Specific Error
Read the error message - it tells you exactly what's wrong:
- "INVALID_ARGUMENT" → Bad API key format
- "UNAUTHENTICATED" → Invalid API key
- "429 TOO_MANY_REQUESTS" → Rate limited
- "RESOURCE_EXHAUSTED" → Quota exceeded

### If No Console Errors but Still No Analysis
- Check internet connection
- Verify Google API is accessible
- Try a different transaction
- Wait a moment and try again

---

## ✨ What This Fix Provides

1. **Better Error Messages** - Know exactly what's wrong
2. **API Key Detection** - Checks multiple locations
3. **Fallback Gracefully** - Shows helpful error instead of crash
4. **Console Logging** - Debug information when something fails
5. **User Guidance** - Tells you what to do to fix it

---

## 🎯 How to Know If It's Fixed

✅ **Success Signs:**
- No red "❌" messages in console
- See "Thinking..." when analyzing a transaction
- AI analysis appears within 5 seconds
- Shows fraud probability and reasoning
- Shows recommended action (BLOCK/ALLOW/HOLD)
- No "Check API Key" fallback message

---

## 🔗 Resources

- **Get API Key**: https://ai.google.dev/
- **Gemini Docs**: https://ai.google.dev/docs
- **Google Cloud Console**: https://console.cloud.google.com/
- **Project Setup Guide**: See `SETUP_GUIDE.md`

---

## 📝 Summary

The enhanced error handling now provides:
1. Clear indication if API key is missing or invalid
2. Specific error messages from Google API
3. Helpful suggestions on how to fix the problem
4. Timestamp of failures for debugging
5. Better user experience overall

**The console is your best friend - read the error messages there!**

---

**Last Updated**: November 24, 2025
**Status**: Enhanced error handling implemented
**Testing**: Ready for comprehensive testing

*Remember: Look in the browser console (F12) for detailed error messages!*
