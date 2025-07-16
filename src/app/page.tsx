"use client"

import React, { useRef } from 'react';
import Hero from '@/components/landing/hero';
import Content from '@/components/landing/content';

export default function Home() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white">
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <Hero onLearnMoreClick={handleScrollToContent} />
      </div>
      <div ref={contentRef}>
        <Content />
      </div>
    </div>
  )
}
