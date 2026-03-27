"use client";

import { useState, useCallback } from "react";
import BottomSheet from "./BottomSheet";
import CTAButton from "./CTAButton";

interface InstallModalProps {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  refToken: string | null;
}

function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  // Fallback for HTTP
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return Promise.resolve(ok);
}

export default function InstallModal({ open, onClose, defaultName, refToken }: InstallModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState("");
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const handleNext = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ref: refToken }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setCommand(data.command);
        localStorage.setItem("claw_token", data.token);
        localStorage.setItem("claw_name", name.trim());
        setStep(2);
      }
    } catch {
      // retry silently
    } finally {
      setLoading(false);
    }
  }, [name, refToken]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(command);
    if (ok) setCopied(true);
  }, [command]);

  const handleConfirm = useCallback(() => {
    window.location.href = `/wait/${token}`;
  }, [token]);

  const handleClose = useCallback(() => {
    setStep(1);
    setCopied(false);
    setCommand("");
    setToken("");
    onClose();
  }, [onClose]);

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {step === 1 ? (
        <div>
          <h3 className="text-h2 font-semibold text-text-primary mb-md">
            给你的龙虾起个名字
          </h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="大力龙虾、闪电虾、学霸虾..."
            maxLength={20}
            className="w-full h-[48px] px-md rounded-md text-body text-text-primary placeholder:text-text-muted outline-none"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && handleNext()}
            autoFocus
          />
          <div className="mt-lg">
            <CTAButton onClick={handleNext} disabled={!name.trim() || loading}>
              {loading ? "正在准备..." : "下一步"}
            </CTAButton>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-h2 font-semibold text-text-primary mb-sm">
            复制命令发给你的龙虾
          </h3>
          <p className="text-caption text-text-secondary mb-md">
            把下面的命令复制到你的小龙虾对话框中
          </p>

          <div
            className="rounded-md p-md mb-md overflow-x-auto"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <code className="text-caption font-mono text-text-secondary break-all whitespace-pre-wrap leading-relaxed">
              {command}
            </code>
          </div>

          <CTAButton onClick={handleCopy}>
            {copied ? "✅ 已复制" : "一键复制命令"}
          </CTAButton>

          {copied && (
            <div className="mt-md">
              <CTAButton variant="secondary" onClick={handleConfirm}>
                已发送给我的龙虾
              </CTAButton>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
