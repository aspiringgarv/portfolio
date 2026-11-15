import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';

const Algorithms = lazy(() => import('./pages/Algorithms'));
const CubePage = lazy(() => import('./pages/Cube'));

const Fallback = <p className="p-10 text-center font-mono text-dim">loading...</p>;

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={Fallback}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="algorithms" element={<Algorithms />} />
            <Route path="cube" element={<CubePage />} />
            <Route path="*" element={<p className="p-10 text-center font-mono text-dim">page not found</p>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
