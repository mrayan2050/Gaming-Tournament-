import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GamesProvider } from './context/GamesContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import LoginPage from './pages/LoginPage';
import WalletPage from './pages/WalletPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from "./pages/ProfilePage";
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminTournamentResults from './pages/admin/AdminTournamentResults';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import RefundPolicyPage from './pages/legal/RefundPolicyPage';
import FairPlayRulesPage from './pages/legal/FairPlayRulesPage';

export default function App() {
  return (
    <AuthProvider>
      <GamesProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a27',
              color: '#e2e2f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:gameId" element={<GameDetailPage />} />
            <Route path="/tournament/:id" element={<TournamentDetailPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/fair-play-rules" element={<FairPlayRulesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Login outside main layout so it can be full-screen */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin panel — its own layout, guarded by AdminRoute */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="tournaments/:id/results" element={<AdminTournamentResults />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </GamesProvider>
    </AuthProvider>
  );
}