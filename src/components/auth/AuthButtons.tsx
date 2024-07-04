"use client";

import { useActiveAccount } from "thirdweb/react";
import { generatePayload, login, logout  } from "@/actions/login";
import { signLoginPayload } from "thirdweb/auth";
import { Button } from "../ui/button";

export const LoginButton: React.FC = () => {
  const account = useActiveAccount();

  async function handleClick() {
    if (!account) {
      return alert("Please connect your wallet");
    }
    // Step 1: Generate the payload
    const payload = await generatePayload({ address: account.address });
    // Step 2: Sign the payload
    const signatureResult = await signLoginPayload({ account, payload });
    // Step 3: Call the login function we defined in the auth actions file
    await login(signatureResult);
  }

  return (
    <Button disabled={!account} onClick={handleClick}>
      Login
    </Button>
  );
};

export const LogOutButton: React.FC = () => {
	async function handleClick() {
		await logout();
	}
	return <Button onClick={handleClick}>Log out</Button>;
};