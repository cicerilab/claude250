/**
 * Router dell'app standalone (non si porta).
 * Una sola rotta vera, `/concept-10`, caricata in lazy come nel sito; `/` e
 * qualsiasi altro percorso fanno redirect lì.
 *
 * Il fallback di Suspense è vuoto di proposito: niente preloader (vietato
 * dal creative-director). Il fondo Citrino/Grafite lo dà già index.html.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const Concept10 = lazy(() => import('./pages/Concept10'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/concept-10" element={<Concept10 />} />
          <Route path="/" element={<Navigate to="/concept-10" replace />} />
          <Route path="*" element={<Navigate to="/concept-10" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
