"use client";

import { AppSidebar } from "@/components/app-sidebar";
import DarkMode from "@/components/dark-mode";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { useState } from "react";
import HomeDash from "./(Components)/EventAdmin";
import Hackthon from "./(Components)/Hackthon";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Calendar, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import CollageEvent from "./(Components)/collageEvent";
import EventAdmin from "./(Components)/EventAdmin";
import Test from "./(Components)/test";
import FlatProfile from "./(Components)/flat-profile";
import HomePage from "./(Components)/Homepage";

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("Home");

  // States to hold the form input values
  const [hackathonName, setHackathonName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null); // Use Date | null for date state

  // Function to map selected menu to its corresponding component
  const renderContent = () => {
    switch (selectedMenu) {
      case "Home":
        return <HomePage />;
      case "Join Hackathon":
        return <Hackthon />;
      case "Find RoomMate":
        return <FlatProfile />;

      case "Collage Event Update":
        return <CollageEvent />;

      case "Event Update":
        return <Test />;
      case "Admin-Event":
        return <EventAdmin />;
      default:
        return <HomeDash />;
    }
  };

  // Handle form submission and send data to backend
  const handleSubmit = async () => {
    if (!hackathonName || !description || !date) {
      console.error("All fields must be filled");
      return; // Do not submit if any field is empty
    }

    const data = {
      hackathonName,
      description,
      date: date.toISOString(), // Convert date to ISO string format
    };

    try {
      const response = await fetch("/api/create-hackathon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Hackathon created successfully");
        // Add a success message or redirect here
      } else {
        console.error("Error creating hackathon");
        // Handle error
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="bg-primary/5 dark:bg-[#030816]">
        <SidebarProvider>
          <AppSidebar onMenuClick={setSelectedMenu} />
          <SidebarTrigger />
        </SidebarProvider>
      </div>

      <div className="flex-1  bg-primary/5 dark:bg-[#030816] ">
        {/* Dark mode button fixed at top-right corner */}
        <div className="w-full h-full flex pt-3">
          <div className="absolute flex gap-3 top-3 right-16"></div>

          <div className="absolute t-10 right-4 z-50">
            <DarkMode />
          </div>
          <div className="flex flex-1 flex-col gap-0 p-2">
            <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
              {/* Render the content based on selected menu */}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
