import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, ShieldCheck, MessageSquare, Zap, CheckCircle } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { api } from '../services/api';

export default function AiAssistantPage({ currentLang, t }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: currentLang === 'hi'
        ? 'नमस्ते! मैं **उद्यमसारथी AI** हूँ। मैं उपयोगकर्ताओं को NSFDC योजनाओं, पात्रता शर्तों, ब्याज दरों और चैनल पार्टनर्स की जानकारी समझने में मदद करने के लिए डिज़ाइन किया गया एक AI सहायक हूँ।'
        : 'Hello! I am **UdyamSaarthi AI**, an AI assistant designed to help users understand NSFDC financial schemes, eligibility criteria, loan terms, and channel-partner details.',
      sources: ['NSFDC Official Scheme Rules & 91 Channel-Partner Database']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    try {
      setLoading(true);
      const res = await api.sendChat({ message: query, lang: currentLang });
      const botMsg = {
        sender: 'bot',
        text: res.reply,
        sources: res.grounded_sources || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: currentLang === 'hi'
            ? 'क्षमा करें, प्रतिक्रिया उत्पन्न करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an error connecting to the assistant. Please try again.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [t.q1, t.q2, t.q3, t.q4];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/80 overflow-hidden">
        {/* Glow decorative shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-300 rounded-2xl flex items-center justify-center text-slate-900 shadow-md">
                <Bot className="w-7 h-7 text-slate-900" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online & Ready"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t.aiTitle}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Active RAG
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{t.aiSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini 2.5 Flash Grounded</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {t.quickPromptsTitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-bold text-blue-900 bg-blue-50/70 hover:bg-blue-600 hover:text-white border border-blue-200/70 hover:border-blue-600 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left flex items-center justify-between group active:scale-[0.99]"
            >
              <span className="line-clamp-1">{q}</span>
              <MessageSquare className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[550px]">
        {/* Chat top info header */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Hallucination Scheme Safeguards Active</span>
          </div>
          <span>Lang: {currentLang.toUpperCase()}</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/30" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <Bot className="w-5 h-5 text-amber-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-br-xs font-semibold'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Grounded
                    </span>
                    <span>{msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-amber-300 animate-spin" />
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600 font-bold shadow-xs flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>UdyamSaarthi AI is referencing official NSFDC scheme rules...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-slate-200/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={t.inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-5 py-3.5 text-sm rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 font-medium text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm active:scale-[0.98]"
            >
              <span>{t.btnSend}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

