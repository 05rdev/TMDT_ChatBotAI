import axios from "axios";

/**
 * Dịch văn bản sử dụng Google Translate API (gtx)
 * @param {string} text - Văn bản cần dịch
 * @param {string} targetLang - Mã ngôn ngữ đích (mặc định: 'vi')
 * @returns {Promise<string>} - Văn bản đã dịch hoặc văn bản gốc nếu lỗi
 */
export async function translateText(text: string, targetLang: string = 'vi'): Promise<string> {
  if (!text || typeof text !== 'string' || text.trim() === "") return text;
  try {
    // Chỉ dịch nếu chứa ký tự alpha (tránh dịch các chuỗi số/icon)
    if (!/[a-zA-Z]/.test(text)) return text;
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && response.data[0]) {
      return response.data[0].map((item: any) => item[0]).join('');
    }
  } catch (error: any) {
    console.error(`[Translation Error] from ${text.substring(0, 20)}... :`, error.message);
  }
  return text;
}
