/**
 * Router dell'app standalone (non si porta).
 * Una sola rotta vera, `/concept-15`, caricata in lazy come nel sito; `/` e
 * qualsiasi altro percorso fanno redirect lì, conservando query e hash
 * (`/?oggi=2026-10-05#gradi-90` → `/concept-15?oggi=2026-10-05#gradi-90`).
 *
 * Il fallback di Suspense è vuoto di proposito: niente preloader (vietato
 * dal creative-director). Il fondo albicocca lo dà già index.html.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

const Concept15 = lazy(() => import('./pages/Concept15'));

function AlConcept() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/concept-15', search, hash }} replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/concept-15" element={<Concept15 />} />
          <Route path="*" element={<AlConcept />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
