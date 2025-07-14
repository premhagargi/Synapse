import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, DollarSign, Globe } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: 'Low-Cost Inference',
      description: 'Access state-of-the-art AI models at a fraction of the cost of centralized providers.',
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: 'Decentralized Network',
      description: 'Our platform is powered by a global network of compute providers, ensuring high availability and censorship resistance.',
    },
    {
      icon: <Cpu className="w-8 h-8 text-primary" />,
      title: 'Earn Rewards',
      description: 'Contribute your idle compute power to the network and earn rewards.',
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Key Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore the core benefits of the Synapse AI platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          {features.map((feature, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-background/50">
              <CardHeader className="flex flex-col items-center text-center">
                {feature.icon}
                <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
