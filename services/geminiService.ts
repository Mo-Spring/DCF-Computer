
import { GoogleGenAI } from "@google/genai";
import { DCFInputs, DCFResult } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDVoOBSgZmf5lEYqQg_INj7wFESRI6iGmQ" });

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try { return await fn(); } catch (error: any) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const fetchCompanyData = async (query: string) => {
  const prompt = `
    作为资深财务审计，搜索并识别 "${query}" 的详细财务数据。你需要提供最新的一季报、半年报或年报数据。
    
    【核心指令：数据可靠性与时间戳】
    1. 必须指明这些财务数据对应的“基准日期”（例如：2023年报、2024Q3季报）。
    2. 必须给出抓取时股价的“最新交易时间”。
    3. 单位标准化：将所有“总量”数据转换为“元”（Integer格式），绝对不要带“亿”或“万”。
    4. 计算：净负债 = 总有息债务 - 现金及等价物。
    
    返回 JSON (必须严格遵守此格式，不要包含任何解释文字，直接输出 JSON 对象)：
    {
      "inputs": {
        "currentPrice": 数字,
        "initialFCF": 数字(元),
        "growthRate": 数字(百分比),
        "discountRate": 8,
        "terminalGrowthRate": 2,
        "netDebt": 数字(元),
        "sharesOutstanding": 数字(股),
        "eps": 数字,
        "bvps": 数字,
        "sps": 数字,
        "ocfps": 数字,
        "dividendPerShare": 数字,
        "asOfDate": "数据基准日期(如: 2024-09-30)",
        "confidenceScore": 1-100之间的整数
      },
      "historical": {
        "pe": { "min": 数字, "max": 数字 },
        "pb": { "min": 数字, "max": 数字 },
        "ps": { "min": 数字, "max": 数字 },
        "pcf": { "min": 数字, "max": 数字 },
        "dy": { "min": 数字, "max": 数字 }
      },
      "context": {
        "type": "类型名",
        "focusMetrics": ["指标1", "指标2"],
        "description": "简述"
      }
    }
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "";
    // 尝试更宽泛的 JSON 匹配
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("AI Raw Response:", text);
      throw new Error(text.length > 50 ? text.substring(0, 50) + "..." : "AI 未能按格式返回数据，可能未找到该公司信息。");
    }
    
    try {
      const result = JSON.parse(jsonMatch[0]);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || "官方披露",
        uri: chunk.web?.uri || "#"
      })) || [];

      return { data: result, sources };
    } catch (parseError) {
      throw new Error("数据解析失败，请尝试更精确的公司全称。");
    }
  });
};

export const getFinancialInsights = async (inputs: DCFInputs, results: DCFResult): Promise<string> => {
  const prompt = `
    分析对象：${results.companyType}，数据基准日：${inputs.asOfDate || '未知'}。
    
    审计任务：
    1. 核对 FCF (${inputs.initialFCF}元) 与 净负债 (${inputs.netDebt}元) 的量级是否匹配。
    2. 根据当前的宏观环境下 ${inputs.discountRate}% 的折现率是否保守。
    3. 指出当前 ${inputs.asOfDate} 之后可能存在的重大财务变动。
    4. 评估其 ${inputs.confidenceScore}% 的数据可信度是否足以支撑投资决策。
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "建议查看明细数据进行手动校验。";
  });
};
