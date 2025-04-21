"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const test = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  const createEvent = useMutation(api.document.createCollegeEvent);
  const updateEvent = useMutation(api.document.updateCollegeEvent);
  const ongoing = useQuery(api.document.getOngoingAndUpcomingEvents);
  const { toast } = useToast();
  const [editingEventId, setEditingEventId] = useState<Id<"sema"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<Id<"sema"> | null>(
    null
  );

  // Fetch participants when an event is selected
  const participantsQuery = useQuery(
    api.document.getRegisteredUserNames,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    type: "academic" as "academic" | "sports" | "cultural" | "other",
    maxParticipants: 0,
    organizer: "",
    contactInfo: "",
    category: "",
    tags: "",
    attachments: "",
    status: "pending" as "pending" | "approved" | "rejected",
  });

  // Your existing handlers (handleInputChange, handleEditEvent, handleSubmit)...
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditEvent = (event: any) => {
    setEditingEventId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      location: event.location,
      type: event.type,
      maxParticipants: event.maxParticipants,
      organizer: event.organizer || "",
      contactInfo: event.contactInfo || "",
      category: event.category || "",
      tags: event.tags?.join(", ") || "",
      attachments: event.attachments?.join(", ") || "",
      status: event.status || "pending",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole !== "Admin") {
      toast({
        title: "Error",
        description: "Only admins can manage events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID is not available.",
          variant: "destructive",
        });
        return;
      }

      const eventData = {
        userId,
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        location: formData.location,
        type: formData.type,
        maxParticipants: Number(formData.maxParticipants),
        organizer: formData.organizer,
        contactInfo: formData.contactInfo,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        attachments: formData.attachments
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
        status: formData.status,
      };

      if (editingEventId) {
        await updateEvent({
          eventId: editingEventId,
          ...eventData,
        });
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
      } else {
        await createEvent(eventData);
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
      }

      // Reset form and state
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        type: "academic",
        maxParticipants: 0,
        organizer: "",
        contactInfo: "",
        category: "",
        tags: "",
        attachments: "",
        status: "pending",
      });
      setEditingEventId(null);
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: editingEventId
          ? "Error updating event."
          : "Error creating event.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {userRole === "Admin" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {editingEventId ? "Edit Event" : "Event Management"}
            </h1>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingEventId(null);
                  setFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    location: "",
                    type: "academic",
                    maxParticipants: 0,
                    organizer: "",
                    contactInfo: "",
                    category: "",
                    tags: "",
                    attachments: "",
                    status: "pending",
                  });
                }
              }}
              variant="outline"
            >
              {showForm ? "Cancel" : "Create New Event"}
            </Button>
          </div>

          {/* Your existing form JSX */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... (keep your existing form fields) ... */}
            </form>
          )}

          {/* Display existing events with participant dialog */}
          {!showForm && ongoing?.events && ongoing.events.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold">Existing Events</h2>
              <div className="grid gap-4">
                {ongoing.events.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Location: {event.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(event.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {event.status || "pending"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedEventId(event._id)}
                              variant="outline"
                              size="sm"
                            >
                              View Participants
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Participants - {event.title}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {participantsQuery?.registeredUserNames ? (
                                  <ul className="space-y-1">
                                    {participantsQuery.registeredUserNames.map(
                                      (name, index) => (
                                        <li key={index} className="text-sm">
                                          {index + 1}. {name}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  "No participants registered yet."
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          onClick={() => handleEditEvent(event)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 bg-gray-100 rounded">
          <p className="text-gray-700">
            You need admin privileges to access this page.
          </p>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default test;
