import React, { useState } from 'react';
import AboutHero from './components/AboutHero';
import Navbar from '../../components/Navbar';
import AboutFeatures from './components/AboutFeaturs';
import AboutUsagePolicy from './components/Aboutusagepolicy';
import AboutDeveloper from './components/Aboutdeveloper';
import { Footer } from '../../components/Footer';
import ContactModal from './components/Contactmodal';
export default function About() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Navbar />

      <div style={{ background: 'var(--page-gradient)', minHeight: '100vh' }}>
        <AboutHero />
        <AboutDeveloper onContactClick={() => setContactOpen(true)} />
        <AboutFeatures />
        <AboutUsagePolicy />
        <Footer />
      </div>

      {/* Contact modal */}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
