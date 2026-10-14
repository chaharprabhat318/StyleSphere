import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { WardrobePage } from './pages/WardrobePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { TryOnPage } from './pages/TryOnPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { RoomMakeoverPage } from './pages/RoomMakeoverPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing View */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated / Studio Layout Views */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/try-on" element={<TryOnPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/room-makeover" element={<RoomMakeoverPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
