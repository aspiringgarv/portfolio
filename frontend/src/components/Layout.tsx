import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from './Nav';
import { ParticleBackground } from './ParticleBackground';
import { LiveLayer } from './LiveLayer';
import { LiveDock } from './LiveDock';
import { useLive } from '../hooks/useLive';
import { useIdentity } from '../lib/identity';

export function Layout() {
  const me = useIdentity();
  const live = useLive(me, true);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />
      <Nav />
      <Outlet />
      <footer className="border-t border-line pb-24 pt-8 text-center font-mono text-xs text-dim">
        built with Spring Boot + React · Garv Arora
      </footer>
      <LiveLayer peers={live.peers.filter((p) => p.page === pathname)} reactions={live.reactions} />
      <LiveDock me={me} online={live.online} peers={live.peers} onReact={live.react} />
    </div>
  );
}
