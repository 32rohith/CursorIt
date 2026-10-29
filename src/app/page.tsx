'use client';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('./LandingPage'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

export default function Home() {
  return <LandingPage />;
}
