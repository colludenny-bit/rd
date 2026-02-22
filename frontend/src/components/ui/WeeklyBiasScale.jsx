import React from 'react';
import { Timer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';

export const WeeklyBiasScale = ({ data, mini = false, showWrapper = true }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className={cn(
            "relative w-full",
            mini ? "py-4" : (showWrapper ? "bg-white/[0.02] border border-white/10 rounded-[40px] p-8" : "")
        )}>
            {!mini && showWrapper && (
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-[#00D9A5]" />
                        <h4 className="text-base font-medium text-white uppercase tracking-widest font-apple">Rolling 4-Week Bias Distribution</h4>
                    </div>
                    <Badge className="bg-[#00D9A5]/10 text-[#00D9A5] border-[#00D9A5]/20 font-medium tracking-widest uppercase text-[10px] font-apple">
                        Last Update: {data[data.length - 1]?.label}
                    </Badge>
                </div>
            )}

            <div className={cn(
                "flex items-end justify-between relative gap-2",
                mini ? "h-[100px] px-2" : "h-[250px] px-4"
            )}>
                {data.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 flex-1 relative group">
                        <div className={cn(
                            "relative w-full flex flex-col items-center",
                            mini ? "px-0" : "px-4"
                        )}>
                            {/* Percentage Label */}
                            <div className={cn(
                                "absolute transition-all duration-500",
                                mini ? "-top-8" : "-top-10",
                                // removed scaling/opacity shift for alignment
                                "opacity-100"
                            )}>
                                <span className={cn(
                                    "font-medium tracking-tight font-apple",
                                    mini ? "text-lg" : "text-2xl",
                                    !item.isCurrent ? "text-[#00D9A5] drop-shadow-[0_0_15px_rgba(0,217,165,0.7)]" : "text-white"
                                )}>
                                    {item.value}%
                                </span>
                            </div>

                            {/* Bar Container */}
                            <div className={cn(
                                "relative w-full",
                                mini ? "max-w-[42px]" : "max-w-[80px]"
                            )}>
                                {/* Glowing Top Cap - for past weeks */}
                                {!item.isCurrent && (
                                    <div
                                        className={cn(
                                            "absolute left-[-1px] right-[-1px] h-[3px] z-10 bg-[#70FFDF] shadow-[0_0_10px_#00D9A5]",
                                        )}
                                        style={{ bottom: `${item.value * (mini ? 0.7 : 2.2)}px` }}
                                    />
                                )}

                                {/* Bar Body */}
                                <div
                                    className={cn(
                                        "w-full transition-all duration-1000 ease-out relative overflow-hidden",
                                        mini ? "rounded-t-xl" : "rounded-t-2xl",
                                        !item.isCurrent
                                            ? "bg-[#1A4D40] border-x border-t border-[#00D9A5]/40"
                                            : "bg-white/[0.05] border-x border-t border-white/10"
                                    )}
                                    style={{ height: `${item.value * (mini ? 0.7 : 2.2)}px` }}
                                >
                                    {item.isCurrent && (
                                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #ffffff 5px, #ffffff 10px)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Labels & Badges */}
                        <div className="flex flex-col items-center gap-2">
                            <span className={cn(
                                "font-medium uppercase tracking-[0.2em] font-apple",
                                mini ? "text-[10px]" : "text-sm",
                                !item.isCurrent ? "text-[#00D9A5]" : "text-white"
                            )}>
                                {item.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
