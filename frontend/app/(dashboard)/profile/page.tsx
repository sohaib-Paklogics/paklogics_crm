"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/types/types";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar, Save, Loader2, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/stores/auth.store";
import clsx from "clsx";
import { authService } from "@/services/auth.service";
import { callApi } from "@/lib/callApi";

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // show/hide password toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
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
      // ✅ Use NEW self-service API: PATCH /admin-auth/me
      const response = await callApi(() => authService.updateProfile({ username: data.name }), {
        showSuccess: false,
        showError: true,
      });

      if (response?.success) {
        await fetchUser(); // refresh user info in store
        reset({ name: data.name });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
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
      // ✅ Use NEW self-service API: PATCH /admin-auth/me/password
      const response = await callApi(
        () =>
          authService.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        { showSuccess: false, showError: true },
      );

      if (response?.success) {
        resetPassword();
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
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
        <div className="border-b pb-4 border-neutral-200">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Profile Settings</h1>
          <p className="mt-0.5 sm:mt-1 text-sm text-gray-600">Manage your account information and preferences</p>
        </div>

        <div
          role="tablist"
          aria-label="Profile tabs"
          className="flex flex-wrap sm:inline-flex w-full sm:w-auto items-center gap-2 rounded-2xl bg-white p-2 shadow ring-1 ring-black/5"
        >
          <button
            role="tab"
            aria-selected={activeTab === "profile"}
            aria-label="Profile Information"
            onClick={() => setActiveTab("profile")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-3 sm:px-5 py-2 text-xs sm:text-sm md:text-base font-semibold transition-colors min-w-0 flex-1 sm:flex-none justify-center",
              activeTab === "profile" ? "bg-validiz-brown text-white shadow-sm" : "text-gray-900 hover:bg-gray-50",
            )}
          >
            <User className=" hidden sm:inline h-4 w-4 shrink-0" />
            <span className=" truncate">Profile Information</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "password"}
            aria-label="Password Management"
            onClick={() => setActiveTab("password")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-3 sm:px-5 py-2 text-xs sm:text-sm md:text-base font-semibold transition-colors min-w-0 flex-1 sm:flex-none justify-center",
              activeTab === "password" ? "bg-validiz-brown text-white shadow-sm" : "text-gray-900 hover:bg-gray-50",
            )}
          >
            <Lock className="hidden sm:inline h-4 w-4 shrink-0" />
            <span className=" truncate">Password Management</span>
          </button>
        </div>

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

        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-validiz-brown">Profile Information</CardTitle>
              <CardDescription>View and update your personal information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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

                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      className="pr-10 focus:ring-validiz-mustard focus:border-validiz-mustard"
                      {...registerPassword("currentPassword", {
                        required: "Current password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showCurrent ? "Hide current password" : "Show current password"}
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600">{passwordErrors.currentPassword.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>

                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pr-10 focus:ring-validiz-mustard focus:border-validiz-mustard"
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: { value: 6, message: "Password must be at least 6 characters" },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showNew ? "Hide new password" : "Show new password"}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.newPassword.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>

                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pr-10 focus:ring-validiz-mustard focus:border-validiz-mustard"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your password",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message as string}</p>
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
