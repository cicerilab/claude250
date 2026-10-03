/**
 * Router dell'app standalone (non si porta).
 * Una sola rotta vera, `/concept-16`, caricata in lazy come nel sito; `/` e
 * qualsiasi altro percorso fanno redirect lì (i parametri `?segna=` ecc. si
 * provano direttamente su `/concept-16`).
 *
 * Fallback di Suspense vuoto: niente preloader (creative-director). Il fondo
 * carta lo dà già index.html.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const Concept16 = lazy(() => import('./pages/Concept16'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/concept-16" element={<Concept16 />} />
          <Route path="/" element={<Navigate to="/concept-16" replace />} />
          <Route path="*" element={<Navigate to="/concept-16" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
