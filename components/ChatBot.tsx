import React, { useState, useRef, useEffect } from 'react';
import { Transaction, FraudCase } from '../types';
import { ICONS } from '../constants';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Props {
  transaction: Transaction | null;
  knowledgeBase: FraudCase[];
}

const ChatBot: React.FC<Props> = ({ transaction, knowledgeBase }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m the Gemini AI Analyst. Ask me anything about fraud detection, the current transaction, or our knowledge base. How can I help?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    // Build context about current transaction
    let txContext = '';
    if (transaction) {
      txContext = `Current transaction: $${transaction.amount} at ${transaction.merchant}, Risk: ${transaction.riskLevel}, Z-Score: ${transaction.zScore.toFixed(2)}, Signature Match: ${(transaction.signatureMatchScore * 100).toFixed(0)}%`;
    }

    const systemPrompt = `You are a fraud detection AI analyst. You have access to:
- Current transaction: ${txContext || 'None selected'}
- Knowledge base: ${knowledgeBase.length} fraud patterns
- Hybrid detection: Behavioral analysis (Z-scores) + Signature matching (RAG)

Respond concisely and specifically. If the user asks about something not in your domain, politely redirect them.`;

    // Try to use real Gemini API if available
    if (API_KEY) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response.';
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback to smart pattern matching if API unavailable
    return getFallbackResponse(lowerMessage, transaction, knowledgeBase);
  };

  const getFallbackResponse = (
    lowerMessage: string,
    transaction: Transaction | null,
    knowledgeBase: FraudCase[]
  ): string => {
    // Transaction-specific queries
    if (lowerMessage.match(/current|this transaction|analyze|what about/)) {
      if (!transaction) return 'No transaction selected. Click on a transaction in the stream to analyze it.';
      const risk = transaction.riskLevel === 'CRITICAL' ? 'HIGH RISK' : 'LOW RISK';
      return `$${transaction.amount} at ${transaction.merchant} (${risk}). Z-Score: ${transaction.zScore.toFixed(2)}, Match: ${(transaction.signatureMatchScore * 100).toFixed(0)}%.`;
    }

    if (lowerMessage.match(/block|allow|recommend/)) {
      if (!transaction) return 'Select a transaction first.';
      return transaction.riskLevel === 'CRITICAL'
        ? `Block this - high deviation. "Block & Learn" adds it to our knowledge base.`
        : `Safe to allow. If wrong, blocking helps us improve.`;
    }

    if (lowerMessage.match(/knowledge base|patterns|learn/)) {
      return `${knowledgeBase.length} patterns in KB. Hybrid detection: behavioral (Z-scores) + signature (RAG).`;
    }

    if (lowerMessage.match(/how|explain|describe|work/)) {
      return `Hybrid detection: 1) Behavioral - Z-score deviation 2) Signature - pattern matching 3) Policy - AML/sanctions 4) Alerts - velocity/geography`;
    }

    if (lowerMessage.match(/risk|factor|score/)) {
      return `Risk factors: transaction amount, merchant category, user history, location, pattern similarity. Levels: LOW, MEDIUM, CRITICAL.`;
    }

    if (lowerMessage.match(/merchant/)) {
      return `Merchants rated by fraud rate, chargebacks, compliance. High-risk: crypto, wire transfers. Document Store has full ratings.`;
    }

    if (lowerMessage.match(/sanction|block|entity|compliance/)) {
      return `OFAC sanction lists prevent transactions with blocked entities. Automatic block for international compliance.`;
    }

    if (lowerMessage.match(/help|what can|dashboard|document|storage/)) {
      return `I analyze transactions, explain fraud detection, discuss risks, and answer policy questions. Check Dashboard for metrics, Document Store for policies.`;
    }

    if (lowerMessage.match(/hello|hi|hey|good/)) {
      return `Hi! I'm the Gemini Fraud Analyst. Ask about fraud detection, current transaction analysis, or our detection methods.`;
    }

    if (lowerMessage.match(/thanks|thank|great|good job|nice/)) {
      return `Happy to help! Anything else about fraud detection?`;
    }

    // Default: ask for clarification
    return `Not sure I understood. Try asking about: current transaction, risk factors, how detection works, knowledge base, or recommendations.`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Generate and add assistant response
    try {
      const response = await generateResponse(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            {ICONS.Brain}
          </div>
          <div>
            <h2 className="font-bold text-white">Gemini AI Analyst</h2>
            <p className="text-xs text-slate-400">Ask questions about fraud detection</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-lg border border-slate-700">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about fraud detection..."
            rows={2}
            className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
            ) : (
              '→'
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Tip: Ask about current transaction, knowledge base, risk factors, or how the system works
        </p>
      </div>
    </div>
  );
};

export default ChatBot;
