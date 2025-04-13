import { TokenClaims } from "./app-token";

// Hardcoded list of admin addresses for now 
export const ADMINS = [
  "0x1C03475F4ceA795F255282774A762979f9550611",
  "0xaAd118e88CC813b9915243db41909A2ee4559300",
  "0xdB49CA48058680B2DeD6c44E65DEe912b3d7Fa4d",
  "0x0C7Ac913d7D2932cbF0fae66e5CDF53E71bB9Ad5"
];

/**
 * Checks if a user is an admin based on their address
 * @param claims The token claims containing the user's address
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(claims?: TokenClaims | null): boolean {
  if (!claims) {
    return false;
  }
  
  const userAddress = claims.sub;
  
  return ADMINS.includes(userAddress);
} 