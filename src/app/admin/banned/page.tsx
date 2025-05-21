"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserCard } from "@/components/user/user-card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthenticatedUser } from "@lens-protocol/react";

type BannedUser = {
  id: number;
  address: string;
  reason: string;
  added_by: string;
  created_at: string;
};

export default function BannedUsersPage() {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [newBan, setNewBan] = useState({ address: "", reason: "" });
  const { data: user } = useAuthenticatedUser();

  useEffect(() => {
    fetchBannedUsers();
  }, [sortField, sortDirection]);

  async function fetchBannedUsers() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ban");

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setBannedUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching banned users:", error);
      toast.error("Failed to load banned users");
    } finally {
      setLoading(false);
    }
  }

  async function unbanUser(address: string) {
    try {
      const response = await fetch(`/api/admin/ban?address=${address}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(`User ${address} has been unbanned`);
      fetchBannedUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  }

  async function addBannedUser() {
    try {
      if (!newBan.address || !newBan.reason) {
        toast.error("Address and reason are required");
        return;
      }

      const response = await fetch("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: newBan.address,
          reason: newBan.reason,
          added_by: user?.address,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `API returned ${response.status}`);
      }

      toast.success(`User ${newBan.address} has been banned`);
      setShowBanDialog(false);
      setNewBan({ address: "", reason: "" });
      fetchBannedUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to ban user");
    }
  }

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredUsers = bannedUsers.filter(
    (user) =>
      user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.reason.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort the filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valueA = a[sortField as keyof BannedUser];
    const valueB = b[sortField as keyof BannedUser];

    const multiplier = sortDirection === "asc" ? 1 : -1;

    if (typeof valueA === "string" && typeof valueB === "string") {
      return multiplier * valueA.localeCompare(valueB);
    }

    // For dates
    if (sortField === "created_at") {
      return multiplier * (new Date(valueA as string).getTime() - new Date(valueB as string).getTime());
    }

    return 0;
  });

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Banned Users</CardTitle>
              <CardDescription>Manage users who have been banned from the platform</CardDescription>
            </div>
            <Button onClick={() => setShowBanDialog(true)}>
              <Ban className="h-4 w-4 mr-2" />
              Ban New User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search by address or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)] w-full">
            <BannedUsersTable
              users={sortedUsers}
              loading={loading}
              onUnban={unbanUser}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban a User</DialogTitle>
            <DialogDescription>Enter the user's address and reason for banning.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-4">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newBan.address}
                onChange={(e) => setNewBan({ ...newBan, address: e.target.value })}
                placeholder="0x..."
              />
            </div>
            <div className="grid items-center gap-4">
              <Label htmlFor="reason">Reason</Label>
              <Select value={newBan.reason} onValueChange={(value) => setNewBan({ ...newBan, reason: value })}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="z-[51]">
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="forbidden">Forbidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addBannedUser}>Ban User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BannedUsersTable({
  users,
  loading,
  onUnban,
  sortField,
  sortDirection,
  onSort,
}: {
  users: BannedUser[];
  loading: boolean;
  onUnban: (address: string) => Promise<void>;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (users.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No banned users found</div>;
  }

  const SortHeader = ({
    field,
    children,
    className,
  }: { field: string; children: React.ReactNode; className?: string }) => {
    const isSorted = sortField === field;
    return (
      <TableHead
        onClick={() => onSort(field)}
        className={`cursor-pointer hover:bg-muted/30 transition-colors ${className || ""}`}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isSorted && <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>}
        </div>
      </TableHead>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortHeader field="address" className="w-[250px]">
            User Address
          </SortHeader>
          <SortHeader field="reason" className="w-[400px]">
            Reason
          </SortHeader>
          <SortHeader field="added_by" className="w-[200px]">
            Added By
          </SortHeader>
          <SortHeader field="created_at" className="w-[150px]">
            Banned On
          </SortHeader>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <BannedUserRow key={user.address} user={user} onUnban={onUnban} />
        ))}
      </TableBody>
    </Table>
  );
}

function BannedUserRow({
  user,
  onUnban,
}: {
  user: BannedUser;
  onUnban: (address: string) => Promise<void>;
}) {
  const [isUnbanning, setIsUnbanning] = useState(false);

  const handleUnban = async () => {
    if (confirm(`Are you sure you want to unban ${user.address}?`)) {
      setIsUnbanning(true);
      await onUnban(user.address);
      setIsUnbanning(false);
    }
  };

  const formattedDate = user.created_at
    ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
    : "Unknown";

  const displayAddress =
    user.address && user.address.length > 8
      ? `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`
      : user.address;

  const displayAddedBy =
    user.added_by && user.added_by.length > 8
      ? `${user.added_by.substring(0, 6)}...${user.added_by.substring(user.added_by.length - 4)}`
      : user.added_by;

  return (
    <TableRow>
      <TableCell>
        <UserCard address={user.address}>
          <div className="font-medium">{displayAddress}</div>
        </UserCard>
      </TableCell>
      <TableCell className="max-w-[400px]">
        <div className="whitespace-normal break-words">{user.reason}</div>
      </TableCell>
      <TableCell>
        <UserCard address={user.added_by}>
          <div className="text-sm">{displayAddedBy}</div>
        </UserCard>
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUnban} disabled={isUnbanning}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unban user</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

function TableSkeleton() {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">User Address</TableHead>
          <TableHead className="w-[400px]">Reason</TableHead>
          <TableHead className="w-[200px]">Added By</TableHead>
          <TableHead className="w-[150px]">Banned On</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((i) => (
          <TableRow key={i} className="animate-pulse">
            <TableCell>
              <div className="h-4 w-32 bg-muted rounded" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-full bg-muted rounded" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-20 bg-muted rounded" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-24 bg-muted rounded" />
            </TableCell>
            <TableCell className="text-right">
              <div className="h-8 w-8 bg-muted rounded-sm ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
