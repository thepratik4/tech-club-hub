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

const EventAdmin = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  const createEvent = useMutation(api.document.createCollegeEvent);
  const updateEvent = useMutation(api.document.updateCollegeEvent);
  const ongoing = useQuery(api.document.getOngoingAndUpcomingEvents);
  const { toast } = useToast();
  const [editingEventId, setEditingEventId] = useState<Id<"sema"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [showParticipants, setShowParticipants] = useState(false); // State for showing participants
  const [selectedEventId, setSelectedEventId] = useState<Id<"sema"> | null>(
    null
  ); // Track selected event ID

  // Fetch participants when an event is selected
  const getparName = useQuery(
    api.document.getRegisteredUserNames,
    selectedEventId ? { eventId: selectedEventId } : "skip" // Skip the query if selectedEventId is null
  );
  function onClick() {
    console.log("clicked");
    console.log(getparName?.registeredUserNames);
  }

  const participantsQuery = useQuery(
    api.document.getRegisteredUserNames,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    type: "academic" | "sports" | "cultural" | "other";
    maxParticipants: number;
    organizer: string;
    contactInfo: string;
    category: string;
    tags: string;
    attachments: string;
    status: "pending" | "approved" | "rejected"; // Added status field
  }>({
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
    status: "pending", // Added status field
  });

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
      status: event.status || "pending", // Added status handling
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole !== "Admin") {
      setMessage("Only admins can manage events.");
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) {
        setMessage("User ID is not available.");
        return;
      }

      const startTimestamp = new Date(formData.startDate).getTime();
      const endTimestamp = new Date(formData.endDate).getTime();

      const eventData = {
        userId,
        title: formData.title,
        description: formData.description,
        startDate: startTimestamp,
        endDate: endTimestamp,
        location: formData.location,
        type: formData.type as "academic" | "sports" | "cultural" | "other",
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
        status: formData.status, // Added status to event data
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
        status: "pending", // Reset status
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
                    status: "pending", // Reset status
                  });
                }
              }}
              variant="outline"
            >
              {showForm ? "Cancel" : "Create New Event"}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Existing form fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Added Status field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Rest of the existing form fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Event Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Organizer</label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Contact Info
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Attachments (comma-separated URLs)
                </label>
                <input
                  type="text"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="url1, url2, url3"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingEventId ? "Update Event" : "Create Event"}
              </Button>
            </form>
          )}

          {/* Display existing events with status */}
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
                      <div className="flex items-center space-x-2 ml-auto mr-5">
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
                              <div className="mt-2">
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
                                  <p className="text-sm text-muted-foreground">
                                    No participants registered yet.
                                  </p>
                                )}
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex items-center space-x-4">
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

export default EventAdmin;
