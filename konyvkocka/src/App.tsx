import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/layout/Layout.tsx'
import PageTitle from './components/common/PageTitle.tsx'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import Login from './pages/Login.tsx'
import Search from './pages/Search.tsx'
import News from './pages/News.tsx'
import Support from './pages/Support.tsx'
import Payment from './pages/Payment.tsx'
import Reader from './pages/Reader.tsx'
import Watch from './pages/Watch.tsx'
import User from './pages/User.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import NotFound from './pages/NotFound.tsx'
import Library from './pages/Library.tsx'
import History from './pages/History.tsx'
import Notifications from './pages/Notifications.tsx'
import Challenges from './pages/Challenges.tsx'
import Subscription from './pages/Subscription.tsx'
import Leaderboard from './pages/Leaderboard.tsx'

function App() {
  
  return (
    <Layout>
      <PageTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rolunk" element={<About />} />
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
        <Route path="/jelszo-visszaallitas" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
