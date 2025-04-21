"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, Bell } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const HomePage = () => {
  const { user } = useUser();
  const ongoing = useQuery(api.document.getOngoingAndUpcomingEvents);
  const [showAll, setShowAll] = useState(false);

  // Quick stats for the dashboard
  const stats = [
    {
      title: "Upcoming Events",
      value: ongoing?.events?.length || 0,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "My Registrations",
      value: "5",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Events",
      value: "3",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Notifications",
      value: "2",
      icon: Bell,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your campus community
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ongoing?.events
              ?.slice(0, showAll ? undefined : 3)
              .map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        event.type === "academic"
                          ? "bg-blue-100"
                          : event.type === "sports"
                            ? "bg-green-100"
                            : "bg-purple-100"
                      }`}
                    >
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()} at{" "}
                        {event.location}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
          </div>
          {ongoing?.events && ongoing.events.length > 3 && (
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "View All Events"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Find Team Members
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              View Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
