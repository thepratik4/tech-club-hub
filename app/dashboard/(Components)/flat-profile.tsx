import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MapPin,
  Wifi,
  Flame,
  Car,
  Users,
  X,
  Plus,
  Check,
  Building,
  Trash2,
  Home,
  IndianRupee,
  UserPlus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const flatProfileSchema = z.object({
  houseName: z
    .string()
    .min(3, { message: "House name must be at least 3 characters." }),
  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters." }),
  totalRent: z
    .number()
    .min(1000, { message: "Total rent must be at least ₹1,000." }),
  maxOccupancy: z
    .number()
    .min(1, { message: "Maximum occupancy must be at least 1." })
    .max(10, { message: "Maximum occupancy cannot exceed 10." }),
  location: z
    .string()
    .min(5, { message: "Location must be at least 5 characters." }),
  distanceFromCollege: z
    .number()
    .min(0, { message: "Distance must be a positive number." }),
  hasWifi: z.boolean(),
  hasGeyser: z.boolean(),
  hasParking: z.boolean(),
  allowsGuests: z.boolean(),
});

export function FlatProfile() {
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [appliedProfiles, setAppliedProfiles] = useState(new Set());

  const addFlatProfile = useMutation(api.flat.addFlatProfile);
  const deleteFlatProfile = useMutation(api.flat.deleteFlatProfile);
  const flatProfile = useQuery(api.flat.getFlatProfiles);

  const form = useForm({
    resolver: zodResolver(flatProfileSchema),
    defaultValues: {
      houseName: "",
      address: "",
      totalRent: 0,
      maxOccupancy: 1,
      location: "",
      distanceFromCollege: 0,
      hasWifi: false,
      hasGeyser: false,
      hasParking: false,
      allowsGuests: false,
    },
  });

  const handleDelete = async (profileId) => {
    try {
      await deleteFlatProfile({ id: profileId });
      toast.success("Profile Deleted", {
        description: "Flat profile has been deleted successfully.",
        duration: 3000,
      });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete flat profile. Please try again.",
        duration: 4000,
      });
    }
  };

  const onSubmit = async (values) => {
    try {
      await addFlatProfile(values);
      toast.success("Success!", {
        description: "Flat profile has been created successfully.",
        duration: 3000,
      });
      form.reset();
      setShowForm(false);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create flat profile. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleApply = (profileId) => {
    setAppliedProfiles((prev) => new Set([...prev, profileId]));
    toast.success("Application Sent!", {
      description:
        "Your interest has been registered. The owner will contact you soon.",
      duration: 3000,
    });
  };

  const IconWithText = ({ value, Icon, label }) => (
    <div
      className={`flex items-center gap-3 text-sm p-2 rounded-md ${
        value
          ? "bg-green-50 dark:bg-green-900/30"
          : "bg-red-50 dark:bg-red-900/30"
      }`}
    >
      <Icon size={18} className={value ? "text-green-500" : "text-red-500"} />
      <span className="font-medium">
        {label}
        <span className="ml-2">
          {value ? (
            <Check size={16} className="inline text-green-500" />
          ) : (
            <X size={16} className="inline text-red-500" />
          )}
        </span>
      </span>
    </div>
  );

  const ToggleItem = ({ icon: Icon, label, field, iconColor }) => (
    <FormItem
      className={`flex items-center justify-between rounded-lg p-4 shadow-sm transition-colors duration-200 ${
        field.value
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-red-50 dark:bg-red-900/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={iconColor} />
        <FormLabel className="text-base m-0 cursor-pointer">{label}</FormLabel>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
          className={field.value ? "bg-green-500" : "bg-red-500"}
        />
      </FormControl>
    </FormItem>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Flat Profiles
          </h1>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Plus size={20} />
          Create Flat Profile
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Delete Profile?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete the
              flat profile from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => setProfileToDelete(null)}
              className="font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => profileToDelete && handleDelete(profileToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-8 z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl mb-8">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Building size={20} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">New Flat Profile</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForm(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="houseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            House Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter house name"
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalRent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Total Rent (₹)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter total rent"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Complete Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter complete address"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="maxOccupancy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Maximum Occupancy
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter max occupancy"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="distanceFromCollege"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Distance from College (km)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter distance"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Location/Area
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter location or area name"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-4">
                      Amenities & Features
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hasWifi"
                        render={({ field }) => (
                          <ToggleItem
                            icon={Wifi}
                            label="WiFi Available"
                            field={field}
                            iconColor="text-blue-500"
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasGeyser"
                        render={({ field }) => (
                          <ToggleItem
                            icon={Flame}
                            label="Geyser Installed"
                            field={field}
                            iconColor="text-orange-500"
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasParking"
                        render={({ field }) => (
                          <ToggleItem
                            icon={Car}
                            label="Parking Space"
                            field={field}
                            iconColor="text-purple-500"
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowsGuests"
                        render={({ field }) => (
                          <ToggleItem
                            icon={Users}
                            label="Guest Visits Allowed"
                            field={field}
                            iconColor="text-green-500"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="font-medium"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="font-medium">
                      Create Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Flat Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flatProfile?.map((profile) => (
          <div
            key={profile._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Building size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{profile.houseName}</h2>
                    <p className="text-xs text-gray-500">{profile.location}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => {
                    setProfileToDelete(profile._id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {profile.address}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 p-1.5 rounded-lg text-sm">
                  <IndianRupee size={14} className="text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    ₹{profile.rentPerPerson}/person
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 p-1.5 rounded-lg text-sm">
                  <Users size={14} className="text-purple-500" />
                  <span className="font-medium text-purple-700 dark:text-purple-400">
                    Max {profile.maxOccupancy}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mb-3">
                <MapPin size={14} className="text-blue-500" />
                <span className="font-medium">
                  {profile.distanceFromCollege} km from college
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <IconWithText
                  Icon={Wifi}
                  value={profile.hasWifi}
                  label="WiFi"
                />
                <IconWithText
                  Icon={Flame}
                  value={profile.hasGeyser}
                  label="Geyser"
                />
                <IconWithText
                  Icon={Car}
                  value={profile.hasParking}
                  label="Parking"
                />
                <IconWithText
                  Icon={Users}
                  value={profile.allowsGuests}
                  label="Guests"
                />
              </div>

              <Button
                className={`w-full gap-2 text-sm py-2 ${
                  appliedProfiles.has(profile._id)
                    ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={() =>
                  !appliedProfiles.has(profile._id) && handleApply(profile._id)
                }
                disabled={appliedProfiles.has(profile._id)}
              >
                {appliedProfiles.has(profile._id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Applied
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Apply for Flatmate
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlatProfile;
