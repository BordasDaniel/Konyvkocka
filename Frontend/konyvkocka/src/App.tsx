import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import './App.css'
import Layout from './components/layout/Layout.tsx'
import PageTitle from './components/common/PageTitle.tsx'

const Home = lazy(() => import('./pages/Home.tsx'))
const About = lazy(() => import('./pages/About.tsx'))
const Aszf = lazy(() => import('./pages/Aszf.tsx'))
const Login = lazy(() => import('./pages/Login.tsx'))
const Search = lazy(() => import('./pages/Search.tsx'))
const News = lazy(() => import('./pages/News.tsx'))
const Support = lazy(() => import('./pages/Support.tsx'))
const Payment = lazy(() => import('./pages/Payment.tsx'))
const Reader = lazy(() => import('./pages/Reader.tsx'))
const Watch = lazy(() => import('./pages/Watch.tsx'))
const User = lazy(() => import('./pages/User.tsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'))
const NotFound = lazy(() => import('./pages/NotFound.tsx'))
const Library = lazy(() => import('./pages/Library.tsx'))
const History = lazy(() => import('./pages/History.tsx'))
const Notifications = lazy(() => import('./pages/Notifications.tsx'))
const Challenges = lazy(() => import('./pages/Challenges.tsx'))
const Subscription = lazy(() => import('./pages/Subscription.tsx'))
const Leaderboard = lazy(() => import('./pages/Leaderboard.tsx'))
const Admin = lazy(() => import('./pages/Admin.tsx'))

const RouteFallback = () => (
  <main className="container py-5">
    <div className="about-panel text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Betöltés...</span>
      </div>
    </div>
  </main>
)

function App() {
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const pageContent = document.querySelector<HTMLElement>('.page-content');
      if (pageContent) pageContent.scrollTop = 0;
    };

    const raf = window.requestAnimationFrame(scrollTop);
    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname, location.search, location.hash]);
  
  return (
    <Layout>
      <PageTitle />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rolunk" element={<About />} />
          <Route path="/aszf" element={<Aszf />} />
          <Route path="/belepes" element={<Login />} />
          <Route path="/kereses" element={<Search />} />
          <Route path="/konyvtaram" element={<Library />} />
          <Route path="/elozmenyeim" element={<History />} />
          <Route path="/ertesitesek" element={<Notifications />} />
          <Route path="/kihivasok" element={<Challenges />} />
          <Route path="/vasarlas" element={<Subscription />} />
          <Route path="/hirek" element={<News />} />
          <Route path="/ranglista" element={<Leaderboard />} />
          <Route path="/tamogatas" element={<Support />} />
          <Route path="/fizetes" element={<Payment />} />
          <Route path="/olvaso" element={<Reader />} />
          <Route path="/nezes" element={<Watch />} />
          <Route path="/profil" element={<User />} />
          <Route path="/profil/:userId" element={<User />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/jelszo-visszaallitas" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
