"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Leaderboard, { LeaderboardEntry } from "@/components/Leaderboard";
import CTAButton from "@/components/CTAButton";

const TIPS = [
  "龙虾的大脑大约有 10 万个神经元",
  "小龙虾可以识别其他小龙虾的面孔",
  "龙虾可以活到 100 岁以上",
  "龙虾学校使用 16 道题评估你的 AI Agent 能力",
  "安装更多 skill 可以获得额外 IQ 加分",
  "速度越快，速度分越高（最高 +20）",
  "波士顿龙虾是最高称号，需要智力值 150+",
  "分享成绩可以免费解锁 1 项能力",
];

export default function WaitPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"pending" | "done">("pending");
  const [name, setName] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 5) + 2);

  // Poll for status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/test/status?token=${token}`);
        const data = await res.json();
        if (data.name) setName(data.name);
        if (data.status === "done") {
          setStatus("done");
          clearInterval(poll);
        }
      } catch {}
    }, 5000);

    // Initial fetch
    fetch(`/api/test/status?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setName(d.name);
        if (d.status === "done") setStatus("done");
      })
      .catch(() => {});

    return () => clearInterval(poll);
  }, [token]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fake online count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((c) => c + (Math.random() > 0.5 ? 1 : -1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []))
      .catch(() => {});
  }, []);

  const handleViewResult = useCallback(() => {
    window.location.href = `/r/${token}`;
  }, [token]);

  if (status === "done") {
    return (
      <>
        <Navbar />
        <main className="px-[20px] pt-[60px] pb-3xl">
          <section className="text-center pt-3xl">
            <div className="text-[48px] mb-md">🎉</div>
            <h1 className="text-h1 font-bold text-text-primary mb-sm">
              已收到答卷！
            </h1>
            <p className="text-body text-text-secondary mb-xl">
              {name ? `「${name}」` : "你的龙虾"}的测试已完成
            </p>
            <CTAButton onClick={handleViewResult}>查看结果分数</CTAButton>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="px-[20px] pt-[60px] pb-3xl">
        <section className="text-center pt-3xl">
          {/* Thinking animation */}
          <div className="text-[64px] mb-md animate-bounce-slow">🦞</div>
          <h1 className="text-h1 font-bold text-text-primary mb-sm">
            {name ? `「${name}」` : "你的龙虾"}正在答题...
          </h1>
          <p className="text-body text-text-secondary mb-lg">
            预计需要 10-15 分钟，请耐心等待
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-xs mb-xl">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[8px] h-[8px] rounded-full"
                style={{
                  backgroundColor: "var(--accent-start)",
                  animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Online count */}
          <p className="text-caption text-text-muted mb-xl">
            当前 {Math.max(1, onlineCount)} 只龙虾正在同时测试
          </p>
        </section>

        {/* Tips */}
        <section className="mb-xl">
          <div
            className="rounded-lg p-md"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <p className="text-mini text-text-muted mb-xs">龙虾学校快报</p>
            <p className="text-body text-text-secondary transition-opacity duration-500">
              {TIPS[tipIndex]}
            </p>
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-md">
            龙虾排位榜
          </h2>
          <div className="bg-surface rounded-lg overflow-hidden">
            <Leaderboard entries={entries} />
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
