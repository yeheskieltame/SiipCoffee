"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
  menuData?: {
    [category: string]: Array<{
      id: string;
      name: string;
      price: number;
      description: string;
    }>;
  };
  total?: number;
  receipt?: {
    order_id: string;
    items: string[];
    total_price: number;
    payment_method: string;
    timestamp: string;
    message: string;
  };
}

// Detect if message contains receipt-like content
const isReceiptMessage = (text: string) => {
  return text.includes('ORDER RECEIPT') || text.includes('Order Number') || text.includes('Total:');
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with greeting from backend
  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
    }
  }, [isInitialized]);

  const initializeChat = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "hello" }),
      });

      if (response.ok) {
        const data = await response.json();
        const greetingMessage: Message = {
          id: Date.now().toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
          items: data.suggested_items || [],
          menuData: data.menu_data || undefined,
        };
        setMessages([greetingMessage]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      // Show connection error without fallback message
      setIsInitialized(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the backend NLP API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
        items: data.suggested_items || [],
        menuData: data.menu_data || undefined,
        total: data.total,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Don't show fallback messages - let user try again
      // The error will be visible in console for debugging
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-amber-900">AI Barista</h1>
              <p className="text-sm text-amber-600">Always ready to serve</p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700">
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } animate-slide-up`}
            >
              {message.sender === "bot" && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-800 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-md lg:max-w-lg xl:max-w-xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                    : "bg-white border border-amber-100 text-gray-800"
                } rounded-2xl px-4 py-3 shadow-sm`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>

                {/* Show suggested items if any */}
                {message.items && message.items.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-amber-600 mb-2">💡 You can order any of these by telling me what you&apos;d like:</p>
                    {message.items.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-amber-900">{item.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="font-semibold text-amber-700">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Show full menu data if available */}
                {message.menuData && (
                  <div className="mt-4 space-y-4">
                    <p className="text-xs font-semibold text-amber-700 mb-3">📋 Complete Menu:</p>
                    {Object.entries(message.menuData).map(([category, items]) => (
                      category !== 'order_info' && category !== 'food' && items.length > 0 && (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-amber-900 capitalize">
                              {category.replace('_', ' ')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {items.length} items
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                            {items.map((item) => (
                              <Card
                                key={item.id}
                                className="bg-white border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <CardContent className="p-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-xs font-medium text-gray-800 truncate">
                                        {item.name}
                                      </h5>
                                      <p className="text-xs text-gray-500 truncate">
                                        {item.description}
                                      </p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 ml-2 whitespace-nowrap">
                                      {formatPrice(item.price)}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Show total if available */}
                {message.total && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-bold">{formatPrice(message.total)}</span>
                    </div>
                  </div>
                )}

                {/* Show receipt if available or detected in message */}
                {(message.receipt || (message.sender === "bot" && isReceiptMessage(message.text))) && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-bold text-green-800">📋 Order Receipt</h4>
                      {message.receipt && (
                        <p className="text-xs text-green-600">Order #{message.receipt.order_id}</p>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {message.text}
                    </div>

                    {message.receipt && (
                      <>
                        <div className="border-t border-green-200 pt-3 mt-3">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Payment:</span>
                            <span>{message.receipt.payment_method}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Time:</span>
                            <span>{message.receipt.timestamp}</span>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-green-100 rounded-lg text-center">
                          <p className="text-xs font-medium text-green-800">
                            ✅ Order completed successfully!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.sender === "user" && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-amber-100 text-amber-700">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-800 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-amber-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

  
      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-amber-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
                  </div>
      </div>
    </div>
  );
}