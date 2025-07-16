"use client"
import React from 'react';
import BackgroundPaths from "@/components/background-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Atom, Globe, Scale, ShieldCheck, Zap, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeInOut" }
};

export default function Home() {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const gameChangerFeatures = [
    { icon: <Globe className="w-8 h-8 text-primary" />, title: "Democratizes AI Access", description: "Lowers the barrier for startups, researchers, and individuals to access high-quality AI without expensive infrastructure." },
    { icon: <Scale className="w-8 h-8 text-primary" />, title: "Scalability", description: "Harnesses underutilized global compute resources, creating a massive, cost-effective compute pool." },
    { icon: <ShieldCheck className="w-8 h-8 text-primary" />, title: "Privacy and Control", description: "Users can train models on local data without sharing it, addressing privacy concerns in sensitive industries." },
    { icon: <Zap className="w-8 h-8 text-primary" />, title: "Sustainability", description: "Optimizes resource use, reducing the environmental impact of AI training compared to centralized data centers." },
  ];

  const whyBlockchainFeatures = [
    { title: "Trust and Transparency", description: "Blockchain ensures a tamper-proof ledger for tracking compute contributions, model usage, and payments. Smart contracts automate trustless transactions." },
    { title: "Incentivization", description: "A token-based economy rewards users for sharing compute resources, incentivizing participation and creating a scalable compute pool." },
    { title: "Security", description: "Decentralization reduces reliance on vulnerable central servers. Blockchain’s cryptography ensures secure model and data exchanges." },
    { title: "Accessibility and Fairness", description: "Allows anyone with hardware to participate, democratizing access to AI and reducing costs." },
    { title: "Data Sovereignty", description: "Lets users keep data local while contributing to model training, ensuring privacy and compliance with regulations like GDPR." },
    { title: "Resilience", description: "A decentralized network is less prone to single points of failure, ensuring high uptime and reliability for AI services." },
  ];

  return (
    <div className="bg-background text-foreground">
      <BackgroundPaths onButtonClick={scrollToContent} />
      
      <main ref={contentRef} className="container mx-auto px-4 md:px-6 py-24 sm:py-32">
        <motion.section
          id="about"
          className="text-center max-w-4xl mx-auto mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">A New Era of AI Collaboration</h2>
          <p className="text-lg text-muted-foreground">
            Synapse AI is a decentralized network that allows anyone to contribute computational resources to train and run AI models collaboratively. We're creating a fair, open, and powerful marketplace for compute power and AI services.
          </p>
        </motion.section>

        <motion.section
          id="features"
          className="mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
        >
          <h2 className="text-3xl font-bold text-center tracking-tighter sm:text-4xl md:text-5xl mb-12">Why It’s a Game-Changer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gameChangerFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="blockchain"
          className="max-w-4xl mx-auto mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold text-center tracking-tighter sm:text-4xl md:text-5xl mb-12">Powered by Decentralized Technology</h2>
          <Accordion type="single" collapsible className="w-full">
            {whyBlockchainFeatures.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-headline hover:no-underline">{item.title}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {item.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        <motion.section
          id="join"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
            <h2 className="text-3xl font-bold text-center tracking-tighter sm:text-4xl md:text-5xl mb-12">Join the Revolution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full w-fit">
                        <Atom className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-headline">Access Cheaper AI</CardTitle>
                        <CardDescription>Get early access to our platform and run AI models at a fraction of the cost.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                   <form className="flex space-x-2">
                      <Input type="email" placeholder="Enter your email" className="flex-1" />
                      <Button type="submit" variant="default">Get Access</Button>
                    </form>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full w-fit">
                        <Cpu className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-headline">Contribute Compute</CardTitle>
                        <CardDescription>Earn rewards by contributing your idle compute power to the network.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                    <form className="flex space-x-2">
                        <Input type="email" placeholder="Enter your email" className="flex-1" />
                        <Button type="submit" variant="secondary">Start Earning</Button>
                    </form>
                </CardContent>
              </Card>
            </div>
        </motion.section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Synapse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
