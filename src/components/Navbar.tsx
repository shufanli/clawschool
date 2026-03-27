"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[44px] flex items-center px-[20px] transition-colors duration-200"
      style={{
        backgroundColor: scrolled ? "rgba(26,18,21,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="max-w-app mx-auto w-full">
        <span className="text-body font-semibold text-text-primary">
          龙虾学校
        </span>
      </div>
    </nav>
  );
}
