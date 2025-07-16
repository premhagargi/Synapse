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
      const t1 = gsap.timeline();
      t1.from("#intro-slider", {
        xPercent: "-100",
        duration: 1.3,
        delay: 0.3,
      }).from(["#title-1", "#title-2", "#title-3"], {
        opacity: 0,
        y: "+=30",
        stagger: 0.5,
      }).to(["#title-1", "#title-2", "#title-3"], {
        opacity: 0,
        y: "-=30",
        delay: 0.3,
        stagger: 0.5,
      }).to("#intro-slider", {
        xPercent: "-100",
        duration: 1.3,
      }).from("#welcome", {
        opacity: 0,
        duration: 0.5,
      }).from("#subtitle", {
        opacity: 0,
        y: "+=20",
        duration: 0.5,
        delay: 0.2
      }).from("#cta-button", {
        opacity: 0,
        y: "+=20",
        duration: 0.5,
        delay: 0.2
      });
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative text-center" ref={comp}>
      <div id="intro-slider" className="h-screen p-10 bg-gray-50 text-gray-900 absolute top-0 left-0 font-spaceGrotesk z-20 w-full flex flex-col gap-10 tracking-tight">
        <h1 className="text-8xl" id="title-1">Democratize AI.</h1>
        <h1 className="text-8xl" id="title-2">Ensure Privacy.</h1>
        <h1 className="text-8xl" id="title-3">Lower Costs.</h1>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <h1 id="welcome" className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
          Synapse AI
        </h1>
        <p id="subtitle" className="text-xl md:text-2xl text-neutral-300 max-w-3xl">
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
