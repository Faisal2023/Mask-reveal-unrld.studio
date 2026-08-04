import { useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';

const GlitchRevealText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%BHSD^&*()_+0123456789";
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText(
        text.split("").map((letter, index) => {
          if (index < iteration) {
            return letter;
          }
          if (letter === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 2;
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="relative inline-block">
      <motion.h1 
        className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase relative z-10"
        initial={{ filter: "blur(10px)", opacity: 0, scale: 1.05 }}
        animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {displayText}
      </motion.h1>
      
      {/* Scanline effect on mount */}
      <motion.div
        className="absolute left-0 right-0 h-[3px] bg-white/80 z-20 mix-blend-overlay"
        initial={{ top: "0%", opacity: 0 }}
        animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1, ease: "linear", delay: 0.2 }}
      />
      
      {/* Chromatic aberration glitch effect */}
      <motion.h1 
        className="text-5xl md:text-8xl font-black tracking-tighter text-red-500 uppercase absolute top-0 left-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          clipPath: [
            "inset(20% 0 80% 0)",
            "inset(60% 0 10% 0)",
            "inset(10% 0 50% 0)",
            "inset(0% 0 100% 0)",
          ],
          x: [-4, 4, -2, 0],
          opacity: [0, 1, 0.8, 0]
        }}
        transition={{ duration: 0.6, delay: 0.2, times: [0, 0.3, 0.6, 1] }}
        aria-hidden="true"
      >
        {displayText}
      </motion.h1>

      <motion.h1 
        className="text-5xl md:text-8xl font-black tracking-tighter text-blue-500 uppercase absolute top-0 left-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          clipPath: [
            "inset(80% 0 20% 0)",
            "inset(10% 0 60% 0)",
            "inset(50% 0 10% 0)",
            "inset(0% 0 100% 0)",
          ],
          x: [4, -4, 2, 0],
          opacity: [0, 1, 0.8, 0]
        }}
        transition={{ duration: 0.6, delay: 0.2, times: [0, 0.3, 0.6, 1] }}
        aria-hidden="true"
      >
        {displayText}
      </motion.h1>
    </div>
  );
};

const Particles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 30 + 30,
      delay: Math.random() * -30, // Negative delay so they start immediately at different points
      xDrift: (Math.random() - 0.5) * 50,
      yDrift: (Math.random() - 0.5) * 50,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/30 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            x: [0, p.xDrift, 0],
            y: [0, p.yDrift, 0],
            opacity: [0.1, 0.6, 0.1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement for the mask
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  // Spring for the mask size for smooth expansion/collapse
  const maskSize = useSpring(0, { damping: 30, stiffness: 200 });
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    maskSize.set(350); // Expand mask on hover
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    maskSize.set(0); // Shrink mask on leave
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsHovered(true);
    maskSize.set(350);
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouseX.set(e.touches[0].clientX - rect.left);
      mouseY.set(e.touches[0].clientY - rect.top);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouseX.set(e.touches[0].clientX - rect.left);
      mouseY.set(e.touches[0].clientY - rect.top);
    }
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    maskSize.set(0);
  };

  // Generate the dynamic radial gradient mask
  const maskImage = useMotionTemplate`radial-gradient(circle ${maskSize}px at ${smoothX}px ${smoothY}px, black 80%, transparent 100%)`;

  // IMPORTANT: 
  // Replace these placeholders with the images you uploaded.
  // 1st picture -> Reveal Image
  // 2nd picture -> Background Image
  const backgroundImage = "https://demo0.whdcdrehsan.com/wp-content/uploads/2026/08/2-1.png";
  const revealImage = "https://demo0.whdcdrehsan.com/wp-content/uploads/2026/08/ChatGPT-Image-Aug-4-2026-01_01_13-PM.png";

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-zinc-950 cursor-crosshair flex items-center justify-center touch-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* 2nd Picture: Main Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Main Background" 
          className="w-full h-full object-cover opacity-60 grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Particles />

      {/* 1st Picture: Hover Reveal Foreground */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}
      >
        <img 
          src={revealImage} 
          alt="Revealed on Hover" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content overlay for extra polish */}
      <div className="relative z-20 pointer-events-none text-center mix-blend-difference">
        <GlitchRevealText text="Unrld Studio" />
         
        <p className="mt-4 text-lg md:text-xl text-white/80 max-w-lg mx-auto font-medium">
        
        </p>
      </div>
    </div>
  );
}
