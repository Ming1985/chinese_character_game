import { OCRProvider } from '../types/ocr';

// 百度 OCR 配置
// 请替换为你的 API Key 和 Secret Key
export const OCR_CONFIG = {
    apiKey: 'UHsP8W7b1YJyZa3iqOYMVzR4',
    secretKey: 'DP8MqAAnICz2dpqPNZhDWhRzxhKS2gUe',
};

// 本地 RapidOCR 配置
export const LOCAL_OCR_CONFIG = {
    serverUrl: 'http://localhost:5001',
};

// 当前使用的 OCR 服务
// 'baidu' - 百度 OCR（需要网络，有免费额度限制）
// 'local' - 本地 RapidOCR（需要运行 ocr-server）
export const OCR_PROVIDER: OCRProvider = 'local';
