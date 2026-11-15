import { Reveal } from '../components/Reveal';
import { SortRace } from '../components/lab/SortRace';
import { NQueens } from '../components/lab/NQueens';

export default function Visualizer() {
  return (
    <div className="pt-8">
      <Reveal>
        <p className="font-mono text-sm text-dim">press start and watch</p>
        <h2 className="mt-2 font-mono text-2xl text-white">algorithms in motion</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist">
          Six sorting algorithms get the same 40 numbers and race. Counters show compares and writes, so you can see
          why O(n²) falls behind and why insertion sort wins on nearly sorted input. Below, a backtracking solver
          places queens one row at a time.
        </p>
      </Reveal>
      <section className="mt-12" aria-labelledby="race">
        <h2 id="race" className="h2">sorting race</h2>
        <SortRace />
      </section>
      <section className="mt-16" aria-labelledby="queens">
        <h2 id="queens" className="h2">n-queens backtracking</h2>
        <NQueens />
      </section>
    </div>
  );
}
