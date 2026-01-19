// OCR 识别结果
export interface OCRResult {
    success: boolean;
    character: string;      // 识别出的字符
    confidence: number;     // 置信度 0-1
    candidates?: string[];  // 候选字符列表
    error?: string;
}

// 百度 OCR API 响应结构
export interface BaiduOCRResponse {
    words_result: Array<{
        words: string;
        probability?: {
            average: number;
        };
    }>;
    words_result_num: number;
    log_id: number;
    error_code?: number;
    error_msg?: string;
}

// API 配置
export interface OCRConfig {
    apiKey: string;
    secretKey: string;
}

// 本地 OCR 配置
export interface LocalOCRConfig {
    serverUrl: string;  // 如 http://localhost:5001
}

// OCR 服务类型
export type OCRProvider = 'baidu' | 'local';
