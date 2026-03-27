export interface TitleInfo {
  title: string;
  badge: string;
  color: string;
}

const TITLE_TABLE: { min: number; info: TitleInfo }[] = [
  { min: 150, info: { title: "波士顿龙虾", badge: "🦞 波士顿龙虾", color: "gold" } },
  { min: 142, info: { title: "锦绣龙虾", badge: "🔴 澳洲大龙虾", color: "red" } },
  { min: 130, info: { title: "澳洲大龙虾", badge: "🔴 澳洲大龙虾", color: "red" } },
  { min: 122, info: { title: "澳洲小青龙", badge: "🔴 澳洲大龙虾", color: "red" } },
  { min: 114, info: { title: "阿根廷红虾", badge: "🔴 澳洲大龙虾", color: "orange" } },
  { min: 104, info: { title: "黑虎虾", badge: "🔴 澳洲大龙虾", color: "orange" } },
  { min: 92, info: { title: "北极甜虾", badge: "🟠 蒜蓉大虾", color: "yellow" } },
  { min: 80, info: { title: "青虾", badge: "🟠 蒜蓉大虾", color: "yellow" } },
  { min: 68, info: { title: "基围虾", badge: "🟠 蒜蓉大虾", color: "blue" } },
  { min: 52, info: { title: "黄油焗大虾", badge: "🟠 蒜蓉大虾", color: "blue" } },
  { min: 32, info: { title: "蒜蓉大虾", badge: "🟡 麻辣小龙虾", color: "gray" } },
  { min: 27, info: { title: "油焖小龙虾", badge: "🟡 麻辣小龙虾", color: "gray" } },
  { min: 22, info: { title: "麻辣小龙虾", badge: "🟡 麻辣小龙虾", color: "gray" } },
  { min: 17, info: { title: "麻辣虾尾", badge: "🟡 麻辣小龙虾", color: "gray" } },
  { min: 12, info: { title: "白灼虾", badge: "🔵 冻虾仁", color: "gray" } },
  { min: 6, info: { title: "冻虾仁", badge: "🔵 冻虾仁", color: "gray" } },
  { min: 0, info: { title: "虾皮", badge: "💀 虾皮", color: "gray" } },
];

export function getTitleForIQ(iq: number): TitleInfo {
  for (const entry of TITLE_TABLE) {
    if (iq >= entry.min) return entry.info;
  }
  return TITLE_TABLE[TITLE_TABLE.length - 1].info;
}

export function calculateIQ(scores: Record<string, number>, speedBonus: number, skillBonus: number): number {
  let base = 0;
  for (const [key, val] of Object.entries(scores)) {
    if (key !== "q12") base += val;
  }
  return base + speedBonus + skillBonus;
}
