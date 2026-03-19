"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import ScrollProgress from './ScrollProgress';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
            <CustomCursor />
            <ScrollProgress />

            {/* Noise texture overlay to break up banding - Increased opacity */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    mixBlendMode: 'overlay'
                }}>
            </div>

            {/* Animated Background Orbs - Massive size & blur for smoothness */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-purple-600/20 blur-[300px] animate-pulse-slow mix-blend-screen"></div>
                <div className="absolute top-[10%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 blur-[300px] animate-float mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[90vw] h-[90vw] rounded-full bg-indigo-600/20 blur-[300px] animate-pulse-slower mix-blend-screen"></div>

                {/* Additional orbs */}
                <div className="absolute top-[40%] left-[40%] w-[60vw] h-[60vw] rounded-full bg-pink-600/15 blur-[300px] animate-float-slow mix-blend-screen"></div>
                <div className="absolute bottom-[0%] right-[0%] w-[70vw] h-[70vw] rounded-full bg-cyan-600/15 blur-[300px] animate-pulse-slower mix-blend-screen"></div>
            </div>

            <Navbar />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
