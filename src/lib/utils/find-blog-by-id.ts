import { isEvmAddress } from "@/lib/utils/is-evm-address";

export async function findBlogByIdentifier(db: any, identifier: string) {
  if (isEvmAddress(identifier)) {
    return await db.from("blogs").select("*").eq("address", identifier).single();
  }
  return await db.from("blogs").select("*").eq("handle", identifier).single();
}
