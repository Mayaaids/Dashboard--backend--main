import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TalosCounterIntro: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    let currentCount = 0;
    const target = 2000;
    const duration = 3000; // 3 seconds for the animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-in-out cubic for dramatic effect
      const easeProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      currentCount = Math.floor(easeProgress * target);
      setCounter(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCounter(target);
        setIsComplete(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950 to-black opacity-100" />

      {/* Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(239, 0, 0, 0.15) 25%, rgba(239, 0, 0, 0.15) 26%, transparent 27%, transparent 74%, rgba(239, 0, 0, 0.15) 75%, rgba(239, 0, 0, 0.15) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(239, 0, 0, 0.15) 25%, rgba(239, 0, 0, 0.15) 26%, transparent 27%, transparent 74%, rgba(239, 0, 0, 0.15) 75%, rgba(239, 0, 0, 0.15) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0 0', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }}
      />

      {/* Radar Circles HUD */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-96 h-96 border-2 border-red-600 rounded-full opacity-30"
          animate={{
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute w-72 h-72 border border-red-500 rounded-full opacity-20"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute w-48 h-48 border border-red-400 rounded-full opacity-15"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Scanning Line */}
      <motion.div
        className="absolute inset-0 w-full h-1 bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-50"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* Central Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Pulsing Glow Background */}
        <motion.div
          className="absolute -inset-32 bg-red-600 rounded-full blur-3xl opacity-0"
          animate={{
            opacity: isComplete ? [0.3, 0.5, 0.3] : 0.1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Title */}
        <motion.h1
          className="relative text-8xl font-black text-white mb-8 tracking-widest"
          style={{
            textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
            fontFamily: 'Arial Black, sans-serif',
          }}
          animate={{
            textShadow: isComplete
              ? [
                  '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
                  '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.8)',
                  '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
                ]
              : '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
          }}
          transition={{
            duration: isComplete ? 1 : 0,
            repeat: isComplete ? Infinity : 0,
          }}
        >
          TALOS 5.0
        </motion.h1>

        {/* Counter Container */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            type: 'spring',
            stiffness: 100,
          }}
        >
          {/* Counter Number */}
          <motion.div
            className="text-7xl font-black text-red-500 font-mono tracking-tighter"
            style={{
              textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
            }}
            animate={{
              scale: isComplete ? [1, 1.1, 1] : 1,
              textShadow: isComplete
                ? [
                    '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
                    '0 0 40px rgba(34, 197, 94, 1), 0 0 80px rgba(34, 197, 94, 0.6)',
                    '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
                  ]
                : '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
            }}
            transition={{
              duration: isComplete ? 1.5 : 0,
              repeat: isComplete ? Infinity : 0,
            }}
          >
            {String(counter).padStart(4, '0')}+
          </motion.div>

          {/* Subtitle Label */}
          <motion.p
            className="text-red-400 text-lg tracking-widest mt-4 font-mono"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            PARTICIPANTS REGISTERED
          </motion.p>
        </motion.div>

        {/* System Status Text */}
        <motion.div
          className="space-y-2 text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.p
            className="text-sm text-green-500 font-mono tracking-widest"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            ▌ SYSTEM ONLINE
          </motion.p>
          <p className="text-xs text-gray-600 font-mono">INITIALIZING DATABASE...</p>
        </motion.div>

        {/* Action Button */}
        {isComplete && (
          <motion.button
            className="relative px-8 py-4 border-2 border-red-600 text-red-500 font-bold text-lg tracking-wider uppercase hover:bg-red-600 hover:text-white transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
            }}
            whileHover={{
              boxShadow: '0 0 40px rgba(239, 68, 68, 1)',
              scale: 1.05,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
            onClick={() => {
              // Navigate to login or dashboard
              window.location.href = '/login';
            }}
          >
            ENTER SYSTEM
          </motion.button>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-gray-500 text-sm font-mono tracking-wide">
          Dept of Artificial Intelligence and Data Science
        </p>
        <p className="text-gray-600 text-xs font-mono tracking-wide mt-1">
          Chennai Institute of Technology
        </p>
      </motion.div>

      {/* Corner Data Streams */}
      <motion.div
        className="absolute top-8 left-8 text-green-500 text-xs font-mono opacity-50"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <div>SYS: 0x7F4A8C</div>
        <div>RAM: 32GB</div>
        <div>CPU: 94%</div>
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 text-red-500 text-xs font-mono opacity-50"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0.5,
        }}
      >
        <div>Network: SECURED</div>
        <div>Encryption: AES-256</div>
        <div>Status: ARMED</div>
      </motion.div>
    </div>
  );
};

export default TalosCounterIntro;
