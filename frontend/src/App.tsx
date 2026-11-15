import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';

const AlgoHub = lazy(() => import('./pages/AlgoHub'));

const Fallback = <p className="p-10 text-center font-mono text-dim">loading...</p>;

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={Fallback}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="algorithms" element={<AlgoHub />} />
            <Route path="watch" element={<Navigate to="/algorithms#watch" replace />} />
            <Route path="cube" element={<Navigate to="/algorithms#cube" replace />} />
            <Route path="*" element={<p className="p-10 text-center font-mono text-dim">page not found</p>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
