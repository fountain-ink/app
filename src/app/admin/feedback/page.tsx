"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import type { Database } from "@/lib/db/database";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Bug, Lightbulb, ImageIcon, HelpCircle, Maximize } from "lucide-react";
import { toast } from "sonner";
import { FeedbackDetailModal } from "@/components/admin/feedback-detail-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserCard } from "@/components/user/user-card";

type FeedbackItem = Database["public"]["Tables"]["feedback"]["Row"];

async function updateFeedbackStatus(id: number, status: string) {
  try {
    const response = await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    toast.success("Feedback status updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating feedback status:", error);
    toast.error("Failed to update feedback status");
    return false;
  }
}

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, activeType, sortField, sortDirection]);

  async function fetchFeedback() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (activeType && activeType !== "all") {
        params.append("type", activeType);
      }

      params.append("sort_by", sortField);
      params.append("sort_direction", sortDirection);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setFeedbackItems(result.data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback items");
    } finally {
      setLoading(false);
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

  async function resolveFeedback(id: number) {
    const success = await updateFeedbackStatus(id, "completed");
    if (success) {
      fetchFeedback();

      if (selectedFeedback && selectedFeedback.id === id) {
        const updatedFeedback = {
          ...selectedFeedback,
          status: "completed",
          resolvedAt: new Date().toISOString()
        };
        setSelectedFeedback(updatedFeedback);
      }
    }
  }

  const handleViewFeedback = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>
                Manage the feedback and support tickets
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            defaultValue="all"
            className="space-y-4"
            onValueChange={(value) => setActiveType(value === "all" ? null : value)}
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="feature">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Feature Requests
                </TabsTrigger>
                <TabsTrigger value="bug">
                  <Bug className="h-4 w-4 mr-2" />
                  Bug Reports
                </TabsTrigger>
                <TabsTrigger value="other">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Other
                </TabsTrigger>
              </TabsList>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["all", "feature", "bug", "other"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                <ScrollArea className="h-[calc(100vh-20rem)] w-full">
                  <FeedbackTable
                    items={feedbackItems}
                    loading={loading}
                    onResolve={resolveFeedback}
                    onViewFeedback={handleViewFeedback}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <FeedbackDetailModal
        feedback={selectedFeedback}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onResolve={resolveFeedback}
        onUpdateStatus={updateFeedbackStatus}
      />
    </div>
  );
}

function FeedbackTable({
  items,
  loading,
  onResolve,
  onViewFeedback,
  sortField,
  sortDirection,
  onSort
}: {
  items: FeedbackItem[];
  loading: boolean;
  onResolve: (id: number) => Promise<void>;
  onViewFeedback: (feedback: FeedbackItem) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (items.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No feedback items found</div>;
  }

  const SortHeader = ({ field, children, className }: { field: string; children: React.ReactNode; className?: string }) => {
    const isSorted = sortField === field;
    return (
      <TableHead
        onClick={() => onSort(field)}
        className={`cursor-pointer hover:bg-muted/30 transition-colors ${className || ''}`}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isSorted && (
            <span className="text-xs">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortHeader field="id" className="w-20">ID</SortHeader>
          <SortHeader field="text" className="w-[400px]">Text</SortHeader>
          <SortHeader field="author" className="w-32">Author</SortHeader>
          <SortHeader field="type" className="w-28">Type</SortHeader>
          <SortHeader field="status" className="w-36">Status</SortHeader>
          <SortHeader field="createdAt" className="w-40">Created</SortHeader>
          <SortHeader field="actions" className="w-24">Actions</SortHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <FeedbackRow
            key={item.id}
            feedback={item}
            onResolve={onResolve}
            onViewFeedback={onViewFeedback}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function FeedbackRow({
  feedback,
  onResolve,
  onViewFeedback
}: {
  feedback: FeedbackItem;
  onResolve: (id: number) => Promise<void>;
  onViewFeedback: (feedback: FeedbackItem) => void;
}) {
  const [status, setStatus] = useState(feedback.status || "new");
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolvedAt, setResolvedAt] = useState<string | null>(feedback.resolvedAt);

  const typeVariant = {
    "bug": "bg-red-50 text-red-700 border-border",
    "feature": "bg-purple-50 text-purple-700 border-border",
    "other": "bg-blue-50 text-blue-700 border-border",
  }[feedback.type] || "bg-gray-50 text-gray-700 border-border";

  const authorAddress = feedback.author || "Unknown";
  const isGuestAuthor = authorAddress.startsWith("guest-");

  let displayAddress;

  if (isGuestAuthor) {
    const guestId = authorAddress.replace('guest-', '');
    displayAddress = `${guestId}`;
  } else {
    displayAddress = authorAddress && authorAddress.length > 8
      ? `${authorAddress.substring(2, 6)}...${authorAddress.substring(authorAddress.length - 4)}`
      : authorAddress;
  }

  const formattedDate = feedback.createdAt
    ? formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })
    : "Unknown";

  const formattedResolvedDate = resolvedAt
    ? formatDistanceToNow(new Date(resolvedAt), { addSuffix: true })
    : "-";

  const hasScreenshot = !!feedback.screenshot;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const success = await updateFeedbackStatus(feedback.id, newStatus);
    if (success) {
      setStatus(newStatus);
      if (newStatus === "completed" && feedback.status !== "completed") {
        const now = new Date().toISOString();
        setResolvedAt(now);
      }
    }
    setIsUpdating(false);
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <TableRow>
      <TableCell className="font-medium">#{feedback.id}</TableCell>
      <TableCell className="max-w-[400px]">
        <div className="whitespace-normal break-words line-clamp-3">{feedback.text}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {isGuestAuthor ? (
            <div className="font-medium text-sm text-muted-foreground">{displayAddress}</div>
          ) : (
            <UserCard address={authorAddress}>
              <div className="font-medium text-sm">{displayAddress}</div>
            </UserCard>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={typeVariant}>
          {feedback.type?.charAt(0).toUpperCase() + feedback.type?.slice(1) || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell>
        <Select
          value={status}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue>
              {formatStatus(status)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
      <TableCell>
        <div className="flex justify-end space-x-2">
          {hasScreenshot && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewFeedback(feedback)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View screenshot</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewFeedback(feedback)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
          <TableHead className="w-20">
            <div className="flex items-center space-x-1">
              <span>ID</span>
            </div>
          </TableHead>
          <TableHead className="w-[400px]">
            <div className="flex items-center space-x-1">
              <span>Text</span>
            </div>
          </TableHead>
          <TableHead className="w-32">
            <div className="flex items-center space-x-1">
              <span>Author</span>
            </div>
          </TableHead>
          <TableHead className="w-28">
            <div className="flex items-center space-x-1">
              <span>Type</span>
            </div>
          </TableHead>
          <TableHead className="w-36">
            <div className="flex items-center space-x-1">
              <span>Status</span>
            </div>
          </TableHead>
          <TableHead className="w-40">
            <div className="flex items-center space-x-1">
              <span>Created</span>
            </div>
          </TableHead>
          <TableHead className="w-24">
            <div className="flex items-center ">
              <span>Actions</span>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((i) => (
          <TableRow key={i} className="animate-pulse">
            <TableCell><div className="h-4 w-8 bg-muted rounded"></div></TableCell>
            <TableCell><div className="h-4 w-full bg-muted rounded"></div></TableCell>
            <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
            <TableCell><div className="h-6 w-16 bg-muted rounded-full"></div></TableCell>
            <TableCell><div className="h-8 w-[130px] bg-muted rounded"></div></TableCell>
            <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
            <TableCell>
              <div className="flex justify-end space-x-2">
                <div className="h-8 w-8 bg-muted rounded-sm"></div>
                <div className="h-8 w-8 bg-muted rounded-sm"></div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 