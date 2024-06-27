"use client";

import { useActiveAccount } from "thirdweb/react";
import { generatePayload, login } from "@/actions/login";
import { signLoginPayload } from "thirdweb/auth";

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
    <button type="button" disabled={!account} onClick={handleClick}>
      Login
    </button>
  );
};