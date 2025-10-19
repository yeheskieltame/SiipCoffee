"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestedItems?: any[];
  menuData?: any;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
}

export default function ChatPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: "1",
        text: "☕ Hi! I'm your AI Barista at SiipCoffe! What can I help you with today? You can ask me about our menu, get recommendations, or place an order!",
        sender: "bot",
        timestamp: new Date(),
      },
    ],
    isLoading: false,
    isTyping: false,
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isTyping: true,
    }));

    setInputMessage("");

    // Simulate typing indicator
    setTimeout(() => {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }, 500);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm not sure how to respond to that. Can you try asking about our menu?",
        sender: "bot",
        timestamp: new Date(),
        suggestedItems: data.suggestedItems || [],
        menuData: data.menuData || null,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSuggestedItemClick = (item: any) => {
    setInputMessage(`I'd like to order ${item.name}`);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-amber-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coffee-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">☕</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900 tracking-tight">SiipCoffe</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-xs text-gray-600">
                  {isConnected ? 'AI Barista Online' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
          <Wallet />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: '80px' }}>
        {chatState.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                  : 'bg-white text-gray-800 border border-amber-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <div className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-amber-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>

              {/* Suggested Items */}
              {message.suggestedItems && message.suggestedItems.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.suggestedItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestedItemClick(item)}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-3 cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900">{item.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <span className="font-bold text-amber-700 ml-2">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {chatState.isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-white border border-amber-100 rounded-2xl px-4 py-3 shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-amber-100 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-white border border-amber-200 rounded-full px-4 py-3 pr-12 focus:outline-none focus:border-amber-400 transition-colors text-gray-800 placeholder-gray-500"
              disabled={chatState.isLoading}
            />
            {inputMessage && (
              <button
                onClick={() => setInputMessage('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || chatState.isLoading}
            className="coffee-gradient text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
          >
            {chatState.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {['menu', 'iced coffee', 'espresso', 'chocolate', 'pastry'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputMessage(suggestion)}
              className="bg-white border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}