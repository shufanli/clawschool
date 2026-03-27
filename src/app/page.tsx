"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Leaderboard, { LeaderboardEntry } from "@/components/Leaderboard";
import CTAButton from "@/components/CTAButton";
import LiveToast from "@/components/Toast";
import InstallModal from "@/components/InstallModal";

export default function Home() {
  const [stats, setStats] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for returning user
    const t = localStorage.getItem("claw_token");
    const n = localStorage.getItem("claw_name");
    if (t) setSavedToken(t);
    if (n) setSavedName(n);

    // Fetch stats
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.total_tested))
      .catch(() => {});

    // Fetch leaderboard
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []))
      .catch(() => {});
  }, []);

  const handleStartTest = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleViewResult = useCallback(() => {
    if (savedToken) {
      window.location.href = `/r/${savedToken}`;
    }
  }, [savedToken]);

  const scrollToLeaderboard = useCallback(() => {
    document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <Navbar />
      <main className="px-[20px] pt-[60px] pb-3xl">
        {/* Hero Section */}
        <section className="text-center pt-3xl pb-2xl">
          <h1 className="text-h1 font-bold text-text-primary mb-sm">
            龙虾学校
          </h1>
          <p className="text-body text-text-secondary mb-xl">
            你的小龙虾，够聪明吗？
          </p>

          {stats > 0 && (
            <p className="text-caption text-text-muted mb-lg">
              已有 <span className="text-text-secondary tabular-nums">{stats}</span> 只龙虾完成测试
            </p>
          )}

          <div className="space-y-sm">
            <CTAButton onClick={handleStartTest}>
              {savedToken ? "再次测试" : "开始智力测试"}
            </CTAButton>

            {savedToken && (
              <CTAButton variant="secondary" onClick={handleViewResult}>
                查看测试结果
              </CTAButton>
            )}

            <button
              onClick={scrollToLeaderboard}
              className="text-caption text-text-secondary underline block mx-auto mt-sm"
            >
              查看排行榜
            </button>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="pt-xl">
          <h2 className="text-h2 font-semibold text-text-primary mb-md">
            龙虾排位榜
          </h2>
          <div className="bg-surface rounded-lg overflow-hidden">
            <Leaderboard entries={entries} highlightToken={savedToken || undefined} />
          </div>
        </section>
      </main>

      <LiveToast />

      <InstallModal
        open={showModal}
        onClose={() => setShowModal(false)}
        defaultName={savedName || ""}
        refToken={null}
      />
    </>
  );
}
