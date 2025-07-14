import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { CtaSection } from '@/components/cta-section';
import { ResearchAssistantSection } from '@/components/research-assistant-section';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
        <ResearchAssistantSection />
      </main>
      <Footer />
    </div>
  );
}
