import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../lib/types';

let cache: Profile | null = null;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(cache);
  const [error, setError] = useState('');
  useEffect(() => {
    if (cache) return;
    api.profile().then((p) => { cache = p; setProfile(p); }).catch((e: Error) => setError(e.message));
  }, []);
  return { profile, error };
}
