import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          Collaborate with team members and manage permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Collaboration
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Invite collaborators and manage team access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Team features coming soon</p>
            <p className="text-sm">Collaborate with your team on content</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}