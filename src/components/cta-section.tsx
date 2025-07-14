"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

function EmailForm({ type }: { type: 'access' | 'contribute' }) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: FormValues) {
    console.log(data);
    toast({
      title: "Thank you for your interest!",
      description: `We've received your email and will be in touch soon.`,
    });
    form.reset();
  }

  const title = type === 'access' ? 'Get Cheaper AI Model Access' : 'Contribute and Earn';
  const description = type === 'access' 
    ? 'Sign up to get early access to affordable AI models.' 
    : 'Join our network of compute providers and start earning rewards.';
  const buttonText = type === 'access' ? 'Request Access' : 'Become a Contributor';

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">{buttonText}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function CtaSection() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container max-w-3xl px-4 md:px-6">
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access">Get Early Access</TabsTrigger>
            <TabsTrigger value="contribute">Contribute & Earn</TabsTrigger>
          </TabsList>
          <TabsContent value="access" className="mt-6">
            <EmailForm type="access" />
          </TabsContent>
          <TabsContent value="contribute" className="mt-6">
            <EmailForm type="contribute" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
