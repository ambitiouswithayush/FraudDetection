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
    // Simulate API call - in production, this would call actual Gemini API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Context-aware responses based on user input and current state
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('current transaction') || lowerMessage.includes('this transaction')) {
      if (transaction) {
        return `The current transaction is for $${transaction.amount} at ${transaction.merchant}. Risk level: ${transaction.riskLevel}. Z-Score: ${transaction.zScore.toFixed(2)}, Signature Match: ${(transaction.signatureMatchScore * 100).toFixed(0)}%. This transaction ${transaction.riskLevel === 'CRITICAL' ? 'appears suspicious and requires immediate review.' : 'appears normal and should be safe to approve.'}`;
      }
      return 'No transaction is currently selected. Please select a transaction from the stream to analyze it.';
    }

    if (lowerMessage.includes('knowledge base') || lowerMessage.includes('patterns')) {
      return `Our knowledge base contains ${knowledgeBase.length} fraud patterns. These patterns help us identify similar fraudulent transactions in real-time. The system uses both behavioral analysis (Z-scores) and signature matching to detect anomalies.`;
    }

    if (lowerMessage.includes('how does') || lowerMessage.includes('how do you')) {
      return `I use a hybrid approach:
1. **Behavioral Analysis**: Statistical Z-scores comparing transaction amounts to user history
2. **Signature Matching**: RAG-based pattern matching against our knowledge base of confirmed fraud cases
3. **Policy Enforcement**: Checking against AML policies, sanction lists, and merchant risk ratings
4. **Real-time Alerts**: System-wide monitoring of transaction velocity, geographic patterns, and model performance`;
    }

    if (lowerMessage.includes('risk')) {
      return `Risk assessment involves multiple factors: transaction amount, merchant category, user profile, geographic location, and similarity to known fraud patterns. Risk levels are categorized as LOW, MEDIUM, or CRITICAL. Our model achieves high accuracy in distinguishing legitimate from fraudulent transactions.`;
    }

    if (lowerMessage.includes('recommendation') || lowerMessage.includes('should i')) {
      if (transaction) {
        if (transaction.riskLevel === 'CRITICAL') {
          return `Based on the analysis, I recommend BLOCKING this transaction. The risk level is CRITICAL with high deviation from normal patterns. You can click "Block & Learn" to add it to our knowledge base for future detection.`;
        }
        return `Based on the analysis, this transaction appears safe. Risk level is ${transaction.riskLevel}. You can safely ALLOW it. If you disagree with the assessment, blocking it will help improve our model.`;
      }
      return 'Please select a transaction to get a personalized recommendation.';
    }

    if (lowerMessage.includes('false positive') || lowerMessage.includes('block & learn')) {
      return `"Block & Learn" is a feedback loop feature. When you block a transaction, it\'s added to our knowledge base as a confirmed fraud case. This helps the system learn and improve fraud detection accuracy over time. Even if a transaction was legitimate, marking it as fraud helps us refine our patterns.`;
    }

    if (lowerMessage.includes('merchant') || lowerMessage.includes('vendors')) {
      return `Merchants are rated based on fraud rate, chargeback rate, and compliance issues. High-risk merchants (crypto exchanges, wire transfers, etc.) receive stricter scrutiny. Our document store maintains detailed merchant ratings and compliance histories.`;
    }

    if (lowerMessage.includes('sanction') || lowerMessage.includes('blocked entities')) {
      return `We maintain OFAC-style sanction lists of blocked entities. Any transaction involving sanctioned individuals or organizations is automatically blocked. This ensures compliance with international financial regulations.`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I can help you with:
• Analysis of the current transaction
• Explaining fraud detection methods
• Discussing risk factors and recommendations
• Answering questions about our knowledge base
• Explaining compliance policies and merchant ratings
• Providing insights on system performance

Just ask me anything! You can also use the Dashboard to see real-time metrics and the Document Store to view policies.`;
    }

    // Default response for general queries
    return `That's an interesting question! In this fraud detection system, I analyze transactions using behavioral analysis, pattern matching, and policy enforcement. Is there something specific about fraud detection, the current transaction, or our compliance policies you'd like to know more about?`;
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
