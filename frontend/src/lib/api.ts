import type { GuestbookEntry, PathfindResult, PipelineResult, Profile, Transition } from './types';

/** All backend errors arrive as {"error": "..."}; surface that message directly. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed.');
  return data as T;
}

const post = <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) });

export const lab = {
  pipeline: (b: { events: number; failureRate: number; maxRetries: number; baseDelayMs: number; seed?: number }) =>
    post<PipelineResult>('/api/lab/pipeline', b),
  transitions: () => request<Transition[]>('/api/lab/payment/transitions'),
  transition: (status: string, event: string) => post<Transition>('/api/lab/payment/transition', { status, event }),
  pathfind: (b: { rows: number; cols: number; cells: number[]; start: number; end: number; algorithm: string }) =>
    post<PathfindResult>('/api/lab/pathfind', b),
};

export const api = {
  profile: () => request<Profile>('/api/profile'),
  visit: () => post<{ visits: number }>('/api/visit', {}),
  stats: () => request<{ visits: number }>('/api/stats'),
  guestbook: () => request<GuestbookEntry[]>('/api/guestbook'),
  sign: (body: { name: string; text: string; avatarSeed: string }) => post<GuestbookEntry>('/api/guestbook', body),
  contact: (body: { name: string; email: string; message: string; website: string }) =>
    post<{ ok: boolean }>('/api/contact', body),
};
