"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { userSchema, type UserFormData, type UserRole } from "@/types/types";

import { Plus, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/types/types";
import { useUserStore } from "@/stores/user-store";

export function UserManagementTab() {
  const { users, loading, fetchUsers, addUser, updateUser, deleteUser } =
    useUserStore();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // initial load
    fetchUsers().catch(console.error);
  }, [fetchUsers]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      role: undefined as unknown as UserRole,
      password: "",
    },
  });

  const roleValue = watch("role");

  const roles: { key: UserRole; label: string }[] = [
    { key: "superadmin", label: "Super Admin" },
    { key: "admin", label: "Admin" },
    { key: "business_developer", label: "Business Developer" },
    { key: "developer", label: "Developer" },
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "business_developer":
        return "bg-blue-100 text-blue-800";
      case "developer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setSaving(true);
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser, {
          username: data.username,
          email: data.email,
          role: data.role,
        });
        if (updated) {
          setEditingUser(null);
        }
      } else {
        await addUser({
          username: data.username,
          email: data.email,
          role: data.role,
          // password should be accepted by your API on create
          password: data.password,
        } as Partial<AdminUser>);
      }
      reset();
      setIsAddUserOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("role", user.role as UserRole);
      setEditingUser(userId);
      setIsAddUserOpen(true);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="text-validiz-brown">Users</CardTitle>
            <p className="text-sm text-gray-600">
              Manage users and their roles
            </p>
          </div>
          <Button
            onClick={() => {
              reset();
              setEditingUser(null);
              setIsAddUserOpen(true);
            }}
            className="bg-validiz-brown hover:bg-validiz-brown/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={getRoleBadgeColor(user.role as UserRole)}
                        >
                          {user.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(user.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user info" : "Create a new account"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={roleValue || ""}
                onValueChange={(val) =>
                  setValue("role", val as UserRole, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAddUserOpen(false);
                  setEditingUser(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-validiz-brown hover:bg-validiz-brown/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : editingUser ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
