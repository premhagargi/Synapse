"use client"

import React, { useRef } from 'react';
import NeonIsometricMaze from "@/components/neon-isometric-maze"
import Hero from '@/components/landing/hero';
import Content from '@/components/landing/content';

export default function Home() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white">
      <div className="relative h-screen w-full overflow-hidden">
        <NeonIsometricMaze />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Hero onLearnMoreClick={handleScrollToContent} />
        </div>
      </div>
      <div ref={contentRef}>
        <Content />
      </div>
    </div>
  )
}
