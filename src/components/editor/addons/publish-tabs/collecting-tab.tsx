import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CircleDollarSign, Clock, ShoppingBagIcon, Star, Users } from "lucide-react";
import { useState } from "react";

export const CollectingTab = () => {
  const [isCollectingEnabled, setIsCollectingEnabled] = useState(false);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-4 h-4" />
            <Label htmlFor="collecting">Enable Collecting</Label>
          </div>
          <div className="text-sm text-muted-foreground">Allow users to collect this post</div>
        </div>
        <Switch
          id="collecting"
          checked={isCollectingEnabled}
          onCheckedChange={setIsCollectingEnabled}
        />
      </div>

      {isCollectingEnabled && (
        <div className="space-y-6 pl-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4" />
                <Label htmlFor="charge">Charge for collecting</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                Get paid whenever someone collects your post
              </div>
            </div>
            <Switch id="charge" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <Label htmlFor="exclusive">Exclusive content</Label>
              </div>
              <div className="text-sm text-muted-foreground">Make collects limited edition</div>
            </div>
            <Switch id="exclusive" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Label htmlFor="timeLimit">Time limit</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                Limit collecting to specific period of time
              </div>
            </div>
            <Switch id="timeLimit" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <Label htmlFor="exclusivity">Exclusivity</Label>
              </div>
              <div className="text-sm text-muted-foreground">Only followers can collect</div>
            </div>
            <Switch id="exclusivity" />
          </div>
        </div>
      )}
    </div>
  );
};