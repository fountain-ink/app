"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContestCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ContestCreateModal({ onClose, onSuccess }: ContestCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    theme: "",
    prizeTotal: "",
    startDate: "",
    endDate: "",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          theme: formData.theme,
          prize_pool: {
            total: formData.prizeTotal,
            distribution: {},
          },
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Contest created successfully");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create contest");
      }
    } catch (error) {
      toast.error("Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Contest</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Contest Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Week 1 Contest"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="week-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="theme">Theme (optional)</Label>
            <Textarea
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
              placeholder="Creative Writing Challenge"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="prizeTotal">Total Prize Pool ($)</Label>
            <Input
              id="prizeTotal"
              type="number"
              value={formData.prizeTotal}
              onChange={(e) => setFormData((prev) => ({ ...prev, prizeTotal: e.target.value }))}
              placeholder="1000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Contest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
