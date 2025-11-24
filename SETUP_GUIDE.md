# FraudLens - Setup & Configuration Guide

## 🔑 API Key Configuration

### Problem Solved
**Error**: "AI Analysis unavailable. Check API Key"

**Root Cause**: The Gemini API key wasn't being properly loaded from environment variables.

### Solution Implemented

#### 1. **Environment Variable Format**
The Vite bundler requires environment variables to have the `VITE_` prefix to expose them to the client-side code.

**Correct Format:**
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

#### 2. **Files that were Fixed**

**`.env` and `.env.local`**
```bash
# ✅ CORRECT
VITE_GEMINI_API_KEY=REMOVED_LEAKED_API_KEY

# ❌ WRONG (old format - won't work)
GEMINI_API_KEY=REMOVED_LEAKED_API_KEY
```

**`vite.config.ts`**
```typescript
// ✅ CORRECT (updated)
define: {
  'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
},

// ❌ WRONG (old format - didn't expose correctly)
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
},
```

### 3. **How It Works Now**

```
1. You set: VITE_GEMINI_API_KEY in .env.local
           ↓
2. Vite loads it (because of VITE_ prefix)
           ↓
3. vite.config.ts exposes it to process.env
           ↓
4. services/gemini.ts uses process.env.API_KEY
           ↓
5. Google Generative AI is initialized with the API key
           ↓
6. analyzeTransactionWithGemini() works correctly
           ↓
7. AI Analysis appears in the Analyst Panel ✅
```

---

## 🚀 Quick Setup

### Step 1: Create `.env.local` file

In the root directory of the project, create a `.env.local` file:

```bash
touch .env.local
```

### Step 2: Add your Gemini API Key

Edit `.env.local` and add:

```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API Key:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key
5. Paste it in `.env.local`

### Step 3: Start the Development Server

```bash
npm run dev
```

The server will automatically restart and load the new environment variables.

### Step 4: Verify It Works

1. Open http://localhost:3000
2. Click on a transaction to select it
3. The Analyst Panel should show AI analysis
4. If you see detailed fraud assessment from Gemini AI ✅ - **It works!**

---

## 🔐 Security Best Practices

### ✅ DO:
- Store API key in `.env.local` (never in `.env`)
- Add `.env.local` to `.gitignore` (already done)
- Rotate API keys periodically
- Use different keys for development and production
- Monitor API usage in Google Cloud Console

### ❌ DON'T:
- Commit `.env.local` to GitHub
- Hardcode API keys in source code
- Share API keys in chat or emails
- Use production keys in development

### Environment File Hierarchy (Vite):

```
.env                    # Default (committed to git)
.env.local             # Overrides (NOT committed - your API key goes here)
.env.[mode]            # Mode-specific (e.g., .env.production)
```

---

## 🧪 Testing the API Connection

### Method 1: Browser Console

1. Open http://localhost:3000
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Check for any error messages
5. Try selecting a transaction and analyzing it

### Method 2: Check Network Requests

1. Open Developer Tools → Network tab
2. Filter by "gemini" or "googleapis"
3. Look for POST requests to Google Generative AI
4. Check response status (should be 200)

### Method 3: Verify Environment Variable

In the browser console, run:
```javascript
console.log(process.env.VITE_GEMINI_API_KEY)
// Should print your API key (in development)
```

---

## 🐛 Troubleshooting

### Issue 1: "AI Analysis unavailable. Check API Key."

**Possible Causes:**
1. `.env.local` file doesn't exist
2. API key is wrong or expired
3. Server wasn't restarted after creating `.env.local`
4. API key variable name is incorrect

**Solution:**
```bash
# 1. Check file exists
ls -la .env.local

# 2. Verify API key format
cat .env.local
# Should show: VITE_GEMINI_API_KEY=your_key

# 3. Restart server
npm run dev
```

### Issue 2: API Quota Exceeded

**Error Message:** "429 - Too Many Requests"

**Solution:**
- Check Google Cloud Console for API usage
- Wait for quota reset (usually daily)
- Consider upgrading your plan
- Check rate limits for free tier

### Issue 3: "Invalid API Key"

**Error Message:** "INVALID_ARGUMENT: API key not valid"

**Solution:**
1. Verify API key is correct (copy from Google AI Studio again)
2. Check for extra spaces or special characters
3. Ensure it matches your Google Cloud Project

### Issue 4: CORS Errors

**Error Message:** "Access to XMLHttpRequest blocked by CORS"

**Solution:**
- This is expected for client-side API calls
- The Gemini API handles CORS properly
- If persists, try a different API key
- Check browser console for exact error

---

## 📊 API Monitoring

### Check Your API Usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to APIs & Services → Quotas
4. Search for "Generative AI"
5. View your usage and limits

### Optimize API Usage:

In `services/gemini.ts`:
- Model: `gemini-2.5-flash` (optimized for cost)
- Batch requests when possible
- Cache responses
- Implement error fallbacks

---

## 📝 Configuration Files Reference

### `.env.local` (Your file - keep secret!)
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

### `.env` (Example/Default)
```bash
# This is just for reference, actual key goes in .env.local
VITE_GEMINI_API_KEY=demo_key_here
```

### `vite.config.ts` (Build configuration)
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
},
```

### `services/gemini.ts` (API client)
```typescript
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] `.env.local` file exists in root directory
- [ ] `VITE_GEMINI_API_KEY` is set with your actual API key
- [ ] `.env.local` is in `.gitignore`
- [ ] Server has been restarted after creating `.env.local`
- [ ] Browser shows no console errors
- [ ] You can select a transaction and see analysis
- [ ] Analysis includes Gemini AI insights
- [ ] No "AI Analysis unavailable" messages

---

## 🔗 Useful Links

- **Google AI Studio**: https://ai.google.dev/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Google Cloud Console**: https://console.cloud.google.com/
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Project README**: [README.md](README.md)

---

## 📞 Still Having Issues?

1. **Check the console**: F12 → Console tab for error messages
2. **Verify API key**: Copy it again from Google AI Studio
3. **Restart everything**: Kill server, delete node_modules if needed, reinstall
4. **Check network**: Ensure you have internet connection
5. **Review logs**: `npm run dev` shows detailed error messages

---

**Last Updated:** November 24, 2025
**Status:** ✅ Fully Functional

*Your FraudLens API should now work perfectly!*
