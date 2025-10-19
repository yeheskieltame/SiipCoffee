"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, MessageCircle, Wallet, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onboardingSteps = [
    {
      title: "Welcome to SiipCoffe ☕",
      description: "Your premium coffee experience powered by Web3 technology",
      icon: Coffee,
      badge: "Get Started",
    },
    {
      title: "Chat with Our AI Barista 🤖",
      description: "Order naturally through conversation or browse our menu manually",
      icon: MessageCircle,
      badge: "AI Powered",
    },
    {
      title: "Pay with Crypto 💳",
      description: "Seamless blockchain payments with your connected wallet",
      icon: Wallet,
      badge: "Web3 Ready",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentOnboarding = onboardingSteps[currentStep];
  const IconComponent = currentOnboarding.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl shadow-lg">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            SiipCoffe
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Premium coffee ordering experience with AI-powered chat and Web3 payments
          </p>
        </div>

        {/* Onboarding Card */}
        <Card className="mx-auto max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className={`space-y-6 transition-all duration-300 ${isAnimating ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              {/* Icon */}
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full">
                  <IconComponent className="w-8 h-8 text-amber-700" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                    {currentOnboarding.badge}
                  </Badge>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentOnboarding.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentOnboarding.description}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "bg-amber-600 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => {
              // This will navigate to the menu page
              window.location.href = '/menu';
            }}
          >
            Browse Menu
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-amber-200 hover:bg-amber-50 text-amber-700 hover:text-amber-800 transform hover:scale-105 transition-all duration-200"
            onClick={() => {
              // This will navigate to the chat page
              window.location.href = '/chat';
            }}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chatting
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <Coffee className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-sm text-muted-foreground">Carefully selected beans and expert preparation</p>
          </Card>

          <Card className="text-center p-6 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">Natural ordering through intelligent conversation</p>
          </Card>

          <Card className="text-center p-6 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <Wallet className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">Crypto Payments</h3>
            <p className="text-sm text-muted-foreground">Secure and transparent blockchain transactions</p>
          </Card>
        </div>
      </div>
    </div>
  );
}