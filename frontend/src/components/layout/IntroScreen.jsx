import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('entering');

    useEffect(() => {
        const sequence = async () => {
            // 1. Enter center
            setPhase('entering');
            await new Promise(r => setTimeout(r, 1500));

            // 2. Ready to write 1 (Bull moves to Left)
            setPhase('ready_1');
            await new Promise(r => setTimeout(r, 800));

            // 3. Write Text 1 (Bull moves L -> R)
            setPhase('write_1');
            await new Promise(r => setTimeout(r, 1600));
            await new Promise(r => setTimeout(r, 1600)); // Time to read

            // 4. Erase Text 1 (Bull moves R -> L)
            setPhase('erase_1');
            await new Promise(r => setTimeout(r, 1400));

            // 5. Ready to write 2 (Bull jumps to Right to write R -> L)
            setPhase('ready_2');
            await new Promise(r => setTimeout(r, 600));

            // 6. Write Text 2 "trascinandosi sulla sinistra" (Bull moves R -> L)
            setPhase('write_2');
            await new Promise(r => setTimeout(r, 1600));
            await new Promise(r => setTimeout(r, 1600)); // Time to read

            // 7. Write Karion / Final Logo "senso opposto" (Bull moves L -> R & fades out, full logo fades in)
            setPhase('write_karion');
            await new Promise(r => setTimeout(r, 2500));

            // 8. Final Hold
            setPhase('final');
            await new Promise(r => setTimeout(r, 3000));

            onComplete();
        };

        sequence();
    }, [onComplete]);

    // Framer Motion variants for the Bull
    const bullVariants = {
        entering: { x: "0%", scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 1.5, ease: "easeOut" } },
        ready_1: { x: "-40vw", scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeInOut" } },
        write_1: { x: "40vw", scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 1.6, ease: "easeInOut" } },
        erase_1: { x: "-40vw", scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 1.4, ease: "easeInOut" } },
        ready_2: { x: "40vw", scale: 0.8, opacity: 0, filter: "blur(5px)", transition: { duration: 0.5 } }, // teleport right, hidden
        write_2: { x: "-40vw", scale: 0.8, opacity: 1, filter: "blur(0px)", transition: { duration: 1.6, ease: "easeInOut" } }, // drag left
        write_karion: { x: "10vw", scale: 0.9, opacity: 0, filter: "blur(10px)", transition: { duration: 2, ease: "easeInOut" } }, // fade moving opposite
        final: { opacity: 0 }
    };

    // Text 1 Variants (Reveals Left to Right)
    const text1Variants = {
        entering: { clipPath: "inset(0 100% 0 0)" },
        ready_1: { clipPath: "inset(0 100% 0 0)" },
        write_1: { clipPath: "inset(0 0% 0 0)", transition: { duration: 1.6, ease: "easeInOut" } },
        erase_1: { clipPath: "inset(0 100% 0 0)", transition: { duration: 1.4, ease: "easeInOut" } },
        ready_2: { clipPath: "inset(0 100% 0 0)" },
        write_2: { clipPath: "inset(0 100% 0 0)" },
        write_karion: { clipPath: "inset(0 100% 0 0)" },
        final: { clipPath: "inset(0 100% 0 0)" }
    };

    // Text 2 Variants (Reveals Right to Left)
    const text2Variants = {
        entering: { clipPath: "inset(0 0 0 100%)" },
        ready_1: { clipPath: "inset(0 0 0 100%)" },
        write_1: { clipPath: "inset(0 0 0 100%)" },
        erase_1: { clipPath: "inset(0 0 0 100%)" },
        ready_2: { clipPath: "inset(0 0 0 100%)" }, // reset
        write_2: { clipPath: "inset(0 0 0 0%)", transition: { duration: 1.6, ease: "easeInOut" } }, // wipe in from right
        write_karion: { clipPath: "inset(0 0 0 100%)", transition: { duration: 1.2, ease: "easeInOut" } }, // wipe out to right
        final: { clipPath: "inset(0 0 0 100%)" }
    };

    // Final Logo Variants (Fades in)
    const finalLogoVariants = {
        entering: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        ready_1: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        write_1: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        erase_1: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        ready_2: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        write_2: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        write_karion: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 2, ease: "easeOut", delay: 0.5 } },
        final: { opacity: 1, scale: 1, filter: "blur(0px)" }
    };

    const textStyle = {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        whiteSpace: 'nowrap'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden pointer-events-none">

            {/* Container for animations */}
            <div className="relative w-full h-[300px] flex items-center justify-center">

                {/* TEXT 1 (Left to Right) */}
                <motion.div
                    variants={text1Variants}
                    initial="entering"
                    animate={phase}
                    className="absolute inset-0 flex items-center justify-center text-white text-2xl md:text-5xl lg:text-6xl tracking-[0.2em] md:tracking-[0.3em] font-medium md:font-semibold"
                    style={textStyle}
                >
                    EVERY MARKET TELLS A STORY
                </motion.div>

                {/* TEXT 2 (Right to Left) */}
                <motion.div
                    variants={text2Variants}
                    initial="entering"
                    animate={phase}
                    className="absolute inset-0 flex items-center justify-center text-white text-2xl md:text-5xl lg:text-6xl tracking-[0.2em] md:tracking-[0.3em] font-medium md:font-semibold"
                    style={textStyle}
                >
                    MOST NEVER HEAR IT
                </motion.div>

                {/* THE BULL PEN */}
                <motion.img
                    src="/karion-bull.png"
                    alt="Karion Bull"
                    variants={bullVariants}
                    initial={{ x: "0%", scale: 0, opacity: 0, filter: "blur(10px)" }}
                    animate={phase}
                    className="absolute z-10 w-[80px] md:w-[150px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                />

                {/* FINAL FULL LOGO (Bull + Text) */}
                <motion.img
                    src="/karion-full-logo.png"
                    alt="Karion Final Logo"
                    variants={finalLogoVariants}
                    initial="entering"
                    animate={phase}
                    className="absolute z-20 w-[280px] md:w-[450px] object-contain"
                />

            </div>
        </div>
    );
};
