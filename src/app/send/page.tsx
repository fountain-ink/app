import { getUserProfile } from "@/lib/auth/get-user-profile";
import { TokenSend } from "@/components/token/token-send-page";

// Wrapped GHO token address
const WGHO_ADDRESS = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F";

export default async function TokenSendPage() {
  const { address: accountAddress } = await getUserProfile();

  return <TokenSend accountAddress={accountAddress} tokenAddress={WGHO_ADDRESS} />;
} 