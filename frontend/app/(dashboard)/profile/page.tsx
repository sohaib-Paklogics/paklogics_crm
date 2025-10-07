"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/types/types";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Loader2,
  CheckCircle,
  Lock,
} from "lucide-react";
import useAuthStore from "@/stores/auth.store";
import { useUserStore } from "@/stores/user-store";
import clsx from "clsx";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { updateUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.username || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updates: any = { name: data.name };
      if (data.password) {
        updates.password = data.password;
      }

      updateUser(user.id, updates);
      reset({ name: data.name, password: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      resetPassword();
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "bd":
        return "bg-blue-100 text-blue-800";
      case "developer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access with user management capabilities";
      case "bd":
        return "Business development with lead management and reporting access";
      case "developer":
        return "Developer access with assigned lead visibility";
      default:
        return "Standard user access";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4 border-neutral-200">
          <h1 className="text-3xl font-bold text-validiz-brown">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        {/* Toggle Buttons */}
        <div
          role="tablist"
          aria-label="Profile tabs"
          className="inline-flex items-center gap-2 rounded-2xl bg-white p-2 shadow ring-1 ring-black/5"
        >
          <button
            role="tab"
            aria-selected={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-base font-semibold transition-colors",
              activeTab === "profile" ? "bg-validiz-brown text-white shadow-sm" : "text-gray-900 hover:bg-gray-50",
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile Information</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "password"}
            onClick={() => setActiveTab("password")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-base font-semibold transition-colors",
              activeTab === "password" ? "bg-validiz-brown text-white shadow-sm" : "text-gray-900 hover:bg-gray-50",
            )}
          >
            <Lock className="h-4 w-4" />
            <span>Password Management</span>
          </button>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {activeTab === "profile"
                ? "Your profile has been updated successfully!"
                : "Your password has been updated successfully!"}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Settings Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-validiz-brown">Profile Information</CardTitle>
              <CardDescription>View and update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <div className="flex items-center mt-1 p-3 bg-gray-50 rounded-md">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.username}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                    <div className="flex items-center mt-1 p-3 bg-gray-50 rounded-md">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Role</Label>
                    <div className="flex items-center mt-1 p-3 bg-gray-50 rounded-md">
                      <Shield className="mr-2 h-4 w-4 text-gray-400" />
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getRoleDescription(user.role)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                    <div className="flex items-center mt-1 p-3 bg-gray-50 rounded-md">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Edit Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Update Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-validiz-brown hover:bg-validiz-brown/90" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Password Change Tab */}
        {activeTab === "password" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-validiz-brown">Password</CardTitle>
              <CardDescription>Change your password regularly for better security.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                    {...registerPassword("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your password",
                      })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-validiz-brown hover:bg-validiz-brown/90" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>Update Password</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
