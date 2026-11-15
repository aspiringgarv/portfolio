export interface Stat { value: string; label: string; note: string }
export interface ExperienceRole { title: string; period: string }
export interface Experience { company: string; roles: ExperienceRole[]; points: string[] }
export interface ProjectLink { label: string; url: string }
export interface Project { title: string; subtitle: string; stack: string[]; points: string[]; links: ProjectLink[] }
export interface Leadership { title: string; org: string; period: string; text: string }
export interface CodingProfile { id: string; name: string; handle: string; url: string; note: string }
export interface Education { school: string; degree: string; period: string; grade: string }

export interface Profile {
  name: string;
  handle: string;
  title: string;
  roles: string[];
  tagline: string;
  about: string;
  email: string;
  phone: string;
  links: Record<string, string>;
  stats: Stat[];
  experience: Experience[];
  projects: Project[];
  skills: Record<string, string[]>;
  achievements: string[];
  leadership: Leadership[];
  education: Education[];
  profiles: CodingProfile[];
}

export interface GuestbookEntry { id: number; name: string; text: string; avatarSeed: string; createdAt: string }

export interface PipelineEvent { id: number; attempts: number; outcome: 'DELIVERED' | 'RECOVERED' | 'DEAD_LETTER'; backoffMs: number[]; totalWaitMs: number }
export interface PipelineResult { events: PipelineEvent[]; deliveredFirstTry: number; recovered: number; deadLettered: number; recoveryRate: number }
export interface Transition { from: string; event: string; to: string }
export interface PathfindResult { found: boolean; visited: number[]; path: number[]; cost: number; visitedCount: number }
