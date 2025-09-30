import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutPage from './pages/AboutPage';
import OurTeamPage from './pages/OurTeamPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import AdminSetupPage from './pages/AdminSetupPage';
import ResourcesPage from './pages/ResourcesPage';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/our-team" element={<OurTeamPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin-setup" element={<AdminSetupPage />} />
      </Routes>
    </div>
  );
}

export default App;