"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';

interface HeroProps {
  onLearnMoreClick: () => void;
}

export default function Hero({ onLearnMoreClick }: HeroProps) {
  const comp = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Animation for the main hero content
      gsap.from(["#welcome", "#subtitle", "#cta-button"], {
        opacity: 0,
        y: "+=30",
        duration: 1,
        stagger: 0.3,
        delay: 0.5,
        ease: 'power3.out'
      });
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative text-center" ref={comp}>
      <div className="flex flex-col items-center space-y-8">
        <h1 id="welcome" className="text-6xl md:text-8xl font-bold tracking-tighter text-white">
          Synapse AI
        </h1>
        <p id="subtitle" className="text-xl md:text-2xl text-white max-w-3xl">
          The future of AI is decentralized. Access affordable, privacy-focused inference powered by a global network of community hardware.
        </p>
        <div id="cta-button">
          <Button
            size="lg"
            className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full text-lg px-8 py-6 transition-transform duration-300 hover:scale-105"
            onClick={onLearnMoreClick}
          >
            Learn More <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
