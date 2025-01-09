"use client";

import { Button } from "@/components/ui/button";
import { LensAuth } from "@/lib/lens/app";
import { Context, SessionClient } from "@lens-protocol/client";
import { useState } from "react";

const Auth = () => {
  const [sessionClient, setSessionClient] = useState<SessionClient<Context> | null>(null);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const { authenticate, uploadMetadata, createLensApp } = LensAuth();

  const handleAuth = async () => {
    const client = await authenticate();
    if (client) {
      setSessionClient(client);
      console.log("Authenticated successfully");
    }
  };

  const handleUpload = async () => {
    const uri = await uploadMetadata();
    if (uri) {
      setMetadataUri(uri);
      console.log("Metadata uploaded successfully");
    }
  };

  const handleDeploy = async () => {
    if (!sessionClient || !metadataUri) {
      console.error("Please authenticate and upload metadata first");
      return;
    }
    console.log(sessionClient, metadataUri);
    const app = await createLensApp(sessionClient, metadataUri);
    console.log("App deployed:", app);
  };

  return (
    <div className="flex flex-col gap-4 m-20">
      <Button onClick={handleAuth}>{sessionClient ? "Authenticated ✓" : "Authenticate with Lens"}</Button>
      <Button onClick={handleUpload} disabled={!sessionClient} variant={metadataUri ? "default" : "secondary"}>
        {metadataUri ? "Metadata Uploaded ✓" : "Upload Metadata"}
      </Button>
      <Button
        onClick={handleDeploy}
        disabled={!sessionClient || !metadataUri}
        variant={sessionClient && metadataUri ? "default" : "secondary"}
      >
        Deploy App
      </Button>
    </div>
  );
};

export default Auth;
