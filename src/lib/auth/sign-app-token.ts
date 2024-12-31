import { sign } from 'jsonwebtoken';
import { getLensClientWithToken } from './get-lens-client';
import { getUserProfile } from './get-user-profile';
import { env } from '@/env';

const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET;

export async function signAppToken(refreshToken: string) {
  const lens = await getLensClientWithToken(refreshToken);
  const profile = await getUserProfile(lens);

  if (!profile?.profileId || !profile?.handle) {
    throw new Error('Invalid Lens profile');
  }

  const claims = {
    sub: profile.profileId,
    role: 'authenticated',
    user_metadata: {
      profileId: profile.profileId,
      handle: profile.handle,
    }
  };

  const jwt = sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30d',
    issuer: 'fountain.ink'
  });

  return { jwt, profile };
}