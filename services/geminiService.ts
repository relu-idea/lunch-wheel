
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiLunchComment = async (restaurantName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `"${restaurantName}"이라는 식당이 점심 메뉴로 당첨되었어. 이 식당에서 점심을 먹으러 가는 직장인들에게 아주 짧고 재치 있는 한 줄 응원 코멘트를 한국어로 해줘. (예: "오늘 제육볶음 각이네요!", "여기 돈까스 진짜 맛있죠, 탁월한 선택!")`,
      config: {
        systemInstruction: "당신은 센스 넘치는 맛집 추천 전문가입니다. 반말과 존댓말을 섞어 친근하고 유머러스하게 말하세요. 20자 내외로 짧게 답변하세요.",
        temperature: 0.8,
      },
    });

    return response.text?.trim() || "좋은 선택이에요! 맛있게 드세요.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "맛있는 점심 시간 되세요!";
  }
};
