import { api } from '../lib/api';
import type { Profile } from '../lib/types';

export type Line = string | { text: string; href: string };

export interface TerminalContext { profile: Profile; clear: () => void }

/** Command pattern: each terminal command is a self-describing object in the registry below. */
export interface TerminalCommand {
  name: string;
  description: string;
  run(ctx: TerminalContext): Line[] | Promise<Line[]>;
}

const bullets = (items: string[]): Line[] => items.map((i) => `  - ${i}`);

const commands: TerminalCommand[] = [
  { name: 'about', description: 'who am i', run: ({ profile }) => [profile.about] },
  {
    name: 'experience',
    description: 'where i work',
    run: ({ profile }) =>
      profile.experience.flatMap((e) => [
        `${e.company}`,
        ...e.roles.map((r) => `  ${r.title} (${r.period})`),
        ...bullets(e.points),
      ]),
  },
  {
    name: 'projects',
    description: 'things i built',
    run: ({ profile }) =>
      profile.projects.flatMap((p) => [
        `${p.title}: ${p.subtitle} [${p.stack.join(', ')}]`,
        ...p.links.map((l) => ({ text: `  ${l.label} -> ${l.url}`, href: l.url })),
      ]),
  },
  {
    name: 'skills',
    description: 'what i know',
    run: ({ profile }) => Object.entries(profile.skills).map(([k, v]) => `${k.padEnd(14)} ${v.join(', ')}`),
  },
  { name: 'achievements', description: 'contest results', run: ({ profile }) => bullets(profile.achievements) },
  {
    name: 'profiles',
    description: 'coding profiles',
    run: ({ profile }) => profile.profiles.map((p) => ({ text: `${p.name.padEnd(11)} ${p.handle}  ${p.url}`, href: p.url })),
  },
  {
    name: 'contact',
    description: 'get in touch',
    run: ({ profile }) => [
      { text: `email    ${profile.email}`, href: `mailto:${profile.email}` },
      { text: `linkedin ${profile.links.linkedin}`, href: profile.links.linkedin },
      { text: `github   ${profile.links.github}`, href: profile.links.github },
    ],
  },
  {
    name: 'lab',
    description: 'demos, algorithms page, cube solver',
    run: () => ['~/lab on the home page: retry + dead-letter simulator and the GoPay payment state machine (Java endpoints under /api/lab).', { text: 'algorithms page: A* / Dijkstra / BFS visualizer and contest tricks -> /algorithms', href: '/algorithms' }, { text: 'rubik\'s cube solver -> /cube', href: '/cube' }],
  },
  { name: 'resume', description: 'open my resume (pdf)', run: () => [{ text: 'opening /api/resume ...', href: '/api/resume' }] },
  {
    name: 'visitors',
    description: 'how many people stopped by',
    run: async () => [`total visits: ${(await api.stats()).visits.toLocaleString()}`],
  },
  {
    name: 'guestbook',
    description: 'latest guestbook entries',
    run: async () => {
      const list = (await api.guestbook()).slice(0, 5);
      return list.length ? list.map((g) => `${g.name}: ${g.text}`) : ['no entries yet. be the first below.'];
    },
  },
  {
    name: 'hire',
    description: 'make me wave',
    run: ({ profile }) => {
      window.dispatchEvent(new CustomEvent('owner:wave'));
      return ['*waves*  open to great engineering roles.', { text: `write to ${profile.email}`, href: `mailto:${profile.email}` }];
    },
  },
  { name: 'whoami', description: 'you', run: () => ['a curious visitor. check the dock (bottom right) to name yourself.'] },
  { name: 'clear', description: 'clear the screen', run: ({ clear }) => (clear(), []) },
];

export const REGISTRY: Map<string, TerminalCommand> = new Map(commands.map((c) => [c.name, c]));

REGISTRY.set('help', {
  name: 'help',
  description: 'list commands',
  run: () => Array.from(REGISTRY.values()).map((c) => `  ${c.name.padEnd(13)} ${c.description}`),
});

export const COMMAND_NAMES = () => Array.from(REGISTRY.keys());
