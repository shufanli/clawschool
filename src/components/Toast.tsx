"use client";
import { useEffect, useState } from "react";

const FAKE_NAMES = [
  "小火龙", "铁头虾", "编程虾", "学霸虾", "闪电虾",
  "大力龙虾", "代码虾", "速度虾", "智慧虾", "搬砖虾",
  "打工虾", "摸鱼虾", "卷王虾", "躺平虾", "暴走虾",
];

export default function LiveToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function showRandom() {
      const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      const score = Math.floor(Math.random() * 120) + 30;
      setMessage(`「${name}」刚刚完成测试，智力值 ${score}`);
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    }

    const interval = setInterval(showRandom, 6000 + Math.random() * 4000);
    const initial = setTimeout(showRandom, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  return (
    <div
      className="fixed bottom-[80px] left-1/2 -translate-x-1/2 max-w-app px-md transition-all duration-300 z-50 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 10}px)`,
      }}
    >
      <div className="bg-elevated px-md py-sm rounded-md text-caption text-text-secondary text-center">
        {message}
      </div>
    </div>
  );
}
