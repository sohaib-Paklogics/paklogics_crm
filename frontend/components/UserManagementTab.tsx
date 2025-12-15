// UserManagementTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createUserSchema, editUserSchema, type UserFormData, type UserRole, type AdminUser } from "@/types/types";

import { MoreHorizontal, Edit, Trash2, Loader2, Search, Plus, KeyRound, ToggleLeft, Eye, EyeOff } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/user.store";
import { Pagination } from "@/components/ui/pagination";
import useAuthStore from "@/stores/auth.store";
import { userService } from "@/services/user.service";
import { callApi } from "@/lib/callApi";

type ChangePasswordForm = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

type StatusValue = "active" | "inactive" | "suspended";

export function UserManagementTab() {
  const { user: authUser } = useAuthStore();

  const { users, loading, fetchUsers, addUser, updateUser, deleteUser, toggleUserStatus } = useUserStore();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Search + pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Add user password eye
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Change password dialog
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<({ id: string } & AdminUser) | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Change status dialog
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<({ id: string } & AdminUser) | null>(null);
  const [statusValue, setStatusValue] = useState<StatusValue>("active");
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    fetchUsers().catch(console.error);
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const resolver = useMemo(() => zodResolver(editingUser ? editUserSchema : createUserSchema), [editingUser]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<UserFormData>({
    resolver,
    defaultValues: {
      username: "",
      email: "",
      role: undefined as unknown as UserRole,
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

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

  const openCreate = () => {
    setEditingUser(null);
    setShowAddPassword(false);
    reset({
      username: "",
      email: "",
      role: undefined as unknown as UserRole,
      password: "",
    });
    setIsAddUserOpen(true);
  };

  const openEdit = (u: AdminUser & { id: string }) => {
    setEditingUser(u.id);
    setShowAddPassword(false);
    reset({
      username: u.username,
      email: u.email,
      role: u.role as UserRole,
      password: "",
    });
    setIsAddUserOpen(true);
  };

  const openChangePassword = (u: AdminUser & { id: string }) => {
    setPasswordTarget(u);
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    resetPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsPasswordDialogOpen(true);
  };

  const openChangeStatus = (u: AdminUser & { id: string }) => {
    setStatusTarget(u);
    setStatusValue((u.status as StatusValue) || "active");
    setIsStatusDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser, {
          username: data.username,
          email: data.email,
          role: data.role,
        });
        setEditingUser(null);
      } else {
        await addUser({
          username: data.username,
          email: data.email,
          role: data.role,
          password: (data as any).password,
        });
      }

      reset({
        username: "",
        email: "",
        role: undefined as unknown as UserRole,
        password: "",
      });
      setIsAddUserOpen(false);
      setShowAddPassword(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    if (!passwordTarget) return;

    if (data.newPassword !== data.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const isSelf = String(passwordTarget.id) === String(authUser?.id);

    setChangingPassword(true);
    try {
      const res = await callApi(
        () =>
          userService.changePassword(passwordTarget.id, data.newPassword, isSelf ? data.currentPassword : undefined),
        { showSuccess: true, showError: true },
      );

      if (res?.success) {
        setIsPasswordDialogOpen(false);
        setPasswordTarget(null);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const onSubmitStatus = async () => {
    if (!statusTarget) return;

    // Optional safety: prevent self-disable
    if (String(statusTarget.id) === String(authUser?.id)) {
      alert("You cannot change your own status from here.");
      return;
    }

    setChangingStatus(true);
    try {
      const updated = await toggleUserStatus(statusTarget.id, statusValue);
      if (updated) {
        setIsStatusDialogOpen(false);
        setStatusTarget(null);
      }
    } finally {
      setChangingStatus(false);
    }
  };

  // Filter + paginate
  const filteredUsers = useMemo(() => {
    if (!q.trim()) return users;
    const term = q.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        (u.role as string)?.toLowerCase().includes(term) ||
        (u.status as string)?.toLowerCase().includes(term),
    );
  }, [users, q]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const pageUsers = filteredUsers.slice(start, start + itemsPerPage);

  return (
    <>
      <Card>
        <CardHeader className="flex">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div>
              <CardTitle className="text-lg md:text-2xl font-semibold text-primary truncate">User Management</CardTitle>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                Manage team members and their access levels
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-4 pr-10 py-2 w-64 border border-neutral-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </div>

              <Button onClick={openCreate} className="bg-validiz-brown hover:bg-validiz-brown/90">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[90px]">Actions</TableHead>
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
                ) : pageUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {q ? "No users match your search." : "No users found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-validiz-mustard text-white text-sm font-semibold shadow-md">
                            {u.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      </TableCell>

                      <TableCell>{u.email}</TableCell>

                      <TableCell>
                        <Badge className={getRoleBadgeColor(u.role as UserRole)}>
                          {String(u.role).replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            u.status === "active"
                              ? "border-[#09BF31] text-[#09BF31] bg-[#09BF31]/10"
                              : u.status === "inactive"
                              ? "border-gray-400 text-gray-700 bg-gray-100"
                              : "border-yellow-500 text-yellow-700 bg-yellow-50"
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openChangePassword(u)}>
                              <KeyRound className="mr-2 h-4 w-4" /> Change Password
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openChangeStatus(u)}>
                              <ToggleLeft className="mr-2 h-4 w-4" /> Change Status
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(u.id)}
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

        <div className="py-4">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={isAddUserOpen}
        onOpenChange={(open) => {
          setIsAddUserOpen(open);
          if (!open) {
            setEditingUser(null);
            setShowAddPassword(false);
            reset({
              username: "",
              email: "",
              role: undefined as unknown as UserRole,
              password: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>{editingUser ? "Update user info" : "Create a new account"}</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            key={editingUser ? `edit-${editingUser}` : "create"}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                )}
              />
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showAddPassword ? "text" : "password"}
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showAddPassword ? "Hide password" : "Show password"}
                  >
                    {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {"password" in errors && <p className="text-sm text-red-600">{(errors as any).password?.message}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAddUserOpen(false);
                  setEditingUser(null);
                  setShowAddPassword(false);
                  reset({
                    username: "",
                    email: "",
                    role: undefined as unknown as UserRole,
                    password: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving} className="bg-validiz-brown hover:bg-validiz-brown/90">
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

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setPasswordTarget(null);
            resetPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">Change Password</DialogTitle>
            <DialogDescription>
              {passwordTarget ? (
                <>
                  Set a new password for <span className="font-semibold">{passwordTarget.username}</span>.
                </>
              ) : (
                "Set a new password for the selected user."
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPwd(onSubmitPassword)} className="space-y-4">
            {/* If admin tries to change own password from table, current password is required by backend */}
            {passwordTarget && authUser && String(passwordTarget.id) === String(authUser.id) && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPass ? "text" : "password"}
                    className="pr-10"
                    {...registerPwd("currentPassword", { required: "Current password is required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showCurrentPass ? "Hide current password" : "Show current password"}
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdErrors.currentPassword && (
                  <p className="text-sm text-red-600">{pwdErrors.currentPassword.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPass ? "text" : "password"}
                  className="pr-10"
                  {...registerPwd("newPassword", {
                    required: "New password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showNewPass ? "Hide new password" : "Show new password"}
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.newPassword && <p className="text-sm text-red-600">{pwdErrors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  className="pr-10"
                  {...registerPwd("confirmPassword", { required: "Please confirm the password" })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPass ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && <p className="text-sm text-red-600">{pwdErrors.confirmPassword.message}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={changingPassword} className="bg-validiz-brown hover:bg-validiz-brown/90">
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog
        open={isStatusDialogOpen}
        onOpenChange={(open) => {
          setIsStatusDialogOpen(open);
          if (!open) {
            setStatusTarget(null);
            setStatusValue("active");
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-validiz-brown">Change Status</DialogTitle>
            <DialogDescription>
              {statusTarget ? (
                <>
                  Update status for <span className="font-semibold">{statusTarget.username}</span>.
                </>
              ) : (
                "Update the selected user status."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusValue} onValueChange={(v) => setStatusValue(v as StatusValue)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>

              <Button
                type="button"
                disabled={changingStatus}
                className="bg-validiz-brown hover:bg-validiz-brown/90"
                onClick={onSubmitStatus}
              >
                {changingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
