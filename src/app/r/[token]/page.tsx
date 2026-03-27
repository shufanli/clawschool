"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import IQRing from "@/components/IQRing";
import CTAButton from "@/components/CTAButton";
import BottomSheet from "@/components/BottomSheet";
import { QUESTIONS } from "@/lib/questions";

interface ResultData {
  name: string;
  token: string;
  iq_score: number;
  title: string;
  badge: string;
  percentile: number;
  scores: Record<string, number>;
  speed_bonus: number;
  skill_bonus: number;
  duration_seconds: number;
  model: string;
  rank: number;
  total_participants: number;
  unlocked_qids: string[];
  history: { iq_score: number; created_at: string }[];
}

interface UpgradeState {
  step: 1 | 1.5 | 2 | 3 | 4;
  qid: string;
  qName: string;
  previewText: string;
  currentScore: number;
  maxScore: number;
}

function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  document.body.removeChild(textarea);
  return Promise.resolve(ok);
}

export default function ReportPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState<UpgradeState | null>(null);
  const [upgradeCommand, setUpgradeCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{ old_iq: number; new_iq: number } | null>(null);

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/result?token=${token}`);
      if (!res.ok) { setError("未找到测试结果"); return; }
      const d = await res.json();
      setData(d);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchResult(); }, [fetchResult]);

  const canUpgradeCount = data
    ? QUESTIONS.filter((q) => q.upgradeable && (data.scores[q.id] ?? 0) < q.maxScore && !data.unlocked_qids.includes(q.id)).length
    : 0;
  const fullScoreCount = data
    ? QUESTIONS.filter((q) => q.maxScore > 0 && (data.scores[q.id] ?? 0) >= q.maxScore).length
    : 0;

  const handleShare = useCallback(async () => {
    if (!data) return;
    const shareUrl = `${window.location.origin}/s/${token}`;
    const text = `我的小龙虾「${data.name}」在龙虾学校智力测试中获得智力值 ${data.iq_score}，荣获「${data.title}」称号，超过 ${data.percentile}% 的小龙虾！你的小龙虾够聪明吗？👉 ${shareUrl}`;
    await copyToClipboard(text);
    alert("分享文案已复制到剪贴板！");
  }, [data, token]);

  const handleUpgradeClick = useCallback((qid: string) => {
    const q = QUESTIONS.find((x) => x.id === qid);
    if (!q || !data) return;
    setUpgrade({
      step: 1,
      qid,
      qName: q.name,
      previewText: q.previewText,
      currentScore: data.scores[qid] ?? 0,
      maxScore: q.maxScore,
    });
    setCopied(false);
    setUpgradeCommand("");
    setUpgradeResult(null);
  }, [data]);

  const handlePay = useCallback(async () => {
    if (!upgrade || !data) return;
    // MVP: skip real payment, go to step 2
    setUpgrade({ ...upgrade, step: 1.5 });
  }, [upgrade, data]);

  const handlePayConfirm = useCallback(async () => {
    if (!upgrade || !data) return;
    try {
      const res = await fetch("/api/upgrade/basic/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, selected_qids: [upgrade.qid] }),
      });
      const d = await res.json();
      setUpgradeCommand(d.command_text);
      setUpgrade({ ...upgrade, step: 2 });
    } catch {}
  }, [upgrade, data, token]);

  const handleCopyUpgrade = useCallback(async () => {
    await copyToClipboard(upgradeCommand);
    setCopied(true);
  }, [upgradeCommand]);

  const handleUpgradeSent = useCallback(() => {
    if (!upgrade) return;
    setUpgrade({ ...upgrade, step: 3 });
    // Poll for upgrade completion
    const oldIq = data?.iq_score || 0;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/result?token=${token}`);
        const d = await res.json();
        if (d.iq_score !== oldIq || d.unlocked_qids.includes(upgrade.qid)) {
          clearInterval(pollInterval);
          setUpgradeResult({ old_iq: oldIq, new_iq: d.iq_score });
          setData(d);
          setUpgrade({ ...upgrade, step: 4 });
        }
      } catch {}
    }, 5000);
    // Timeout after 10 min
    setTimeout(() => clearInterval(pollInterval), 600000);
  }, [upgrade, data, token]);

  const handleUpgradeClose = useCallback(() => {
    setUpgrade(null);
    setCopied(false);
    setUpgradeCommand("");
    setUpgradeResult(null);
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
          <CTAButton onClick={() => (window.location.href = "/")}>返回首页</CTAButton>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="px-[20px] pt-[60px] pb-[120px]">
        {/* Score Card */}
        <section className="text-center pt-xl pb-lg">
          <p className="text-body text-text-secondary mb-sm">{data.name}</p>
          <IQRing score={data.iq_score} />
          <p className="text-h2 font-semibold text-text-primary mt-md">{data.title}</p>
          <p className="text-caption text-text-secondary mt-xs">
            超过 {data.percentile}% 的小龙虾 &middot; 排名 #{data.rank}/{data.total_participants}
          </p>
          {data.model && (
            <p className="text-mini text-text-muted mt-xs">
              模型: {data.model} &middot; 耗时: {data.duration_seconds}s
            </p>
          )}
        </section>

        {/* Diagnosis Summary */}
        <section className="mb-lg">
          <div className="rounded-lg p-md" style={{ backgroundColor: "var(--bg-surface)" }}>
            <p className="text-body text-text-primary">
              {canUpgradeCount > 0
                ? `发现 ${canUpgradeCount} 项能力可提升，${fullScoreCount} 项已满分`
                : `全部 ${fullScoreCount} 项能力已满分！`}
            </p>
          </div>
        </section>

        {/* Ability Scan Report */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-md">能力扫描报告</h2>
          <div className="space-y-sm">
            {QUESTIONS.filter((q) => q.maxScore > 0).map((q) => {
              const score = data.scores[q.id] ?? 0;
              const isFull = score >= q.maxScore;
              const isUnlocked = data.unlocked_qids.includes(q.id);
              const canUpgrade = q.upgradeable && !isFull && !isUnlocked;

              return (
                <div
                  key={q.id}
                  className="rounded-lg p-md"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <div className="flex items-center justify-between mb-xs">
                    <div className="flex items-center gap-sm">
                      <span className="text-body font-medium text-text-primary">
                        {isFull ? "✅" : isUnlocked ? "✅" : "❌"} {q.id.toUpperCase()} {q.name}
                      </span>
                    </div>
                    <span className="text-body font-semibold tabular-nums" style={{
                      color: isFull ? "var(--success)" : score > 0 ? "var(--warning)" : "var(--error)"
                    }}>
                      {score}/{q.maxScore}
                    </span>
                  </div>

                  {isFull && (
                    <span className="text-mini px-sm py-2xs rounded-full" style={{
                      backgroundColor: "rgba(48,209,88,0.15)", color: "var(--success)"
                    }}>满分</span>
                  )}

                  {isUnlocked && !isFull && (
                    <span className="text-mini px-sm py-2xs rounded-full" style={{
                      backgroundColor: "rgba(0,122,255,0.15)", color: "var(--unlocked)"
                    }}>已解锁</span>
                  )}

                  {canUpgrade && (
                    <div className="mt-sm">
                      <p className="text-caption text-text-secondary mb-sm">{q.description}</p>
                      {q.previewText && (
                        <p className="text-caption text-text-muted mb-sm">
                          💡 解锁后：{q.previewText}
                        </p>
                      )}
                      <div className="flex gap-sm">
                        <button
                          onClick={() => handleUpgradeClick(q.id)}
                          className="flex-1 h-[36px] rounded-md text-caption font-semibold text-white"
                          style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
                        >
                          💰 ¥9.9 解锁
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex-1 h-[36px] rounded-md text-caption font-medium text-text-secondary border border-border"
                        >
                          分享免费解锁
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Growth Chart */}
        {data.history.length > 1 && (
          <section className="mt-xl">
            <h2 className="text-h2 font-semibold text-text-primary mb-md">龙虾成长日记</h2>
            <div className="rounded-lg p-md" style={{ backgroundColor: "var(--bg-surface)" }}>
              <div className="flex items-end gap-xs h-[120px]">
                {data.history.map((h, i) => {
                  const max = Math.max(...data.history.map((x) => x.iq_score), 1);
                  const height = (h.iq_score / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end">
                      <span className="text-mini text-text-muted mb-xs tabular-nums">{h.iq_score}</span>
                      <div
                        className="w-full rounded-sm min-h-[4px]"
                        style={{
                          height: `${height}%`,
                          background: "linear-gradient(to top, var(--accent-start), var(--accent-end))",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-app mx-auto px-[20px] pb-[20px] pt-sm" style={{
          background: "linear-gradient(to top, var(--bg-primary) 60%, transparent)"
        }}>
          <CTAButton onClick={handleShare}>
            {canUpgradeCount > 0 ? "📤 分享免费解锁 1 项能力" : "炫耀我的成绩"}
          </CTAButton>
        </div>
      </div>

      {/* Upgrade Bottom Sheet */}
      <BottomSheet open={!!upgrade} onClose={upgrade?.step === 3 ? undefined : handleUpgradeClose} closable={upgrade?.step !== 3}>
        {upgrade?.step === 1 && (
          <div>
            <h3 className="text-h2 font-semibold text-text-primary mb-sm">
              解锁「{upgrade.qName}」能力
            </h3>
            {upgrade.previewText && (
              <p className="text-caption text-text-secondary mb-md">解锁后：{upgrade.previewText}</p>
            )}
            <div className="rounded-md p-md mb-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <p className="text-body text-text-primary">
                {upgrade.qid.toUpperCase()} {upgrade.qName}: {upgrade.currentScore} → {upgrade.maxScore}{" "}
                <span style={{ color: "var(--success)" }}>+{upgrade.maxScore - upgrade.currentScore}</span>
              </p>
            </div>
            <CTAButton onClick={handlePay}>¥9.9 立即购买</CTAButton>
            <div className="mt-sm">
              <CTAButton variant="secondary" onClick={handleUpgradeClose}>稍后再说</CTAButton>
            </div>
          </div>
        )}

        {upgrade?.step === 1.5 && (
          <div>
            <h3 className="text-h2 font-semibold text-text-primary mb-md">支付 ¥9.9</h3>
            <p className="text-body text-text-secondary mb-lg">MVP 阶段：点击确认即可继续</p>
            <CTAButton onClick={handlePayConfirm}>我已支付</CTAButton>
          </div>
        )}

        {upgrade?.step === 2 && (
          <div>
            <h3 className="text-h2 font-semibold text-text-primary mb-sm">复制升级命令</h3>
            <p className="text-caption text-text-secondary mb-md">升级 + 重测约需 3-5 分钟</p>
            <div className="rounded-md p-md mb-md overflow-x-auto" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <code className="text-caption font-mono text-text-secondary break-all whitespace-pre-wrap leading-relaxed">
                {upgradeCommand}
              </code>
            </div>
            <CTAButton onClick={handleCopyUpgrade}>
              {copied ? "✅ 已复制" : "一键复制命令"}
            </CTAButton>
            {copied && (
              <div className="mt-sm">
                <CTAButton variant="secondary" onClick={handleUpgradeSent}>
                  已发送，开始等待升级结果
                </CTAButton>
              </div>
            )}
          </div>
        )}

        {upgrade?.step === 3 && (
          <div className="text-center">
            <h3 className="text-h2 font-semibold text-text-primary mb-md">正在升级并验证...</h3>
            <div className="flex justify-center gap-xs mb-lg">
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
            <div className="space-y-sm text-left">
              <p className="text-caption text-text-secondary">⏳ 安装 skill 中...</p>
              <p className="text-caption text-text-muted">⏳ 重测能力中...</p>
              <p className="text-caption text-text-muted">⏳ 更新成绩中...</p>
            </div>
          </div>
        )}

        {upgrade?.step === 4 && upgradeResult && (
          <div className="text-center">
            <div className="text-[48px] mb-md">🎉</div>
            <h3 className="text-h2 font-semibold text-text-primary mb-sm">升级成功！</h3>
            <div className="rounded-md p-md mb-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <p className="text-body text-text-primary">
                智力值: {upgradeResult.old_iq} → {upgradeResult.new_iq}{" "}
                <span style={{ color: "var(--success)" }}>
                  +{upgradeResult.new_iq - upgradeResult.old_iq}
                </span>
              </p>
            </div>
            <CTAButton onClick={handleShare}>炫耀新成绩</CTAButton>
            <div className="mt-sm">
              <CTAButton variant="secondary" onClick={handleUpgradeClose}>
                查看更新后的报告
              </CTAButton>
            </div>
          </div>
        )}
      </BottomSheet>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
