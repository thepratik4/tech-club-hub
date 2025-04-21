"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast, Toaster } from "sonner";

const OngoingEvents = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [message, setMessage] = useState("");
  const userFullName = user?.fullName || "Any"; // Corrected variable name

  // Fetch ongoing events with proper error handling
  const ongoingEvents = useQuery(api.document.getOngoingAndUpcomingEvents) ?? {
    events: [],
  };
  const registerEvent = useMutation(api.document.registerForEvent);
  console.log(ongoingEvents.events);

  // Function to format date
  const formatDate = (timestamp: string | number | Date) => {
    return new Date(timestamp).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Handle event registration
  const handleRegister = async (eventId) => {
    if (!userId) {
      setMessage("Please login to register for events");
      toast.error("Please login to register for events");
      return;
    }

    try {
      await registerEvent({
        eventId,
        userId,
        userFullName, // Corrected variable name
      });
      setMessage("Successfully registered for the event!");
      toast.success("Successfully registered for the event!");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message || "Failed to register for event");
        toast.error("Failed to register for event");
      } else {
        setMessage("Failed to register for event");
        toast.error("Failed to register for event");
      }
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  // Loading state
  if (ongoingEvents === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    );
  }

  // Destructure events with default empty array
  const { events = [] } = ongoingEvents;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-primary/100">
          Ongoing Events
        </h1>
        <p className="text-gray-600 mt-2 dark:text-primary/50">
          Browse and register for current events
        </p>
      </div>
      {/* 
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700">
          {message}
        </div>
      )} */}

      {events.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No ongoing events at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {event.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      event.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : event.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {event.location}
                    </p>
                    <p>
                      <span className="font-medium">Start:</span>{" "}
                      {formatDate(event.startDate)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span>{" "}
                      {formatDate(event.endDate)}
                    </p>
                    <p>
                      <span className="font-medium">Organizer:</span>{" "}
                      {event.organizer}
                    </p>
                    <p>
                      <span className="font-medium">Capacity:</span>{" "}
                      {event.currentParticipants}/{event.maxParticipants}{" "}
                      participants
                    </p>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <button
                  onClick={() => handleRegister(event._id)}
                  disabled={
                    event.currentParticipants >= event.maxParticipants ||
                    event.registeredUsers?.includes(userId) ||
                    event.status !== "approved"
                  }
                  className={`w-full py-2 mb-0 px-4 rounded-md transition-colors ${
                    event.registeredUsers?.includes(userId)
                      ? "bg-green-100 text-green-800 cursor-not-allowed"
                      : event.currentParticipants >= event.maxParticipants
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : event.status !== "approved"
                          ? "bg-yellow-100 text-yellow-800 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {event.registeredUsers?.includes(userId)
                    ? "✓ Registered"
                    : event.currentParticipants >= event.maxParticipants
                      ? "Event Full"
                      : event.status !== "approved"
                        ? "Pending Approval"
                        : "Register Now"}
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OngoingEvents;
