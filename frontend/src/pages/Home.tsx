import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';
import { CodingProfiles } from '../components/CodingProfiles';
import { Experience } from '../components/Experience';
import { Projects } from '../components/Projects';
import { Terminal } from '../components/Terminal';
import { Skills } from '../components/Skills';
import { Guestbook } from '../components/Guestbook';
import { Contact } from '../components/Contact';
import { Lab } from '../components/lab/Lab';
import { useProfile } from '../hooks/useProfile';
import { useVisits } from '../hooks/useVisits';

export default function Home() {
  const { profile, error } = useProfile();
  const visits = useVisits();
  if (!profile) {
    return <p className="p-10 text-center font-mono text-dim">{error ? `could not load profile: ${error}` : 'loading...'}</p>;
  }
  return (
    <main>
      <Hero profile={profile} visits={visits} />
      <Stats stats={profile.stats} />
      <CodingProfiles profiles={profile.profiles} />
      <Experience profile={profile} />
      <Projects projects={profile.projects} />
      <Lab />
      <Terminal profile={profile} />
      <Skills profile={profile} />
      <Guestbook />
      <Contact profile={profile} />
    </main>
  );
}
