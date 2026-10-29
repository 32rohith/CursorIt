'use client';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from "next/link";

const Spline = React.lazy(() => import('@splinetool/react-spline'));

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'features'|'pricing'|'forum'|'blog'>("features");
  const ctaRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);

  const minScale = 0.85; // box won't shrink below 75%
  const shrinkDistance = 450; // px distance over which box shrinks

  // Parallax-like scroll scaling for hero box
  useEffect(() => {
    if (!heroRef.current || !containerRef.current) return;
    const handleScroll = () => {
      if (!heroRef.current || !containerRef.current || !contentInnerRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / shrinkDistance, 0), 1); // 0 to 1
      const scale = 1 - progress * (1 - minScale);
      containerRef.current.style.transform = `scale(${scale})`;
      contentInnerRef.current.style.transform = `scale(${1 / scale})`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar subtle follow-the-cursor motion
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = navEl.getBoundingClientRect();
      const x = e.clientX - rect.left; // cursor x within element
      const y = e.clientY - rect.top;  // cursor y within element
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxTranslate = 6; // px
      const translateX = ((x - centerX) / centerX) * maxTranslate;
      const translateY = ((y - centerY) / centerY) * maxTranslate;
      navEl.style.transform = `translate(${translateX}px, ${translateY}px)`;
    };

    const handleMouseLeave = () => {
      navEl.style.transform = '';
    };

    navEl.addEventListener('mousemove', handleMouseMove);
    navEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      navEl.removeEventListener('mousemove', handleMouseMove);
      navEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // CTA button follow-the-cursor motion
  useEffect(() => {
    const btn = ctaRef.current;
    if (!btn) return;

    const maxTranslate = 6;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const translateX = ((x - rect.width / 2) / (rect.width / 2)) * maxTranslate;
      const translateY = ((y - rect.height / 2) / (rect.height / 2)) * maxTranslate;
      btn.style.transform = `translate(${translateX}px, ${translateY}px)`;
    };

    const handleMouseLeave = () => {
      btn.style.transform = '';
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">
        <div
          ref={navRef}
          className="flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full shadow-lg transition-colors"
        >
          {/* Features Button */}
          <button
            onClick={()=>setActiveTab('features')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${activeTab==='features' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
          >
            <span>Features</span>
          </button>
          
          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1"></div>
          
          {/* Pricing Button */}
          <button
            onClick={()=>setActiveTab('pricing')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${activeTab==='pricing' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
          >
            <span>Pricing</span>
          </button>
          
          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1"></div>
          
          {/* Forum Button */}
          <button
            onClick={()=>setActiveTab('forum')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${activeTab==='forum' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
          >
            <span>Forum</span>
          </button>
          
          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1"></div>
          
          {/* Blog Button*/}
          <button
            onClick={()=>setActiveTab('blog')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${activeTab==='blog' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
          >
            <span>Blog</span>
          </button>
          
          {/* Menu Button (three dots) */}
          <button className="ml-2 p-2 text-white hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative" style={{ height: `calc(100vh + ${shrinkDistance}px)` }}>
        <div className="sticky top-0 flex h-screen items-center justify-center pointer-events-none">
          <div ref={containerRef} className="w-full mx-2 h-[95%] rounded-3xl overflow-hidden relative transition-transform duration-300 ease-out">
            <div ref={contentInnerRef} className="absolute inset-0">
              {/* 3D model */}
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-black/30 backdrop-blur-sm text-white">Loading 3D Model...</div>}>
                <div className="absolute inset-0 z-0">
                  <Spline scene="/clarity_stream.spline" />
                </div>
              </Suspense>
              {/* Text overlay */}
              <div className="absolute top-[64%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 cursor-text-container text-center space-y-6">
                <h1 className="bitcount-prop-single text-9xl font-bold">
                  Cursor It
                </h1>
                <p className="text-xl text-purple-200">Transform vague project ideas into structured, actionable development plans</p>
                <Link href="/signin">
                  <button ref={ctaRef} className="mx-auto mt-8 px-10 py-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-lg shadow-black/20 hover:bg-white/15 hover:border-white/40 transition-all duration-200">
                    Try now for free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-20">
        {/* Description section */}
        <div className="bg-black py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl mb-8 text-gray-200">
              Cursor It is a proactive AI assistant. Unlike traditional AI chatbots where you need to actively ask questions, 
              Cursor It runs in the background, continuously observing your screen content and listening to your audio to provide 
              relevant assistance in real-time.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <a href="#" className="inline-block bg-purple-600 text-white font-medium px-8 py-4 rounded-full hover:bg-purple-700 transition-all duration-300 text-center">
                Download for Windows
              </a>
              <a href="#" className="inline-block border border-purple-500 text-purple-200 font-medium px-8 py-4 rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 text-center">
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Features section */}
        <section className="bg-black py-20 px-6">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">Discover Cursor It</h2>
            <p className="text-xl mb-12 text-gray-300">A powerful tool designed to enhance your digital experience with beautiful 3D visualizations and intuitive interface.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-4 text-white">Seamless Integration</h3>
                <p className="text-gray-300">Integrate with your favorite tools and platforms without any hassle.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-4 text-white">Stunning Visuals</h3>
                <p className="text-gray-300">Experience breathtaking 3D visuals that bring your content to life.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose section */}
        <section className="bg-black py-20 px-6">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-12 text-center">Why Choose Cursor It?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Precision</h3>
                <p className="text-gray-400">Pixel-perfect accuracy for all your design needs</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Speed</h3>
                <p className="text-gray-400">Lightning-fast performance for seamless experience</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Security</h3>
                <p className="text-gray-400">Enterprise-grade protection for your data</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add extra space to allow scrolling */}
      <div className="h-screen bg-black"></div>
    </>
  );
}