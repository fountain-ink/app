"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, File, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export default function LookupPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User & Content Lookup</CardTitle>
          <CardDescription>
            Search and manage users, content, and system data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by ID, username, email, or content..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">
                <User className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content">
                <File className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="logs">
                <AlertCircle className="h-4 w-4 mr-2" />
                System Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchQuery ? (
                    <UserTableRow
                      name="John Doe"
                      email="john.doe@example.com"
                      status="active"
                      role="user"
                      joined="May 12, 2023"
                    />
                  ) : (
                    <>
                      <UserTableRow
                        name="John Doe"
                        email="john.doe@example.com"
                        status="active"
                        role="user"
                        joined="May 12, 2023"
                      />
                      <UserTableRow
                        name="Jane Smith"
                        email="jane.smith@example.com"
                        status="active"
                        role="admin"
                        joined="Feb 3, 2023"
                      />
                      <UserTableRow
                        name="Bob Johnson"
                        email="bob.j@example.com"
                        status="suspended"
                        role="user"
                        joined="Jul 18, 2023"
                      />
                    </>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Getting Started with Next.js</TableCell>
                    <TableCell>Blog Post</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>
                    </TableCell>
                    <TableCell>Apr 23, 2023</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="h-96 bg-black rounded-md text-green-400 p-4 font-mono text-xs overflow-auto">
                <div className="space-y-1">
                  <p>[2023-05-15 14:32:18] INFO: User login: jane.smith@example.com</p>
                  <p>[2023-05-15 14:30:45] WARNING: API rate limit reached: 192.168.1.105</p>
                  <p>[2023-05-15 14:28:12] INFO: New post created: ID 3901</p>
                  <p>[2023-05-15 14:25:03] ERROR: Database connection timeout</p>
                  <p>[2023-05-15 14:23:55] INFO: System backup completed</p>
                  <p>[2023-05-15 14:20:11] INFO: User registration: new-user@example.com</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function UserTableRow({
  name,
  email,
  status,
  role,
  joined
}: {
  name: string;
  email: string;
  status: "active" | "suspended" | "banned";
  role: "user" | "admin" | "moderator";
  joined: string;
}) {
  const statusVariant = {
    active: "bg-green-50 text-green-700 border-green-200",
    suspended: "bg-amber-50 text-amber-700 border-amber-200",
    banned: "bg-red-50 text-red-700 border-red-200"
  }[status];

  const roleVariant = {
    user: "",
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    moderator: "bg-blue-50 text-blue-700 border-blue-200"
  }[role];

  const initials = name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      </TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>
        <Badge variant="outline" className={statusVariant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={roleVariant}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>{joined}</TableCell>
      <TableCell className="text-right space-x-1">
        <Button variant="ghost" size="sm">View</Button>
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  );
} 