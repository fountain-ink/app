"use client";
import { ConnectKitButton } from "connectkit";
import { Button } from "../ui/button";

interface ConnectWalletButtonProps {
  text: string;
  className?: string;
}

export const ConnectWalletButton = ({ text = "Login", className }: ConnectWalletButtonProps) => {
  return (
    <ConnectKitButton.Custom >
      {({ isConnected, show }) => {
        if (!isConnected) {
          return (
            <Button variant="default" onClick={show} className={className}>
              {text}
            </Button>
          );
        }
      }}
    </ConnectKitButton.Custom>
  );
};
