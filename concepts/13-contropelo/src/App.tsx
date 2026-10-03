/**
 * Router dell'app standalone (non si porta).
 * Una sola rotta vera, `/concept-13`, caricata in lazy come nel sito; `/` e
 * qualsiasi altro percorso fanno redirect lì.
 *
 * Il fallback di Suspense è vuoto di proposito: niente preloader (vietato
 * dal creative-director). Il fondo nero grasso lo dà già index.html.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const Concept13 = lazy(() => import('./pages/Concept13'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/concept-13" element={<Concept13 />} />
          <Route path="/" element={<Navigate to="/concept-13" replace />} />
          <Route path="*" element={<Navigate to="/concept-13" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
