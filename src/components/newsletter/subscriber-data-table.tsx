"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Copy, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Subscriber = {
  id: string;
  email: string;
  created_at: string;
  status: string;
};

interface SubscriberDataTableProps {
  blogAddress: string;
  mailListId: number;
}

export function SubscriberDataTable({ blogAddress, mailListId }: SubscriberDataTableProps) {
  const [data, setData] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);
  const [deletingEmails, setDeletingEmails] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const fetchSubscribers = async (page?: number, search?: string) => {
    try {
      setLoading(true);
      const currentPage = page !== undefined ? page : pagination.pageIndex;
      const currentSearch = search !== undefined ? search : searchValue;

      const params = new URLSearchParams({
        page: (currentPage + 1).toString(), // API is 1-indexed
        per_page: pagination.pageSize.toString(),
      });

      if (currentSearch) {
        params.append("search", currentSearch);
      }

      const response = await fetch(`/api/newsletter/${blogAddress}/subscribers?${params.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const result = await response.json();
      setData(result.subscribers || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();

    // Listen for subscriber additions
    const handleSubscriberAdded = () => {
      fetchSubscribers();
    };

    window.addEventListener("subscriber-added", handleSubscriberAdded);
    return () => {
      window.removeEventListener("subscriber-added", handleSubscriberAdded);
    };
  }, [blogAddress]);

  // Fetch when pagination changes
  useEffect(() => {
    fetchSubscribers();
  }, [pagination.pageIndex, pagination.pageSize]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
      fetchSubscribers(0, searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleDelete = async (email: string) => {
    setDeletingEmails([email]);

    try {
      const response = await fetch(`/api/newsletter/${blogAddress}/subscribers?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove subscriber");
      }

      toast.success("Subscriber removed successfully");
      await fetchSubscribers();

      // Trigger parent component refresh (to update subscriber count)
      window.dispatchEvent(new CustomEvent("subscriber-deleted"));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to remove subscriber");
    } finally {
      setDeletingEmails([]);
      setDeleteEmail(null);
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const subscriberIds = selectedRows.map((row) => Number.parseInt(row.original.id));
    const emailsToDelete = selectedRows.map((row) => row.original.email);

    if (subscriberIds.length === 0) return;

    setDeletingEmails(emailsToDelete);

    try {
      const response = await fetch(`/api/newsletter/${blogAddress}/subscribers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriber_ids: subscriberIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove subscribers");
      }

      const result = await response.json();
      toast.success(result.message || `Successfully removed ${subscriberIds.length} subscriber(s)`);

      // Clear selection and refresh
      table.resetRowSelection();
      await fetchSubscribers();

      // Trigger parent component refresh (to update subscriber count)
      window.dispatchEvent(new CustomEvent("subscriber-deleted"));
    } catch (error) {
      console.error("Error bulk deleting subscribers:", error);
      toast.error("Failed to remove subscribers");
    } finally {
      setDeletingEmails([]);
    }
  };

  const handleDeleteAll = async () => {
    if (!mailListId) return;

    setDeletingEmails(["all"]);

    try {
      const response = await fetch(`/api/newsletter/${blogAddress}/subscribers/all`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all subscribers");
      }

      const result = await response.json();
      toast.success(result.message || "Successfully deleted all subscribers");

      // Clear selection and refresh
      table.resetRowSelection();
      await fetchSubscribers();

      // Trigger parent component refresh (to update subscriber count)
      window.dispatchEvent(new CustomEvent("subscriber-deleted"));
    } catch (error) {
      console.error("Error deleting all subscribers:", error);
      toast.error("Failed to delete all subscribers");
    } finally {
      setDeletingEmails([]);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const columns: ColumnDef<Subscriber>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Subscription Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div>{format(date, "MMM d, yyyy")}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const subscriber = row.original;
        const isDeleting = deletingEmails.includes(subscriber.email);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleCopyEmail(subscriber.email)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteEmail(subscriber.email)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove subscriber
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter emails..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm"
            autoComplete="off"
          />
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={deletingEmails.length > 0}
              className="min-w-fit whitespace-nowrap flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({table.getSelectedRowModel().rows.length})
            </Button>
          )}
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteAllDialog(true)}
              disabled={deletingEmails.length > 0}
              className="min-w-fit whitespace-nowrap flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border">
          <div className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No subscribers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {Math.ceil(totalCount / pagination.pageSize)} • {totalCount} total
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteEmail} onOpenChange={() => setDeleteEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteEmail} from your newsletter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEmail && handleDelete(deleteEmail)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {table.getSelectedRowModel().rows.length} subscriber
              {table.getSelectedRowModel().rows.length !== 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {table.getSelectedRowModel().rows.length} selected subscriber
              {table.getSelectedRowModel().rows.length !== 1 ? "s" : ""} from your newsletter? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowBulkDeleteDialog(false);
                handleBulkDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove {table.getSelectedRowModel().rows.length} subscriber
              {table.getSelectedRowModel().rows.length !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete ALL {totalCount} subscriber{totalCount !== 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove ALL {totalCount} subscriber{totalCount !== 1 ? "s" : ""} from your
              newsletter? This will completely empty your subscriber list and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteAllDialog(false);
                handleDeleteAll();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete ALL {totalCount} subscriber{totalCount !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
