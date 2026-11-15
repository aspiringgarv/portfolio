import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal';
import { PipelineLab } from './PipelineLab';
import { PaymentLab } from './PaymentLab';

export function Lab() {
  return (
    <section id="lab" className="section">
      <Reveal>
        <h2 className="h2">lab</h2>
        <p className="mb-8 max-w-2xl text-mist">
          Two small demos of the kind of backend problems I work on. Both call Java endpoints on this site's own
          Spring Boot backend; the browser only draws the result. For shortest-path search and more, see the{' '}
          <Link to="/algorithms" className="text-lime underline decoration-lime/40 hover:decoration-lime">algorithms page</Link>.
        </p>
      </Reveal>
      <div className="space-y-6">
        <Reveal><PipelineLab /></Reveal>
        <Reveal><PaymentLab /></Reveal>
      </div>
    </section>
  );
}
