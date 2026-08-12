import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#112a57] h-16 flex items-center text-white shadow-md">
      <div 
        style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0 40px' }} 
        className="flex items-center justify-between"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" title="Reload page">
          <img src="/sssia-logo.png" alt="SSSIA Logo" className="h-14 w-14 object-contain rounded-xl bg-white p-1" />
        </a>
        
        {/* Institute Name */}
        <div className="text-sm md:text-base font-semibold tracking-wide text-white/90">
          Sri Sathya Sai Institute of Actuaries
        </div>
      </div>
    </nav>
  );
}
