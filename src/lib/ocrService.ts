import { OCRResult, BaiduOCRResponse, OCRConfig, LocalOCRConfig, OCRProvider } from '../types/ocr';

const BAIDU_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token';
const BAIDU_HANDWRITING_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting';

class OCRService {
    private config: OCRConfig;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(config: OCRConfig) {
        this.config = config;
    }

    // 获取 access_token
    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const url = `${BAIDU_TOKEN_URL}?grant_type=client_credentials&client_id=${this.config.apiKey}&client_secret=${this.config.secretKey}`;

        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();

        if (data.error) {
            throw new Error(`Token error: ${data.error_description}`);
        }

        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in - 86400) * 1000;

        return this.accessToken!;
    }

    // 识别手写汉字
    async recognizeHandwriting(base64Image: string): Promise<OCRResult> {
        try {
            const token = await this.getAccessToken();

            // 移除 base64 前缀
            const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

            const formData = new URLSearchParams();
            formData.append('image', imageData);
            formData.append('language_type', 'CHN_ENG');
            formData.append('probability', 'true');

            const response = await fetch(
                `${BAIDU_HANDWRITING_URL}?access_token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                }
            );

            const data: BaiduOCRResponse = await response.json();

            if (data.error_code) {
                return {
                    success: false,
                    character: '',
                    confidence: 0,
                    error: `API Error ${data.error_code}: ${data.error_msg}`,
                };
            }

            if (data.words_result_num === 0 || !data.words_result.length) {
                return {
                    success: false,
                    character: '',
                    confidence: 0,
                    error: 'NO_TEXT_DETECTED',
                };
            }

            const firstResult = data.words_result[0];
            const recognizedText = firstResult.words.trim();
            const firstChar = recognizedText.charAt(0);
            const confidence = firstResult.probability?.average ?? 0.8;

            return {
                success: true,
                character: firstChar,
                confidence,
                candidates: recognizedText.split('').slice(0, 5),
            };
        } catch (error) {
            return {
                success: false,
                character: '',
                confidence: 0,
                error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
            };
        }
    }
}

// 单例
let ocrServiceInstance: OCRService | null = null;

export function initOCRService(config: OCRConfig): void {
    ocrServiceInstance = new OCRService(config);
}

export function getOCRService(): OCRService {
    if (!ocrServiceInstance) {
        throw new Error('OCR Service not initialized. Call initOCRService first.');
    }
    return ocrServiceInstance;
}

export { OCRService };

// ============ 本地 RapidOCR 服务 ============

class LocalOCRService {
    private config: LocalOCRConfig;

    constructor(config: LocalOCRConfig) {
        this.config = config;
    }

    async recognizeHandwriting(base64Image: string): Promise<OCRResult> {
        try {
            const response = await fetch(`${this.config.serverUrl}/ocr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            const data = await response.json();

            if (!data.success) {
                return {
                    success: false,
                    character: '',
                    confidence: 0,
                    error: data.error || 'UNKNOWN_ERROR',
                };
            }

            return {
                success: true,
                character: data.character,
                confidence: data.confidence,
                candidates: data.candidates,
            };
        } catch (error) {
            return {
                success: false,
                character: '',
                confidence: 0,
                error: error instanceof Error ? error.message : 'NETWORK_ERROR',
            };
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.serverUrl}/health`);
            const data = await response.json();
            return data.status === 'ok';
        } catch {
            return false;
        }
    }
}

// 本地 OCR 单例
let localOCRServiceInstance: LocalOCRService | null = null;

export function initLocalOCRService(config: LocalOCRConfig): void {
    localOCRServiceInstance = new LocalOCRService(config);
}

export function getLocalOCRService(): LocalOCRService {
    if (!localOCRServiceInstance) {
        throw new Error('Local OCR Service not initialized. Call initLocalOCRService first.');
    }
    return localOCRServiceInstance;
}

export { LocalOCRService };

// ============ 统一 OCR 接口 ============

let currentProvider: OCRProvider = 'baidu';

export function setOCRProvider(provider: OCRProvider): void {
    currentProvider = provider;
}

export function getOCRProvider(): OCRProvider {
    return currentProvider;
}

export async function recognizeHandwriting(base64Image: string): Promise<OCRResult> {
    if (currentProvider === 'local' && localOCRServiceInstance) {
        return localOCRServiceInstance.recognizeHandwriting(base64Image);
    }
    if (ocrServiceInstance) {
        return ocrServiceInstance.recognizeHandwriting(base64Image);
    }
    return {
        success: false,
        character: '',
        confidence: 0,
        error: 'No OCR service initialized',
    };
}
