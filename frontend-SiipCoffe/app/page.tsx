"use client";
import { useEffect, useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import HeroSection from "@/components/HeroSection";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Coffee, MessageCircle, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PageType = "home" | "chat";

// Backend API configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Check backend connection
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        setIsBackendConnected(response.ok);
      } catch {
        setIsBackendConnected(false);
      }
    };

    checkBackendConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }

    // Listen for navigation events from HeroSection
    const handleNavigateToChat = () => {
      setCurrentPage("chat");
    };

    window.addEventListener('navigateToChat', handleNavigateToChat);

    return () => {
      window.removeEventListener('navigateToChat', handleNavigateToChat);
    };
  }, [setMiniAppReady, isMiniAppReady]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HeroSection />;
      case "chat":
        return <ChatInterface />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900">SiipCoffe</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isBackendConnected === null ? 'bg-gray-400 animate-pulse' :
                  isBackendConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {isBackendConnected === null ? 'Connecting...' :
                   isBackendConnected ? 'AI Barista Online' : 'AI Barista Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wallet />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-14">
        {renderCurrentPage()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-amber-100">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={currentPage === "home" ? "default" : "ghost"}
            onClick={() => setCurrentPage("home")}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-none border-none",
              currentPage === "home"
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                : "hover:bg-amber-50 text-amber-700"
            )}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Button>

          <Button
            variant={currentPage === "chat" ? "default" : "ghost"}
            onClick={() => setCurrentPage("chat")}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-none border-none",
              currentPage === "chat"
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                : "hover:bg-amber-50 text-amber-700"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">AI Barista</span>
          </Button>
        </div>
      </div>
    </div>
  );
}