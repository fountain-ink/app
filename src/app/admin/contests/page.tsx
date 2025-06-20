"use client";

import { Calendar, DollarSign, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContestCreateModal } from "@/components/admin/contest-create-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface Contest {
  id: string;
  slug: string;
  name: string;
  theme: string;
  prize_pool: { total: string; distribution: Record<string, string> };
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "ended";
  created_at: string;
}

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchContests = async () => {
    try {
      const res = await fetch("/api/admin/contests");
      if (res.ok) {
        const data = await res.json();
        setContests(data);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const getStatusBadge = (status: Contest["status"]) => {
    const variants = {
      upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-800" },
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      ended: { label: "Ended", className: "bg-gray-100 text-gray-800" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="flex flex-col mt-5 max-w-6xl">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-2xl">Manage Contests</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Contest
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">Create and manage writing contests with prize distributions.</p>

      <Separator className="w-full bg-border mb-8" />

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading contests...</div>
      ) : contests.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No contests created yet</p>
          <Button onClick={() => setShowCreateModal(true)}>Create First Contest</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => (
            <Link
              key={contest.id}
              href={`/admin/contests/${contest.id}`}
              className="block p-6 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{contest.name}</h3>
                {getStatusBadge(contest.status)}
              </div>
              {contest.theme && <p className="text-muted-foreground mb-3">{contest.theme}</p>}
              <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(contest.start_date)} - {formatDate(contest.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{contest.prize_pool.total} Prize Pool</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <ContestCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchContests();
          }}
        />
      )}
    </div>
  );
}
