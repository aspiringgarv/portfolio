import { Link, NavLink } from 'react-router-dom';

const SECTIONS = [['experience', 'experience'], ['projects', 'projects'], ['lab', 'lab']] as const;
const PAGES = [['/algorithms', 'algorithms']] as const;

const linkCls = (to: string) => ({ isActive }: { isActive: boolean }) =>
  `transition hover:text-lime ${isActive ? 'text-lime' : to === '/algorithms' ? 'flash-tab' : 'text-mist'}`;

function Links() {
  return (
    <>
      {SECTIONS.map(([id, label]) => (<li key={id} className="shrink-0"><Link to={`/#${id}`} className="text-mist transition hover:text-lime">{label}</Link></li>))}
      {PAGES.map(([to, label]) => (<li key={to} className="shrink-0"><NavLink to={to} className={linkCls(to)}>{label}</NavLink></li>))}
      <li className="shrink-0"><Link to="/#contact" className="text-mist transition hover:text-lime">contact</Link></li>
    </>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ink/70 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 font-mono text-sm" aria-label="Main">
        <Link to="/" className="text-lime">garv<span className="text-dim">@dev</span></Link>
        <ul className="hidden gap-5 sm:flex"><Links /></ul>
        <a href="/api/resume" target="_blank" rel="noopener" className="btn !py-1 !text-xs">resume</a>
      </nav>
      <ul className="flex gap-5 overflow-x-auto border-t border-line/50 px-5 py-2 font-mono text-xs sm:hidden"><Links /></ul>
    </header>
  );
}
