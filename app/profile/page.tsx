"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/lib/stores/auth-store"
import { profileSchema, type ProfileFormData } from "@/lib/types"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, Calendar, Save, Loader2, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  })

  // Add loading check
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    )
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setShowSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data
      const updates: any = { name: data.name }
      if (data.password) {
        updates.password = data.password // In real app, this would be hashed
      }

      updateUser(updates)
      reset({ name: data.name, password: "" })
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "bd":
        return "bg-blue-100 text-blue-800"
      case "developer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access with user management capabilities"
      case "bd":
        return "Business development with lead management and reporting access"
      case "developer":
        return "Developer access with assigned lead visibility"
      default:
        return "Standard user access"
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-validiz-brown">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Your profile has been updated successfully!</AlertDescription>
          </Alert>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-validiz-brown">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
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
                    <span className="text-gray-900">{user.name}</span>
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

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password (leave blank to keep current)"
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                <p className="text-xs text-gray-500">Leave blank if you don't want to change your password</p>
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

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-validiz-brown">
              <Shield className="mr-2 h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>Security information and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Secure
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Login Sessions</h4>
                  <p className="text-sm text-gray-600">Manage your active login sessions</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">Account Activity</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-validiz-brown">
                  {user.role === "admin" ? "All" : user.role === "bd" ? "Created" : "Assigned"}
                </div>
                <p className="text-sm text-gray-600">Leads Access</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-validiz-mustard">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-sm text-gray-600">Days Active</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-sm text-gray-600">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
