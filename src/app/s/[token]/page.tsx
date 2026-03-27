"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import IQRing from "@/components/IQRing";
import Leaderboard, { LeaderboardEntry } from "@/components/Leaderboard";
import CTAButton from "@/components/CTAButton";
import InstallModal from "@/components/InstallModal";

interface ShareData {
  name: string;
  token: string;
  iq_score: number;
  title: string;
  badge: string;
  percentile: number;
  scores: Record<string, number>;
  rank: number;
  total_participants: number;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/result?token=${token}`).then((r) => r.ok ? r.json() : null),
      fetch("/api/leaderboard").then((r) => r.json()),
    ]).then(([result, lb]) => {
      if (result) setData(result);
      else setError("未找到该龙虾的测试结果");
      if (lb?.entries) setEntries(lb.entries);
    }).catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleStartTest = useCallback(() => {
    setShowModal(true);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="px-[20px] pt-[60px] pb-3xl text-center pt-3xl">
          <div className="text-[48px] animate-bounce">🦞</div>
          <p className="text-body text-text-secondary mt-md">加载中...</p>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="px-[20px] pt-[60px] pb-3xl text-center pt-3xl">
          <p className="text-h2 text-text-primary mb-md">{error || "未找到结果"}</p>
          <CTAButton onClick={() => (window.location.href = "/")}>去首页测试</CTAButton>
        </main>
      </>
    );
  }

  // Score bar chart for abilities overview
  const scoreEntries = Object.entries(data.scores).filter(([k]) => k !== "q12").sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <Navbar />
      <main className="px-[20px] pt-[60px] pb-[120px]">
        {/* Score Card */}
        <section className="text-center pt-xl pb-lg">
          <p className="text-body text-text-secondary mb-sm">{data.name} 的成绩</p>
          <IQRing score={data.iq_score} />
          <p className="text-h2 font-semibold text-text-primary mt-md">{data.title}</p>
          <p className="text-caption text-text-secondary mt-xs">
            超过 {data.percentile}% 的小龙虾 &middot; 排名 #{data.rank}/{data.total_participants}
          </p>
        </section>

        {/* Ability Overview Bar Chart */}
        <section className="mb-xl">
          <h2 className="text-h2 font-semibold text-text-primary mb-md">能力一览</h2>
          <div className="rounded-lg p-md" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="space-y-sm">
              {scoreEntries.map(([qid, score]) => (
                <div key={qid} className="flex items-center gap-sm">
                  <span className="text-mini text-text-muted w-[32px]">{qid.toUpperCase()}</span>
                  <div className="flex-1 h-[8px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((score as number) / 10) * 100}%`,
                        background: (score as number) >= 10
                          ? "var(--success)"
                          : (score as number) > 0
                          ? "linear-gradient(90deg, var(--accent-start), var(--accent-end))"
                          : "var(--error)",
                        minWidth: (score as number) > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-mini tabular-nums text-text-secondary w-[28px] text-right">
                    {score as number}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-md">龙虾排位榜</h2>
          <div className="bg-surface rounded-lg overflow-hidden">
            <Leaderboard entries={entries} highlightToken={token} />
          </div>
        </section>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-app mx-auto px-[20px] pb-[20px] pt-sm" style={{
          background: "linear-gradient(to top, var(--bg-primary) 60%, transparent)"
        }}>
          <CTAButton onClick={handleStartTest}>测测你的小龙虾有多聪明</CTAButton>
        </div>
      </div>

      <InstallModal
        open={showModal}
        onClose={() => setShowModal(false)}
        defaultName=""
        refToken={token}
      />
    </>
  );
}
