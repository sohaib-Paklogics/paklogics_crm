"use client"

import { useState } from "react"
import { useAuthStore, hasPermission } from "@/lib/stores/auth-store"
import { useUserStore } from "@/lib/stores/user-store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema, type UserFormData, type UserRole } from "@/lib/types"
import { Plus, MoreHorizontal, Edit, Trash2, Shield, Loader2 } from "lucide-react"

export default function AdminPage() {
  const { user } = useAuthStore()
  const { users, addUser, updateUser, deleteUser } = useUserStore()
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Permission matrix state
  const [permissions, setPermissions] = useState({
    admin: {
      clientName: { view: true, edit: true },
      jobDescription: { view: true, edit: true },
      leadSource: { view: true, edit: true },
      status: { view: true, edit: true },
      assignedDeveloper: { view: true, edit: true },
      notes: { view: true, edit: true },
      attachments: { view: true, edit: true },
    },
    bd: {
      clientName: { view: true, edit: true },
      jobDescription: { view: true, edit: true },
      leadSource: { view: true, edit: true },
      status: { view: true, edit: true },
      assignedDeveloper: { view: true, edit: true },
      notes: { view: true, edit: false },
      attachments: { view: true, edit: false },
    },
    developer: {
      clientName: { view: true, edit: false },
      jobDescription: { view: true, edit: false },
      leadSource: { view: true, edit: false },
      status: { view: true, edit: false },
      assignedDeveloper: { view: true, edit: false },
      notes: { view: true, edit: false },
      attachments: { view: true, edit: false },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  // Add loading check first
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown"></div>
        </div>
      </MainLayout>
    )
  }

  // Move permission check after null check
  if (!hasPermission(user.role, "read", "users")) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </MainLayout>
    )
  }

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (editingUser) {
        updateUser(editingUser, {
          name: data.name,
          email: data.email,
          role: data.role,
          updatedAt: new Date().toISOString(),
        })
        setEditingUser(null)
      } else {
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        addUser(newUser)
      }

      reset()
      setIsAddUserOpen(false)
    } catch (error) {
      console.error("Error saving user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (userId: string) => {
    const userToEdit = users.find((u) => u.id === userId)
    if (userToEdit) {
      setValue("name", userToEdit.name)
      setValue("email", userToEdit.email)
      setValue("role", userToEdit.role)
      setEditingUser(userId)
      setIsAddUserOpen(true)
    }
  }

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
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

  const updatePermission = (role: UserRole, field: string, type: "view" | "edit", value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: {
          ...prev[role][field],
          [type]: value,
        },
      },
    }))
  }

  const fields = [
    { key: "clientName", label: "Client Name" },
    { key: "jobDescription", label: "Job Description" },
    { key: "leadSource", label: "Lead Source" },
    { key: "status", label: "Status" },
    { key: "assignedDeveloper", label: "Assigned Developer" },
    { key: "notes", label: "Notes" },
    { key: "attachments", label: "Attachments" },
  ]

  const roles: { key: UserRole; label: string }[] = [
    { key: "admin", label: "Admin" },
    { key: "bd", label: "Business Developer" },
    { key: "developer", label: "Developer" },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-validiz-brown">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage users and system permissions</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-validiz-brown">Users</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Manage system users and their roles</p>
                </div>
                <Button onClick={() => setIsAddUserOpen(true)} className="bg-validiz-brown hover:bg-validiz-brown/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-validiz-brown font-semibold">Name</TableHead>
                        <TableHead className="text-validiz-brown font-semibold">Email</TableHead>
                        <TableHead className="text-validiz-brown font-semibold">Role</TableHead>
                        <TableHead className="text-validiz-brown font-semibold">Created</TableHead>
                        <TableHead className="text-validiz-brown font-semibold w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-validiz-brown">Role Permissions</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Configure what each role can view and edit</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-validiz-brown">Field</th>
                        {roles.map((role) => (
                          <th key={role.key} className="text-center py-3 px-4 font-semibold text-validiz-brown">
                            <div className="flex flex-col items-center space-y-1">
                              <Badge className={getRoleBadgeColor(role.key)}>{role.label}</Badge>
                              <div className="flex space-x-2 text-xs text-gray-500">
                                <span>View</span>
                                <span>Edit</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field) => (
                        <tr key={field.key} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{field.label}</td>
                          {roles.map((role) => (
                            <td key={role.key} className="py-3 px-4 text-center">
                              <div className="flex justify-center space-x-4">
                                <Checkbox
                                  checked={permissions[role.key][field.key]?.view || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(role.key, field.key, "view", checked as boolean)
                                  }
                                  className="data-[state=checked]:bg-validiz-brown data-[state=checked]:border-validiz-brown"
                                />
                                <Checkbox
                                  checked={permissions[role.key][field.key]?.edit || false}
                                  onCheckedChange={(checked) =>
                                    updatePermission(role.key, field.key, "edit", checked as boolean)
                                  }
                                  className="data-[state=checked]:bg-validiz-mustard data-[state=checked]:border-validiz-mustard"
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-6">
                  <Button className="bg-validiz-brown hover:bg-validiz-brown/90">Save Permissions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information and role" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select onValueChange={(value) => setValue("role", value as UserRole)}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bd">Business Developer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddUserOpen(false)
                  setEditingUser(null)
                  reset()
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-validiz-brown hover:bg-validiz-brown/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Creating..."}
                  </>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
