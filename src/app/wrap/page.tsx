import { TokenWrap } from "@/components/token/token-wrap-page";
import { getUserAccount } from "@/lib/auth/get-user-profile";

// Wrapped GHO token address
const WGHO_ADDRESS = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F";

export default async function TokenWrapPage() {
  const { address: accountAddress } = await getUserAccount();

  return <TokenWrap accountAddress={accountAddress} tokenAddress={WGHO_ADDRESS} />;
}
