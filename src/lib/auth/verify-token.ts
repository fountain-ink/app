import jwt from "jsonwebtoken";

export const verifyToken = (token?: string, secret?: string): boolean => {
  if (!token || !secret) {
    console.error("Token verification failed: token or secret is missing");
    return false;
  }

  try {
    jwt.verify(token, secret);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};
