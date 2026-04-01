'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    setLoading(true);   
    setFadeOut(false);  

    const minTime = 600; 
    const timer = setTimeout(() => {
      setFadeOut(true); 
      
      const fadeTimer = setTimeout(() => setLoading(false), 300); 
      return () => clearTimeout(fadeTimer);
    }, minTime);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Sparkles className="w-12 h-12 text-white animate-spin" />
    </div>
  );
}