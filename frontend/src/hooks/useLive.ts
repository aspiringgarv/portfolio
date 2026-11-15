import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Identity } from '../lib/identity';

export interface LivePeer { id: string; name: string; color: string; seed: string; x?: number; y?: number; page?: string }
export interface LiveReaction { key: number; emoji: string; x: number; y: number }

type Inbound =
  | { t: 'hello'; id: string; color: string; seed: string; name: string; online: number; peers: LivePeer[] }
  | { t: 'join'; online: number; peer: LivePeer }
  | { t: 'leave'; id: string; online: number }
  | { t: 'move'; id: string; x: number; y: number; p?: string }
  | { t: 'profile'; id: string; name: string; seed: string }
  | { t: 'react'; id: string; emoji: string; x: number; y: number };

/**
 * Observer over the /live WebSocket. Peer positions live in a ref and re-render is
 * batched to one per animation frame, so a busy room doesn't thrash React.
 */
export function useLive(me: Identity, enabled: boolean) {
  const peers = useRef(new Map<string, LivePeer>());
  const [online, setOnline] = useState(0);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [, force] = useReducer((n: number) => n + 1, 0);
  const wsRef = useRef<WebSocket | null>(null);
  const meRef = useRef(me);
  const pointer = useRef({ x: 0.5, y: 0 });
  const raf = useRef(0);
  const key = useRef(0);
  meRef.current = me;

  const schedule = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => { raf.current = 0; force(); });
  }, []);

  const pushReaction = useCallback((emoji: string, x: number, y: number) => {
    const k = ++key.current;
    setReactions((r) => [...r.slice(-20), { key: k, emoji, x, y }]);
    setTimeout(() => setReactions((r) => r.filter((i) => i.key !== k)), 1900);
  }, []);

  const sendRaw = useCallback((obj: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let closed = false;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout>;

    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${location.host}/live`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        let m: Inbound;
        try { m = JSON.parse(ev.data as string) as Inbound; } catch { return; }
        switch (m.t) {
          case 'hello':
            retry = 0;
            peers.current.clear();
            m.peers.forEach((p) => peers.current.set(p.id, p));
            setOnline(m.online);
            if (meRef.current.name) sendRaw({ t: 'profile', name: meRef.current.name, seed: meRef.current.seed });
            else sendRaw({ t: 'profile', name: m.name, seed: meRef.current.seed });
            break;
          case 'join': peers.current.set(m.peer.id, m.peer); setOnline(m.online); break;
          case 'leave': peers.current.delete(m.id); setOnline(m.online); break;
          case 'move': {
            const p = peers.current.get(m.id);
            if (p) { p.x = m.x; p.y = m.y; p.page = m.p ?? '/'; }
            break;
          }
          case 'profile': {
            const p = peers.current.get(m.id);
            if (p) { p.name = m.name; p.seed = m.seed; }
            break;
          }
          case 'react': pushReaction(m.emoji, m.x, m.y); break;
        }
        schedule();
      };

      ws.onclose = () => {
        peers.current.clear();
        setOnline(0);
        schedule();
        if (closed) return;
        retry = Math.min(retry + 1, 6);
        timer = setTimeout(connect, Math.min(10_000, 500 * 2 ** retry));
      };
    };
    connect();

    let last = 0;
    const onMove = (e: PointerEvent) => {
      const w = document.documentElement.scrollWidth || 1;
      pointer.current = { x: Math.min(1, e.pageX / w), y: e.pageY };
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      sendRaw({ t: 'move', x: pointer.current.x, y: pointer.current.y, p: location.pathname });
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      closed = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      window.removeEventListener('pointermove', onMove);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, pushReaction, schedule, sendRaw]);

  useEffect(() => {
    sendRaw({ t: 'profile', name: me.name, seed: me.seed });
  }, [me.name, me.seed, sendRaw]);

  const react = useCallback((emoji: string) => {
    const { x, y } = pointer.current;
    sendRaw({ t: 'react', emoji, x, y });
    pushReaction(emoji, x, y);
  }, [pushReaction, sendRaw]);

  return { peers: Array.from(peers.current.values()), online, reactions, react };
}
