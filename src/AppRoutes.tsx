import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import AnimeList from './pages/AnimeList';
import WaifuList from './pages/WaifuList';
import WaifuDetail from './pages/WaifuDetail';
import Favourites from './pages/Favourites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAnime from './pages/admin/ManageAnime';
import ManageWaifu from './pages/admin/ManageWaifu';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/anime" element={<AnimeList />} />
        <Route path="/waifus" element={<WaifuList />} />
        <Route path="/waifu/:id" element={<WaifuDetail />} />
        <Route
          path="/favourites"
          element={
            <AuthGuard>
              <Favourites />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <AuthGuard requireAdmin>
              <AdminDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/anime"
          element={
            <AuthGuard requireAdmin>
              <ManageAnime />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/waifus"
          element={
            <AuthGuard requireAdmin>
              <ManageWaifu />
            </AuthGuard>
          }
        />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

