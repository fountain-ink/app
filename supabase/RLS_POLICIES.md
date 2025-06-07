# Row Level Security (RLS) Policies

This document describes the RLS policies implemented for the Fountain application.

## Overview

All tables have RLS enabled. The application uses a custom JWT authentication system (not Supabase Auth), where tokens are validated using `auth.jwt()` with the following structure:

```json
{
  "sub": "user_address",
  "role": "authenticated",
  "metadata": {
    "isAdmin": boolean,
    "isAnonymous": boolean,
    "username": string,
    "address": string
  }
}
```