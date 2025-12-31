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
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/news" element={<News />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/support" element={<Support />} />
        <Route path="/pay" element={<Payment />} />
        <Route path="/reader" element={<Reader />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/user" element={<User />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
