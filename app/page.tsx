"use client";

import { Button } from "@/components/ui/button";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Users, Calendar } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Error 404</h1>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center bg-gradient-to-b from-primary/20 to-background">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect College Match
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with roommates, discover hackathon teams, and join campus
              events - all in one place.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 container mx-auto grid md:grid-cols-3 p-5  gap-8">
          {features.map(({ title, description, icon: Icon, color }, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition">
              <CardHeader className="flex items-center gap-4">
                <Icon className={cn("w-10 h-10", color)} />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted text-center">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students already using CampusConnect
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="gap-2">
                  Sign Up Now <ArrowRight className="w-4 h-4" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center">
        <div className="container mx-auto">
          <p>© 2025 Error 404. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Find Roommates",
    description:
      "Match with compatible roommates based on your lifestyle and campus location.",
    icon: Users,
    color: "text-green-500",
  },
  {
    title: "Hackathon Teams",
    description:
      "Join or create hackathon teams, showcase your skills, and collaborate on projects.",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Campus Events",
    description:
      "Stay updated with the latest campus events, workshops, and networking opportunities.",
    icon: Calendar,
    color: "text-purple-500",
  },
];
