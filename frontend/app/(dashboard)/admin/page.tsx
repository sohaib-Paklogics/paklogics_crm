"use client";
import { AdminTabs } from "@/components/AdminTabs";
import AccessDenied from "@/components/common/AccessDenied";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/auth.store";
import { Plus, Shield, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { type UserRole, type UserFormData, createUserSchema, editUserSchema } from "@/types/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/stores/user-store";

export default function AdminPage() {
  const { user, hasPermission } = useAuthStore();
  const { addUser, updateUser } = useUserStore();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const roles: { key: UserRole; label: string }[] = [
    { key: "superadmin", label: "Super Admin" },
    { key: "admin", label: "Admin" },
    { key: "business_developer", label: "Business Developer" },
    { key: "developer", label: "Developer" },
  ];

  if (!user) {
    return <AccessDenied />;
  }

  const openCreate = () => {
    setEditingUser(null);
    reset({
      username: "",
      email: "",
      role: undefined as unknown as UserRole,
      password: "",
    });
    setIsAddUserOpen(true);
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
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission({ action: "read", resource: "users" })) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Panel</h1>
            <p className="mt-0.5 sm:mt-1 text-sm text-gray-600">Manage users and system permissions</p>
          </div>

          <Button onClick={openCreate} className="bg-primary hover:bg-validiz-brown/90 w-full sm:w-auto justify-center">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <AdminTabs first="User Management" second="Permissions" />

        <Dialog
          open={isAddUserOpen}
          onOpenChange={(open) => {
            setIsAddUserOpen(open);
            if (!open) {
              setEditingUser(null);
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
                  <Input id="password" type="password" {...register("password")} />
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
      </div>
    </MainLayout>
  );
}
