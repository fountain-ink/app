import { ConnectKitButton } from "connectkit";
import { Button } from "../ui/button";

export const ConnectWalletButton = () => {
  return (
    <ConnectKitButton.Custom >
      {({ isConnected, show }) => {
        if (!isConnected) {
          return (
            <Button variant="default" onClick={show}>
              Login
            </Button>
          );
        }
      }}
    </ConnectKitButton.Custom>
  );
};
