# FraudLens - Hybrid Fraud Detection Platform

<div align="center">

**An advanced real-time fraud detection system powered by AI, combining behavioral analysis with signature-based pattern matching.**

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange)](https://ai.google.dev)

</div>

---

## 📋 Overview

FraudLens is a real-time fraud detection platform that leverages hybrid detection methods to identify suspicious financial transactions. The system combines:

- **Behavioral Analysis**: Z-score based anomaly detection using transaction history
- **Signature Matching**: RAG-powered pattern recognition against a knowledge base of known fraud cases
- **AI-Powered Analysis**: Gemini 2.5 Flash for intelligent threat assessment and recommendations

The platform provides analysts with actionable insights through an intuitive dashboard, enabling rapid decision-making for transaction approval or blocking.

---

## 🎯 Key Features

### Real-Time Transaction Monitoring
- Live transaction stream with automatic risk assessment
- Behavioral Z-score calculation based on user history
- Hybrid scoring system (BM25 + Dense vector similarity)

### AI-Powered Analysis
- **Gemini Integration**: Advanced LLM-based reasoning for fraud determination
- **Structured Responses**: JSON schema enforced responses with confidence scores
- **Contextual Understanding**: RAG retrieval for known fraud pattern matching

### Interactive Dashboard
- **Transaction Stream**: Live feed of incoming transactions with risk indicators
- **Analyst Panel**: Detailed analysis view with AI recommendations
- **Knowledge Base**: Curated collection of fraud patterns with embedding vectors
- **Control Center**: Play/Pause simulation, inject fraud events for testing

### Feedback Loop
- Learn from analyst decisions to improve future detections
- Add confirmed fraud cases to knowledge base automatically
- Adaptive pattern recognition based on feedback

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework for interactive dashboard |
| **TypeScript** | Type-safe application development |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling framework |
| **Recharts** | Data visualization for risk metrics |
| **@google/genai** | Google Gemini API integration |
| **Lucide React** | Icon library for UI components |

---

## 📦 Project Structure

```
FraudDetection/
├── components/
│   ├── TransactionStream.tsx      # Live transaction list
│   ├── AnalystPanel.tsx           # Detailed analysis interface
│   └── Toast.tsx                  # Notification system
├── services/
│   ├── gemini.ts                  # AI analysis engine
│   └── simulation.ts              # Transaction simulation
├── App.tsx                        # Main application component
├── index.tsx                      # React entry point
├── types.ts                       # TypeScript interfaces
├── constants.tsx                  # App constants and icons
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** 8.0 or higher
- **Google Gemini API Key** (get one free at [ai.google.dev](https://ai.google.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ambitiouswithayush/FraudDetection.git
   cd FraudDetection
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file (not included in repo for security)
   echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

---

## 📖 Usage Guide

### Navigation
- **Top Bar**: FraudLens branding with interactive logo
- **Left Sidebar**: Action buttons with hover tooltips
  - 📊 **Live Monitor**: View transaction stream
  - ⚡ **Inject Event**: Trigger fraud simulation for testing
  - ▶️ **Play/Pause**: Control transaction stream

### Analyzing Transactions

1. **Select a transaction** from the stream on the left
2. **Review scores** in the analyst panel:
   - Behavioral Z-Score (anomaly magnitude)
   - Signature Match (similarity to known fraud patterns)
3. **Run AI Analysis** using Gemini for intelligent assessment
4. **Take Action**:
   - ✅ **Allow**: Approve the transaction
   - 🚫 **Block & Learn**: Block and add to knowledge base for future reference

### Knowledge Base
- Visible on ultra-wide displays (2xl+ breakpoints)
- Shows all learned fraud patterns
- Updated automatically when analysts block transactions

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Google Gemini API Key (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Security Note**: The `.env` file is excluded from git via `.gitignore`. Never commit API keys.

### Vite Configuration
The `vite.config.ts` handles:
- Development server on port 3000
- API key injection into build
- TypeScript resolution
- React Fast Refresh

---

## 🧠 How It Works

### Detection Pipeline

```
Incoming Transaction
        ↓
[Behavioral Analysis] ← User History (Z-Score)
        ↓
[Signature Matching] ← Knowledge Base (RAG)
        ↓
[Risk Scoring] → Combined Score
        ↓
[Analyst Review]
        ↓
[Gemini AI Analysis] ← RAG Context + Transaction Data
        ↓
[Decision] → Allow / Block / Hold
        ↓
[Feedback Loop] → Learn from Decision
```

### Behavioral Analysis
- Calculates mean and standard deviation of user's transaction amounts
- Assigns Z-score to new transactions
- Values > 3.0 indicate anomalies (99.7% confidence)

### Signature Matching
- Performs hybrid search (BM25 + semantic similarity)
- Retrieves most similar cases from knowledge base
- Matches transactions against known fraud patterns

### AI Analysis
- Uses Google Gemini 2.5 Flash for rapid inference
- Structured JSON output with confidence scores
- Considers both behavioral and signature signals
- Recommends BLOCK, ALLOW, or HOLD actions

---

## 📊 Data Structures

### Transaction
```typescript
interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  merchantId: string;
  narrative: string;
  timestamp: number;
  riskLevel: "LOW" | "MEDIUM" | "CRITICAL";
  zScore: number;
  signatureMatchScore: number;
  matchedCaseId?: string;
  status?: "ALLOWED" | "BLOCKED" | "PENDING";
}
```

### Analysis Result
```typescript
interface AnalysisResult {
  isLikelyFraud: boolean;
  confidence: number;
  reasoning: string;
  recommendedAction: "BLOCK" | "ALLOW" | "HOLD";
  keyRiskFactors: string[];
}
```

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## 🔐 Security Considerations

1. **API Key Protection**
   - Store API keys in `.env` (git-ignored)
   - Use `VITE_` prefix for client-side exposure only
   - Never commit `.env` to version control

2. **Data Handling**
   - All sensitive data stays client-side in development
   - Production deployments should use backend authentication
   - Consider rate limiting for API calls

3. **Best Practices**
   - Rotate API keys regularly
   - Use environment-specific credentials
   - Implement request signing for production APIs

---

## 🧪 Testing

### Inject Fraud Events
Click the ⚡ **Inject Event** button to:
- Trigger simulated fraud transactions
- Test analyst workflow
- Validate AI analysis functionality
- Pause stream for detailed examination

---

## 🔗 API Integration

### Google Gemini API
- **Model**: Gemini 2.5 Flash (optimized for speed/cost)
- **Format**: JSON schema with structured responses
- **Prompt Engineering**: RAG-enhanced prompts with transaction context

Example usage in `services/gemini.ts`:
```typescript
const result = await genAI.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: { /* schema */ }
  }
});
```

---

## 📈 Performance Metrics

- **Transaction Generation**: 2.5 seconds per new transaction
- **AI Analysis**: < 2 seconds per analysis request
- **UI Responsiveness**: 60 FPS interactions
- **Memory Footprint**: ~30MB for 50 transactions

---

## 🐛 Troubleshooting

### "API Key not found" Error
```
Solution: Create .env file with VITE_GEMINI_API_KEY=your_key
```

### Blank Page on Load
```
Solution: Clear browser cache (Cmd+Shift+R) and restart dev server
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💼 Author

**Ayush Kumar**
GitHub: [@ambitiouswithayush](https://github.com/ambitiouswithayush)

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev) for advanced LLM capabilities
- [React](https://react.dev) for the UI framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vite](https://vitejs.dev) for the build tool

---

## 📞 Support

For issues, feature requests, or questions, please open an issue on [GitHub](https://github.com/ambitiouswithayush/FraudDetection/issues).

---

<div align="center">

**Made with ❤️ for fraud detection excellence**

[⬆ Back to top](#fraudlens---hybrid-fraud-detection-platform)

</div>
