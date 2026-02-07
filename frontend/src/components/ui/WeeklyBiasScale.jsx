import React from 'react';
import { Timer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';

export const WeeklyBiasScale = ({ data, mini = false, showWrapper = true }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className={cn(
            "relative w-full",
            mini ? "py-2" : (showWrapper ? "bg-white/[0.02] border border-white/10 rounded-[40px] p-8" : "")
        )}>
            {!mini && showWrapper && (
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-[#00D9A5]" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Rolling 4-Week Bias Distribution</h4>
                    </div>
                    <Badge className="bg-[#00D9A5]/10 text-[#00D9A5] border-[#00D9A5]/20 font-black tracking-widest uppercase text-[10px]">
                        Last Update: {data[data.length - 1]?.label}
                    </Badge>
                </div>
            )}

            <div className={cn(
                "flex items-end justify-between relative gap-2",
                mini ? "h-[60px] px-1" : "h-[250px] px-4"
            )}>
                {data.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 flex-1 relative group">
                        <div className={cn(
                            "relative w-full flex flex-col items-center",
                            mini ? "px-0" : "px-4"
                        )}>
                            {/* Percentage Label */}
                            <div className={cn(
                                "absolute transition-all duration-500",
                                mini ? "-top-5" : "-top-12",
                                !item.isCurrent ? "scale-100 opacity-90" : "opacity-40"
                            )}>
                                <span className={cn(
                                    "font-black tracking-tight",
                                    mini ? "text-[9px]" : "text-2xl",
                                    !item.isCurrent ? "text-[#00D9A5] drop-shadow-[0_0_10px_rgba(0,217,165,0.4)]" : "text-white/40"
                                )}>
                                    {item.value}%
                                </span>
                            </div>

                            {/* Bar Container */}
                            <div className={cn(
                                "relative w-full",
                                mini ? "max-w-[12px]" : "max-w-[80px]"
                            )}>
                                {/* Glowing Top Cap - for past weeks (typically first 3) */}
                                {!item.isCurrent && (
                                    <div
                                        className={cn(
                                            "absolute top-0 left-0 right-0 h-[3px] z-10 bg-[#00D9A5]",
                                            mini ? "shadow-[0_0_8px_#00D9A5]" : "shadow-[0_0_30px_#00D9A5]"
                                        )}
                                        style={{ bottom: `${item.value}%` }}
                                    />
                                )}

                                {/* Bar Body */}
                                <div
                                    className={cn(
                                        "w-full transition-all duration-1000 ease-out relative overflow-hidden",
                                        mini ? "rounded-t-md" : "rounded-t-2xl",
                                        !item.isCurrent
                                            ? "bg-gradient-to-t from-[#00D9A5]/5 to-[#00D9A5]/50 border-x border-t border-[#00D9A5]/30"
                                            : "bg-[#0A0E14] border-x border-t border-white/10"
                                    )}
                                    style={{ height: `${item.value * (mini ? 0.5 : 2.2)}px` }}
                                >
                                    {item.isCurrent && (
                                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #00D9A5 5px, #00D9A5 10px)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {!mini && (
                            <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.3em]",
                                    !item.isCurrent ? "text-[#00D9A5]" : "text-white/40"
                                )}>
                                    {item.label}
                                </span>
                                {item.isPrevious && (
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
                                        Past
                                    </span>
                                )}
                                {item.isCurrent && (
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded bg-white/[0.02]">
                                        Current
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
