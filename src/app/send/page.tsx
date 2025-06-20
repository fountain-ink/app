import { TokenSend } from "@/components/token/token-send-page";
import { getUserAccount } from "@/lib/auth/get-user-profile";

// Wrapped GHO token address
const WGHO_ADDRESS = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F";

export default async function TokenSendPage() {
  const { address: accountAddress } = await getUserAccount();

  return <TokenSend accountAddress={accountAddress} tokenAddress={WGHO_ADDRESS} />;
}
