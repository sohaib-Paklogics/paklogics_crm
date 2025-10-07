"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTab } from "./UserManagementTab";
import RolePermissionsTab from "./RolePermissionsTab";

export function AdminTabs({first,second}: {first: string, second: string}) {
  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users">{first}</TabsTrigger>
        <TabsTrigger value="permissions">{second}</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UserManagementTab />
      </TabsContent>

      <TabsContent value="permissions">
        <RolePermissionsTab />
      </TabsContent>
    </Tabs>
  );
}
