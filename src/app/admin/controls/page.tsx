"use client";

import { evmAddress, url } from "@lens-protocol/client";
import { addAppAuthorizationEndpoint, removeAppAuthorizationEndpoint } from "@lens-protocol/client/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLensClient, getPublicClient } from "@/lib/lens/client";

export default function AppControlsPage() {
  const [endpoint, setEndpoint] = useState("");
  const [appAddress, setAppAddress] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address: walletAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleAddEndpoint = async () => {
    try {
      setIsLoading(true);
      const publicClient = await getPublicClient();

      const builderAuth = await publicClient.login({
        builder: {
          address: evmAddress(walletAddress ?? ""),
        },
        signMessage: async (message: string) => {
          return await signMessageAsync({ message });
        },
      });
      if (builderAuth.isErr()) {
        toast.error("Failed to login");
        return;
      }

      const sessionClient = await getLensClient();

      if (!sessionClient.isSessionClient()) {
        toast.error("Please login first");
        return;
      }

      const result = await addAppAuthorizationEndpoint(sessionClient, {
        endpoint: url(endpoint),
        app: evmAddress(appAddress),
        bearerToken: bearerToken,
      });

      if (result.isErr()) {
        toast.error(`Failed to add endpoint: ${result.error.message}`);
        return;
      }

      toast.success("Authorization endpoint added successfully");
      setEndpoint("");
      setAppAddress("");
      setBearerToken("");
    } catch (error) {
      toast.error("An error occurred while adding the endpoint");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEndpoint = async () => {
    try {
      setIsLoading(true);
      const sessionClient = await getLensClient();

      if (!sessionClient.isSessionClient()) {
        toast.error("Please login first");
        return;
      }

      const result = await removeAppAuthorizationEndpoint(sessionClient, {
        app: evmAddress(appAddress),
      });

      if (result.isErr()) {
        toast.error(`Failed to remove endpoint: ${result.error.message}`);
        return;
      }

      toast.success("Authorization endpoint removed successfully");
      setAppAddress("");
    } catch (error) {
      toast.error("An error occurred while removing the endpoint");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Controls</CardTitle>
          <CardDescription>Manage core settings and functionalities of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lens Protocol Authorization Endpoint</Label>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://myserver.com/path/to/endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appAddress">App Address</Label>
                  <Input
                    id="appAddress"
                    placeholder="0x..."
                    value={appAddress}
                    onChange={(e) => setAppAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bearerToken">Bearer Token</Label>
                  <Input
                    id="bearerToken"
                    type="password"
                    placeholder="Enter bearer token"
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddEndpoint} disabled={isLoading || !endpoint || !appAddress || !bearerToken}>
                    {isLoading ? "Adding..." : "Add Authorization Endpoint"}
                  </Button>
                  <Button variant="destructive" onClick={handleRemoveEndpoint} disabled={isLoading || !appAddress}>
                    {isLoading ? "Removing..." : "Remove Authorization Endpoint"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
