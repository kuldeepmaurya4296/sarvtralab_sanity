'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Check, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
const heroImage = '/hero-robotics.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={`${heroImage || '/hero-robotics.jpg'}`}
          alt="Students learning robotics with Sarvtra Labs"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/90 to-foreground/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/40 md:bg-primary/20 md:backdrop-blur-sm border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground">CBSE & NEP 2020 Aligned Curriculum</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-background leading-tight mb-6"
          >
            Future-Ready
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              Robotics & Coding
            </span>
            Education for K-12
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-background/80 mb-8 max-w-2xl leading-relaxed"
          >
            India's premier robotics education platform. Hands-on learning with real kits,
            expert instructors, and industry-recognized certifications. Join the movement of future innovators.
          </motion.p>

          {/* EMI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-success/40 md:bg-success/20 md:backdrop-blur-sm border border-success/30 mb-8"
          >
            <div className="flex items-center gap-1 text-success">
              <IndianRupee className="w-5 h-5" />
              <span className="font-bold text-lg">0%</span>
            </div>
            <div className="text-background">
              <span className="font-semibold">No Cost EMI</span>
              <span className="text-background/70"> - Starting ₹4,999/month</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <Link href="/courses">
              <button className="btn-hero-primary group hover:scale-105 hover:shadow-lg transition-all">
                Start Free Robotics Trial
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/courses">
              <button className="btn-hero-outline group hover:scale-105 hover:shadow-lg transition-all">
                View Programs
              </button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-4 mb-8 text-background/90"
          >

            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">4.9/5 Rating</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            {['Robotics Kit Included', 'Live Sessions', 'Certificate', 'Competition Prep'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-background/80">
                <div className="w-5 h-5 rounded-full bg-success/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements - Hidden on mobile for performance */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-20 top-1/4 hidden xl:block pointer-events-none"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl border border-white/20" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-40 bottom-1/4 hidden xl:block pointer-events-none"
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/30 backdrop-blur-xl border border-white/20" />
      </motion.div>
    </section >
  );
};

export default HeroSection;
