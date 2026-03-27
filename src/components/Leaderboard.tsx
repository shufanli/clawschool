"use client";
import { useEffect, useRef } from "react";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  iq_score: number;
  title: string;
  token: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightToken?: string;
}

export default function Leaderboard({ entries, highlightToken }: LeaderboardProps) {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightToken]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-xl text-text-secondary text-body">
        还没有龙虾参加测试，快来成为第一个！
      </div>
    );
  }

  return (
    <div className="space-y-0 max-h-[500px] overflow-y-auto">
      {entries.map((entry) => {
        const isHighlighted = entry.token === highlightToken;
        return (
          <div
            key={`${entry.token}-${entry.rank}`}
            ref={isHighlighted ? highlightRef : undefined}
            className="flex items-center h-[56px] px-md border-b border-border"
            style={
              isHighlighted
                ? {
                    background: "linear-gradient(135deg, rgba(255,45,85,0.15), rgba(255,107,61,0.15))",
                    borderColor: "rgba(255,45,85,0.3)",
                  }
                : {}
            }
          >
            <span className="w-[40px] text-body font-semibold tabular-nums text-text-secondary">
              #{entry.rank}
            </span>
            <span className="flex-1 text-body font-medium truncate text-text-primary">
              {entry.name}
            </span>
            <span className="text-caption text-text-secondary mr-sm">{entry.title}</span>
            <span className="text-body font-semibold tabular-nums text-text-primary">
              {entry.iq_score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
