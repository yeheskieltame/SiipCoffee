"use client";

import React from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function SimplePage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  React.useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Header */}
      <div className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coffee-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'}}>☕</span>
            </div>
            <h1 className="text-xl font-bold text-amber-900 tracking-tight">SiipCoffe</h1>
          </div>
          <Wallet />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8 pt-24">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to SiipCoffe
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience premium coffee like never before with our AI-powered ordering system and seamless crypto payments
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="feature-card">
            <div className="feature-icon coffee-gradient">
              <span className="text-white">☕</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Coffee</h3>
            <p className="text-gray-600 leading-relaxed">Carefully selected beans from the world's finest plantations, expertly roasted to perfection</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'}}>
              <span className="text-white">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Assistant</h3>
            <p className="text-gray-600 leading-relaxed">Natural ordering through intelligent conversation with our advanced AI barista</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)'}}>
              <span className="text-white">💳</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Crypto Payments</h3>
            <p className="text-gray-600 leading-relaxed">Secure and transparent blockchain transactions with instant settlement</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <button className="btn-primary">
            Browse Menu
          </button>
          <a href="/chat" className="btn-secondary inline-block text-center no-underline">
            Start Chatting
          </a>
        </div>

        {/* Test Section */}
        <div className="glass-effect rounded-3xl p-8 animate-slide-up">
          <h3 className="text-2xl font-bold text-amber-900 mb-4">✨ Styling Test</h3>
          <p className="text-amber-700 mb-6">Modern design elements working perfectly with glassmorphism effects!</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-500 text-white p-4 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Red</div>
            <div className="bg-green-500 text-white p-4 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Green</div>
            <div className="bg-blue-500 text-white p-4 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Blue</div>
            <div className="bg-purple-500 text-white p-4 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Purple</div>
          </div>
        </div>
      </div>
    </div>
  );
}