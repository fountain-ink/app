export interface TokenMetadata {
  isAnonymous: boolean;
  username: string;
  address: string;
}

export interface TokenClaims {
  sub: string;
  role: "authenticated";
  metadata: TokenMetadata;
  iss?: string;
  exp?: number;
}

export interface LensIdToken {
  sub: string; // signedBy address
  iss: string; // API endpoint
  aud: string; // App address
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
  sid: string; // Session ID
  act?: string; // Optional account address for managers
  "tag:lens.dev,2024:sponsored"?: boolean;
  "tag:lens.dev,2024:role"?: "ACCOUNT_OWNER" | "ACCOUNT_MANAGER" | "ONBOARDING_USER" | "BUILDER";
}

export type AppToken = string;
