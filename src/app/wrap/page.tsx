import { getUserProfile } from "@/lib/auth/get-user-profile";
import { TokenWrapClientPage } from "@/components/token/token-wrap-page";

// Wrapped GHO token address
const WGHO_ADDRESS = "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8";

export default async function TokenWrapPage() {
  const { address: accountAddress } = await getUserProfile();

  return (
    <TokenWrapClientPage
      accountAddress={accountAddress}
      wghoAddress={WGHO_ADDRESS}
    />
  );
} 