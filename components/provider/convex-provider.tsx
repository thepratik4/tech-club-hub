"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import {
  ClerkProvider,
  useAuth,
  useUser,
  RedirectToSignIn,
  SignedOut,
} from "@clerk/clerk-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const ConvexClientProvider = ({ children }: { children: ReactNode }) => {
  const { setTheme } = useTheme();
  const [actualTheme, setActualTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("jotion-theme");
    setActualTheme(storedTheme || "system");
    setTheme(storedTheme || "system");
  }, [setTheme]);

  return (
    <ClerkProvider
      appearance={{}}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <AuthCheck>{children}</AuthCheck>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

const AuthCheck = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost = window.location.hostname === "localhost";

      if (!isLocalhost && isLoaded && isSignedIn && user) {
        const email = user.primaryEmailAddress?.emailAddress || "";
        console.log("User Email:", email); // Debugging

        if (!email.endsWith("@viit.ac.in")) {
          setTimeout(() => {
            alert("Access Denied: Only VIIT students can log in."); // Ensure alert is shown first
            signOut().then(() => router.push("/"));
          }, 100); // Short delay to allow the alert to appear
        }
      }
    }
  }, [isSignedIn, isLoaded, user, router, signOut]);

  if (!isLoaded) return null; // Wait for auth to load

  const isLocalhost =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  if (
    isSignedIn &&
    user &&
    !user.primaryEmailAddress?.emailAddress.endsWith("@viit.ac.in")
  ) {
    alert("Access Denied: Only VIIT students can log in.");
    signOut().then(() => router.push("/"));

    return null; // Prevent unauthorized access before useEffect executes
  }

  return isLocalhost ||
    (isSignedIn &&
      user?.primaryEmailAddress?.emailAddress.endsWith("@viit.ac.in")) ? (
    children
  ) : (
    <RedirectToSignIn />
  );
};

export default ConvexClientProvider;
