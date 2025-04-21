"use client";

import {
  BellPlus,
  Calendar,
  EarthLock,
  Group,
  Home,
  Laptop,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

const defaultItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Join Hackathon", url: "#", icon: Laptop },
  { title: "Find RoomMate", url: "#", icon: Group },
  { title: "Collage Event Update", url: "#", icon: Calendar },
];

export function AppSidebar({
  onMenuClick,
}: {
  onMenuClick: (title: string) => void;
}) {
  const { user } = useUser();
  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    if (user?.publicMetadata?.role === "Admin") {
      setItems((prevItems) => {
        if (!prevItems.some((item) => item.title === "Admin-Event")) {
          console.log("User is an admin, adding Admin menu");
          return [
            ...prevItems,
            { title: "Admin-Event", url: "#", icon: EarthLock },
          ];
        }
        return prevItems;
      });
    }
  }, [user]);

  return (
    <Sidebar className="flex flex-col h-full">
      {/* User button at top */}
      <div className="p-4">
        <UserButton afterSignOutUrl="/" />
      </div>

      <SidebarContent className="flex-grow">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl">Error 404 </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex-grow m-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onMenuClick(item.title)}
                      className="flex items-center gap-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarContent>
        <SidebarMenuButton asChild>
          <button
            onClick={() => onMenuClick("Settings")}
            className="flex gap-2 items-center mb-5 mt-auto"
          >
            <Settings />
            <span>Settings</span>
          </button>
        </SidebarMenuButton>
      </SidebarContent>
    </Sidebar>
  );
}
