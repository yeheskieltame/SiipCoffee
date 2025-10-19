"use client";

import { Vortex } from "@/components/ui/vortex";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

const coffeeImages = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511920164177-0a5a3a6a6f7a?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1497515114629-f71d768fd14c?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-561c5da48a23?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517831907240-edb9c511d8e8?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498807849765-dba1c932408b?w=500&h=400&fit=crop",
];

const heroWords = [
  {
    text: "Welcome",
    className: "text-tech-600 dark:text-tech-400",
  },
  {
    text: "to",
    className: "text-tech-700 dark:text-tech-300",
  },
  {
    text: "SiipCoffee",
    className: "text-tech-gradient font-bold",
  },
];

const features = [
  {
    title: "AI-Powered",
    description: "Advanced NLP technology for natural coffee ordering",
    icon: "🤖"
  },
  {
    title: "Smart Interface",
    description: "Intuitive design with cutting-edge user experience",
    icon: "⚡"
  },
  {
    title: "Real-time Processing",
    description: "Instant responses with intelligent order management",
    icon: "🚀"
  },
  {
    title: "Future-Ready",
    description: "Built with modern tech for next-gen experiences",
    icon: "✨"
  }
];

export default function HomePage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span className="text-xl font-bold text-tech-gradient">SiipCoffee</span>
            </div>

            <div className="hidden md:block">
              <Menu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="Menu">
                  <div className="text-sm grid grid-cols-2 gap-2 p-4 w-[400px]">
                    <ProductItem
                      title="Espresso"
                      description="Rich and bold"
                      href="#"
                      src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=140&h=70&fit=crop"
                    />
                    <ProductItem
                      title="Cappuccino"
                      description="Creamy perfection"
                      href="#"
                      src="https://images.unsplash.com/photo-1511920164177-0a5a3a6a6f7a?w=140&h=70&fit=crop"
                    />
                  </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="About">
                  <div className="p-4 w-[300px]">
                    <p className="text-sm text-muted-foreground">
                      Experience the future of AI-powered coffee ordering with cutting-edge technology.
                    </p>
                  </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Technology">
                  <div className="p-4 w-[350px]">
                    <p className="text-sm text-muted-foreground">
                      Powered by advanced NLP and real-time processing for intelligent conversations.
                    </p>
                  </div>
                </MenuItem>
              </Menu>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/chat">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="bg-tech-gradient text-white font-semibold flex items-center space-x-2"
                >
                  <span>Launch App</span>
                  <span>🚀</span>
                </HoverBorderGradient>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Vortex Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        <Vortex
          backgroundColor="black"
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
          containerClassName="h-screen"
          particleCount={700}
          baseHue={25}
          baseSpeed={0.5}
          rangeSpeed={1.0}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center z-10"
          >
            <div className="mb-6">
              <TypewriterEffect words={heroWords} />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-tech-600 dark:text-tech-300 mb-8 max-w-2xl mx-auto"
            >
              Experience the future of intelligent ordering with our advanced AI technology.
              Powered by cutting-edge NLP for seamless, natural conversations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/chat">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="bg-tech-gradient text-white font-semibold px-8 py-3 text-lg"
                >
                  Launch App
                </HoverBorderGradient>
              </Link>

              <button className="px-8 py-3 text-lg border-2 border-tech-300 rounded-full text-tech-700 hover:bg-tech-100 dark:text-tech-300 dark:border-tech-600 dark:hover:bg-tech-800 transition-colors">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </Vortex>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-tech-gradient">
              Why Choose SiipCoffee?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience next-generation ordering powered by advanced AI and cutting-edge technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105 border border-border"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-tech-gradient">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Marquee Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-tech-gradient">
              Experience Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our intelligent ordering system and modern interface design.
            </p>
          </motion.div>

          <ThreeDMarquee images={coffeeImages} className="rounded-2xl" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative bg-tech-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white glow-text-tech">
              Ready to Experience Future-Ready Ordering?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the revolution of intelligent ordering powered by advanced AI and cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/chat">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="bg-background text-foreground font-semibold px-8 py-3 text-lg"
                >
                  Get Started Now
                </HoverBorderGradient>
              </Link>

              <button className="px-8 py-3 text-lg bg-transparent text-white border-2 border-white/50 rounded-full hover:bg-white/10 transition-colors">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🤖</span>
                <span className="text-xl font-bold text-tech-gradient">SiipCoffee</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Next-gen ordering powered by advanced AI technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-tech-700 dark:text-tech-300">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Technology</li>
                <li>AI Engine</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-tech-700 dark:text-tech-300">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-tech-700 dark:text-tech-300">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 SiipCoffee. Built with cutting-edge technology.
          </div>
        </div>
      </footer>
    </div>
  );
}