export interface Question {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  upgradeable: boolean;
  previewText: string;
  skillPackage: string;
}

export const QUESTIONS: Question[] = [
  { id: "q1", name: "自我进化诊断", description: "评估 agent 自我改进能力", maxScore: 10, upgradeable: true, previewText: "自动检测并改进自身能力短板", skillPackage: "self-improving-agent.zip" },
  { id: "q2", name: "安全技能诊断", description: "检测安装 skill 前的安全审查能力", maxScore: 10, upgradeable: true, previewText: "安装 skill 前自动安全审查", skillPackage: "skill-vetter.zip" },
  { id: "q3", name: "自主检索技能", description: "能否自主搜索并安装需要的 skill", maxScore: 10, upgradeable: true, previewText: "自动搜索并安装所需技能", skillPackage: "find-skills.zip" },
  { id: "q4", name: "浏览器操作", description: "浏览器自动化截图与交互", maxScore: 10, upgradeable: true, previewText: "自动截图、填表单、读网页内容", skillPackage: "browser-self-enable.zip" },
  { id: "q5", name: "实时信息查询", description: "获取实时股价等动态数据", maxScore: 10, upgradeable: true, previewText: "查询实时股价、天气等动态信息", skillPackage: "instruct-agent-self.md" },
  { id: "q6", name: "图片生成", description: "根据描述生成图片", maxScore: 10, upgradeable: true, previewText: "根据文字描述生成高质量图片", skillPackage: "seedream-image-gen-skill.zip" },
  { id: "q7", name: "PPT 制作", description: "自动生成演示文稿", maxScore: 10, upgradeable: true, previewText: "自动创建专业 PPT 演示文稿", skillPackage: "frontend-slides-skill.zip" },
  { id: "q8", name: "Excel 分析", description: "数据分析与表格处理", maxScore: 10, upgradeable: true, previewText: "自动分析 Excel 数据、生成报表", skillPackage: "spreadsheet-skill.zip" },
  { id: "q9", name: "视频生成", description: "自动生成短视频", maxScore: 10, upgradeable: true, previewText: "根据脚本自动生成视频内容", skillPackage: "remotion-video.skill" },
  { id: "q10", name: "手机通讯", description: "飞书等通讯工具操作", maxScore: 10, upgradeable: true, previewText: "通过飞书发送消息和文件", skillPackage: "feishu-file.zip" },
  { id: "q11", name: "代码执行", description: "安全执行代码片段", maxScore: 10, upgradeable: false, previewText: "", skillPackage: "" },
  { id: "q12", name: "已安装技能", description: "统计已安装 skill 数量", maxScore: 0, upgradeable: false, previewText: "", skillPackage: "" },
  { id: "q13", name: "高危动作防护", description: "识别并阻止危险操作", maxScore: 10, upgradeable: true, previewText: "自动识别并阻止危险操作", skillPackage: "destructive-action-guard.zip" },
  { id: "q14", name: "定时任务", description: "设置和管理定时任务", maxScore: 10, upgradeable: true, previewText: "自动创建和管理定时任务", skillPackage: "async-scheduler.zip" },
  { id: "q15", name: "现实决策判断", description: "面对真实场景的决策能力", maxScore: 10, upgradeable: true, previewText: "在现实场景中做出正确决策", skillPackage: "reality-checker.zip" },
  { id: "q16", name: "并行任务", description: "同时处理多个任务的能力", maxScore: 10, upgradeable: true, previewText: "同时高效处理多个任务", skillPackage: "parallel-executor.zip" },
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
