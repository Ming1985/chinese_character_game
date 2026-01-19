#!/usr/bin/env python3
"""本地 RapidOCR 服务 - 手写汉字识别"""

import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from rapidocr_onnxruntime import RapidOCR

app = Flask(__name__)
CORS(app)

# 初始化 OCR 引擎
engine = RapidOCR()


@app.route('/ocr', methods=['POST'])
def recognize():
    """识别手写汉字"""
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        # 解析 base64 图片
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # OCR 识别
        result, elapse = engine(image_bytes)

        if not result:
            return jsonify({
                'success': False,
                'character': '',
                'confidence': 0,
                'error': 'NO_TEXT_DETECTED'
            })

        # 提取第一个识别结果
        # result 格式: [[box, text, confidence], ...]
        first_result = result[0]
        text = first_result[1]
        confidence = first_result[2]

        # 取第一个字符
        first_char = text[0] if text else ''

        return jsonify({
            'success': True,
            'character': first_char,
            'confidence': confidence,
            'candidates': list(text[:5]) if text else [],
            'elapse': elapse
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'character': '',
            'confidence': 0,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({'status': 'ok', 'engine': 'RapidOCR'})


if __name__ == '__main__':
    print("RapidOCR 服务启动中...")
    print("API 地址: http://localhost:5001/ocr")
    app.run(host='0.0.0.0', port=5001, debug=False)
