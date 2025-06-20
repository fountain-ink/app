"use client";

import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

interface Winner {
  id: number;
  post_slug: string;
  place: number;
  prize_amount: string;
  transaction_hash?: string;
  added_at: string;
}

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWinner, setAddingWinner] = useState(false);
  const [winnerForm, setWinnerForm] = useState({
    post_slug: "",
    place: "",
    prize_amount: "",
    transaction_hash: "",
  });

  const fetchContest = async () => {
    try {
      const res = await fetch(`/api/admin/contests/${contestId}`);
      if (res.ok) {
        const data = await res.json();
        setContest(data);
      }
    } catch (error) {
      console.error("Error fetching contest:", error);
    }
  };

  const fetchWinners = async () => {
    try {
      const res = await fetch(`/api/admin/contests/${contestId}/winners`);
      if (res.ok) {
        const data = await res.json();
        setWinners(data);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
    fetchWinners();
  }, [contestId]);

  const handleAddWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingWinner(true);

    try {
      const res = await fetch(`/api/admin/contests/${contestId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: winnerForm.post_slug,
          place: Number.parseInt(winnerForm.place),
          prize_amount: winnerForm.prize_amount,
          transaction_hash: winnerForm.transaction_hash || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Winner added successfully");
        setWinnerForm({ post_slug: "", place: "", prize_amount: "", transaction_hash: "" });
        fetchWinners();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add winner");
      }
    } catch (error) {
      toast.error("Failed to add winner");
    } finally {
      setAddingWinner(false);
    }
  };

  const handleRemoveWinner = async (winnerId: number) => {
    if (!confirm("Are you sure you want to remove this winner?")) return;

    try {
      const res = await fetch(`/api/admin/contests/${contestId}/winners?id=${winnerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Winner removed successfully");
        fetchWinners();
      } else {
        toast.error("Failed to remove winner");
      }
    } catch (error) {
      toast.error("Failed to remove winner");
    }
  };

  if (loading || !contest) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col mt-5 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/admin/contests")} className="mb-4 w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Contests
      </Button>

      <div className="mb-6">
        <h2 className="font-bold text-2xl mb-2">{contest.name}</h2>
        {contest.theme && <p className="text-muted-foreground">{contest.theme}</p>}
        <div className="flex gap-4 mt-3">
          <Badge>{contest.status}</Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(contest.start_date)} - {formatDate(contest.end_date)}
          </span>
          <span className="text-sm font-medium">${contest.prize_pool.total} Prize Pool</span>
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Contest Winners</h3>

          {winners.length > 0 ? (
            <div className="space-y-3 mb-6">
              {winners.map((winner) => (
                <div key={winner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{winner.place}</Badge>
                    <Link
                      href={`/p/${winner.post_slug}`}
                      target="_blank"
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {winner.post_slug}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-muted-foreground">${winner.prize_amount}</span>
                    {winner.transaction_hash && (
                      <Link
                        href={`https://lenscan.io/tx/${winner.transaction_hash}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Transaction
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveWinner(winner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mb-6">No winners added yet</p>
          )}

          <form onSubmit={handleAddWinner} className="border rounded-lg p-6 space-y-4">
            <h4 className="font-medium mb-2">Add Winner</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post_slug">Post Slug</Label>
                <Input
                  id="post_slug"
                  value={winnerForm.post_slug}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, post_slug: e.target.value }))}
                  placeholder="0x1234..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="place">Place</Label>
                <Input
                  id="place"
                  type="number"
                  min="1"
                  value={winnerForm.place}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, place: e.target.value }))}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prize_amount">Prize Amount ($)</Label>
                <Input
                  id="prize_amount"
                  value={winnerForm.prize_amount}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, prize_amount: e.target.value }))}
                  placeholder="500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="transaction_hash">Transaction Hash (optional)</Label>
                <Input
                  id="transaction_hash"
                  value={winnerForm.transaction_hash}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, transaction_hash: e.target.value }))}
                  placeholder="0xabc..."
                />
              </div>
            </div>

            <Button type="submit" disabled={addingWinner}>
              <Plus className="w-4 h-4 mr-2" />
              {addingWinner ? "Adding..." : "Add Winner"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
