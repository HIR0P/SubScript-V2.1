import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, ClipboardList } from 'lucide-react';

interface LandingPageProps {
  onEnterPrototype: () => void;
}

export default function LandingPage({ onEnterPrototype }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6">
      
      {/* Decorative blurred background shapes matching the screenshot */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-[#dbeafe] opacity-80 blur-[80px] sm:blur-[120px] pointer-events-none translate-x-[15%] -translate-y-[15%]" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#e0f2fe] opacity-80 blur-[80px] sm:blur-[100px] pointer-events-none -translate-x-[15%] translate-y-[15%]" />
      
      {/* Main hero content container */}
      <div className="max-w-3xl w-full text-center space-y-6 sm:space-y-8 relative z-10 py-12">
        
        {/* Badge: MVP Release v1.0 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-full shadow-sm">
            <span>🚀</span>
            <span>MVP Release v1.0</span>
          </div>
        </motion.div>
        
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] px-2"
        >
          Stop Buang Uang untuk Langganan yang Lupa Dibatalkan
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-4"
        >
          SubScrip membantu mahasiswa melacak, mengelola, dan mengingatkan tagihan langganan. Simpan uang jajan Anda untuk hal yang lebih penting.
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4"
        >
          <button
            onClick={onEnterPrototype}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563eb] text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] shadow-lg shadow-blue-500/15 transition-all duration-200 cursor-pointer"
          >
            <Smartphone className="w-5 h-5" />
            <span>Coba Prototype</span>
          </button>
          
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe9ihlREG6HKA0Qm5X4zI9P1sQB7juyooaa-hOb5JqnOYhw5Q/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] shadow-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          >
            <ClipboardList className="w-5 h-5" />
            <span>Isi Form Validasi</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
