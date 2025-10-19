"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Coffee, Bot, User, ShoppingCart } from "lucide-react";
import { MenuItem } from "@/types/coffee";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  items?: MenuItem[];
  total?: number;
}

interface ChatInterfaceProps {
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export default function ChatInterface({ onAddToCart }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI barista ☕. I can help you order coffee, answer questions about our menu, or assist with anything else. What would you like today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        items: data.suggestedItems || [],
        total: data.total,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. You can try again or browse our menu directly. Would you like me to show you our popular items?",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: "Show me the menu", icon: Coffee },
    { text: "What's popular today?", icon: Coffee },
    { text: "I want an iced coffee", icon: Coffee },
    { text: "Tell me about pastries", icon: Coffee },
  ];

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
                    {message.items.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-amber-50 border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => onAddToCart(item, 1)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-amber-700">{formatPrice(item.price)}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-1 text-xs bg-white hover:bg-amber-50 border-amber-300"
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-white/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-amber-700 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(action.text)}
                  className="text-xs bg-white border-amber-200 hover:bg-amber-50"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-amber-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
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
          <p className="text-xs text-amber-600 mt-2 text-center">
            Powered by AI • Try asking for recommendations or describing what you'd like
          </p>
        </div>
      </div>
    </div>
  );
}