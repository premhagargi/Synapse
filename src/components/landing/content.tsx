"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, ArrowRight, Server, Globe, Cpu } from "lucide-react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <Card className="feature-card bg-neutral-900/50 border-primary/20 backdrop-blur-sm text-center p-6 flex flex-col items-center">
    <CardHeader className="p-0 mb-4">
      <div className="bg-primary/10 text-primary p-4 rounded-full">
        {icon}
      </div>
    </CardHeader>
    <CardTitle className="text-2xl font-semibold mb-2 text-white">{title}</CardTitle>
    <CardContent className="p-0 text-white">
      {children}
    </CardContent>
  </Card>
);

const HowItWorksStep = ({ num, title, children }: { num: string, title: string, children: React.ReactNode }) => (
  <div className="how-step flex items-start space-x-6">
    <div className="flex-shrink-0 text-6xl font-bold text-primary/50">{num}</div>
    <div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white">{children}</p>
    </div>
  </div>
);

export default function Content() {
  const comp = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Animate section titles
      gsap.utils.toArray('.section-title').forEach((el) => {
        gsap.from(el as Element, {
          scrollTrigger: {
            trigger: el as Element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 50,
          duration: 1,
        });
      });

      // Animate feature cards
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Animate how it works steps
      gsap.utils.toArray('.how-step').forEach((el) => {
        gsap.from(el as Element, {
          scrollTrigger: {
            trigger: el as Element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          x: -50,
          duration: 1,
          ease: 'power3.out'
        });
      });

      // Animate CTA sections
      gsap.from('.cta-section', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.95,
        y: 50,
        duration: 1,
        stagger: 0.3,
        ease: 'expo.out'
      });
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className="bg-black text-white py-24 sm:py-32">
      <div className="container mx-auto px-6 lg:px-8 space-y-32">
        {/* How It Works Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="section-title text-4xl md:text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-lg text-white max-w-2xl mx-auto">
              Our platform connects those who need AI processing with a global network of community-run hardware.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-1 gap-16">
            <HowItWorksStep num="01" title="Submit Your Task">
              Developers and businesses submit AI inference tasks (e.g., text generation, image analysis) through our simple API.
            </HowItWorksStep>
            <HowItWorksStep num="02" title="Decentralized Processing">
              The task is broken down and securely distributed across our P2P network of volunteer nodes. Computation happens on community devices, not in a central server.
            </HowItWorksStep>
            <HowItWorksStep num="03" title="Earn Rewards">
              Node contributors earn points for their processing power. These points can be redeemed for services or, in the future, converted to cryptocurrency.
            </HowItWorksStep>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="section-title text-4xl md:text-5xl font-bold tracking-tight">A New Paradigm for AI</h2>
            <p className="mt-4 text-lg text-white max-w-2xl mx-auto">
              We're building a more accessible, private, and cost-effective AI ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 features-grid">
            <FeatureCard icon={<DollarSign className="h-8 w-8" />} title="Radically Lower Costs">
              By using a network of underutilized hardware, we cut down on expensive cloud infrastructure, making AI accessible for everyone.
            </FeatureCard>
            <FeatureCard icon={<Globe className="h-8 w-8" />} title="Community Powered">
              Our strength comes from our decentralized network. More contributors mean more power, lower latency, and greater resilience.
            </FeatureCard>
            <FeatureCard icon={<Server className="h-8 w-8" />} title="Privacy by Design">
              Tasks are processed on volunteer nodes without your raw data ever leaving your control, ensuring privacy for sensitive applications.
            </FeatureCard>
          </div>
        </section>

        {/* Dual CTA Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* CTA for AI Users */}
          <div className="cta-section bg-neutral-900/50 border border-primary/20 rounded-2xl p-8 lg:p-12 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white">Access Affordable AI</h3>
              <p className="mt-4 text-white">
                Get early access to low-cost, privacy-preserving AI inference. Perfect for startups, developers, and small businesses.
              </p>
            </div>
            <form className="mt-8 flex flex-col sm:flex-row gap-3">
              <Input type="email" placeholder="Enter your email" className="bg-neutral-800 border-neutral-700 text-white h-12 flex-grow" />
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                Request Access <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* CTA for Compute Providers */}
          <div className="cta-section bg-accent/20 border border-accent/30 rounded-2xl p-8 lg:p-12 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white">Contribute & Earn</h3>
              <p className="mt-4 text-white">
                Have an idle GPU or laptop? Join our network, contribute your compute power, and start earning rewards today.
              </p>
            </div>
            <form className="mt-8 flex flex-col sm:flex-row gap-3">
              <Input type="email" placeholder="Enter your email" className="bg-neutral-800 border-neutral-700 text-white h-12 flex-grow" />
              <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12">
                Join the Network <Cpu className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
