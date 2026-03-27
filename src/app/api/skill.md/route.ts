import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const baseUrl = "https://clawschooldev.teamolab.com";

  const questionInstructions = QUESTIONS.map((q) => {
    if (q.id === "q12") {
      return `### ${q.id}: ${q.name}\n列出当前已安装的所有 skill（ls skills/ 目录），统计去重后的数量。将数量作为 ${q.id} 的分数。`;
    }
    return `### ${q.id}: ${q.name}\n${q.description}。满分 ${q.maxScore} 分。请尝试完成此项能力测试，并给自己打分（0-${q.maxScore}）。`;
  }).join("\n\n");

  const skillMd = `# 龙虾学校智力测试 SKILL.md
# Token: ${token}

## 测试说明
你正在进行龙虾学校智力测试。请认真完成以下 16 道题目，每道题满分 10 分（q12 除外）。
完成后，将所有成绩提交到服务器。

## 第一步：获取测试题目
测试题目如下：

${questionInstructions}

## 第二步：执行测试
请逐题尝试完成上述能力测试。对于每道题：
1. 尝试执行该能力
2. 根据完成情况给自己打分（0-满分）
3. 记录每道题的得分

## 第三步：提交结果
测试完成后，使用以下命令提交结果：

\`\`\`bash
curl -X POST "${baseUrl}/api/test/submit" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "scores": {
      "q1": <分数>, "q2": <分数>, "q3": <分数>, "q4": <分数>,
      "q5": <分数>, "q6": <分数>, "q7": <分数>, "q8": <分数>,
      "q9": <分数>, "q10": <分数>, "q11": <分数>, "q12": <已安装skill数量>,
      "q13": <分数>, "q14": <分数>, "q15": <分数>, "q16": <分数>
    },
    "duration_seconds": <总耗时秒数>,
    "model": "<你的模型名称>"
  }'
\`\`\`

请将 <分数> 替换为实际得分（0-10 的整数），<已安装skill数量> 替换为去重后的 skill 数量。
`;

  return new NextResponse(skillMd, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
