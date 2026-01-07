import React, { useCallback, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, GestureResponderEvent, ActivityIndicator, useWindowDimensions } from 'react-native';
import Svg, { Path as SvgPath, Line, Rect } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { StrokePoint } from '../types';
import { getOCRService } from '../lib/ocrService';

interface WritingPadProps {
    targetChar: string;
    onComplete: (recognizedChar: string, isCorrect: boolean) => void;
    disabled?: boolean;
}

const STROKE_WIDTH = 6;

// 根据屏幕宽度计算田字格大小
function getPadSize(screenWidth: number): number {
    if (screenWidth >= 1024) return 400; // iPad Pro
    if (screenWidth >= 768) return 340;  // iPad
    return 260; // iPhone
}

export default function WritingPad({ targetChar, onComplete, disabled }: WritingPadProps) {
    const { width: screenWidth } = useWindowDimensions();
    const PAD_SIZE = getPadSize(screenWidth);

    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isRecognizing, setIsRecognizing] = useState(false);

    const currentPathRef = useRef<string>('');
    const strokesRef = useRef<StrokePoint[][]>([]);
    const currentStrokeRef = useRef<StrokePoint[]>([]);
    const captureViewRef = useRef<View>(null);

    const handleClear = useCallback(() => {
        setPaths([]);
        setCurrentPath('');
        currentPathRef.current = '';
        strokesRef.current = [];
        currentStrokeRef.current = [];
    }, []);

    const handleSubmit = useCallback(async () => {
        if (paths.length === 0 || isRecognizing) {
            return;
        }

        setIsRecognizing(true);

        try {
            // 截图
            const base64Image = await captureRef(captureViewRef, {
                format: 'png',
                quality: 1,
                result: 'base64',
                width: PAD_SIZE,
                height: PAD_SIZE,
            });

            // 调用 OCR
            const ocrService = getOCRService();
            const result = await ocrService.recognizeHandwriting(base64Image);

            if (result.success) {
                const isCorrect = result.character === targetChar;
                console.log(`OCR 结果: "${result.character}" (置信度: ${result.confidence.toFixed(2)}), 目标: "${targetChar}", 正确: ${isCorrect}`);
                console.log('候选字:', result.candidates);
                onComplete(result.character, isCorrect);
            } else {
                console.warn('OCR failed:', result.error);
                onComplete('', false);
            }
        } catch (error) {
            console.error('Recognition error:', error);
            onComplete('', false);
        } finally {
            setIsRecognizing(false);
            handleClear();
        }
    }, [paths, targetChar, onComplete, handleClear, isRecognizing]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled && !isRecognizing,
        onMoveShouldSetPanResponder: () => !disabled && !isRecognizing,
        onPanResponderGrant: (e: GestureResponderEvent) => {
            if (disabled || isRecognizing) return;
            const { locationX, locationY } = e.nativeEvent;
            const newPath = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
            currentPathRef.current = newPath;
            setCurrentPath(newPath);

            const point = { x: locationX, y: locationY, pressure: 1, timestamp: Date.now() };
            currentStrokeRef.current = [point];
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
            if (disabled || isRecognizing) return;
            const { locationX, locationY } = e.nativeEvent;
            const newPath = `${currentPathRef.current} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
            currentPathRef.current = newPath;
            setCurrentPath(newPath);

            const point = { x: locationX, y: locationY, pressure: 1, timestamp: Date.now() };
            currentStrokeRef.current.push(point);
        },
        onPanResponderRelease: () => {
            if (disabled || isRecognizing) return;
            const pathToSave = currentPathRef.current;
            if (pathToSave && pathToSave.length > 0) {
                setPaths(prev => [...prev, pathToSave]);
                strokesRef.current.push([...currentStrokeRef.current]);
            }
            currentPathRef.current = '';
            setCurrentPath('');
            currentStrokeRef.current = [];
        },
        onPanResponderTerminate: () => {
            currentPathRef.current = '';
            setCurrentPath('');
            currentStrokeRef.current = [];
        },
    }), [disabled, isRecognizing]);

    // 动态尺寸样式
    const sizeStyles = {
        gridContainer: {
            width: PAD_SIZE,
            height: PAD_SIZE,
            position: 'relative' as const,
        },
        canvasWrapper: {
            width: PAD_SIZE,
            height: PAD_SIZE,
            backgroundColor: '#0a0a15',
            position: 'relative' as const,
        },
        captureView: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: PAD_SIZE,
            height: PAD_SIZE,
            zIndex: 1,
            backgroundColor: '#FFFFFF',
        },
        overlayView: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: PAD_SIZE,
            height: PAD_SIZE,
            zIndex: 2,
            backgroundColor: '#0a0a15',
        },
    };

    return (
        <View style={styles.container}>
            <View style={sizeStyles.gridContainer}>
                <View style={sizeStyles.canvasWrapper} {...panResponder.panHandlers}>
                    {/* 隐藏的白底黑字 View 用于截图（提高 OCR 识别率） */}
                    <View
                        ref={captureViewRef}
                        style={sizeStyles.captureView}
                        collapsable={false}
                    >
                        <Svg width={PAD_SIZE} height={PAD_SIZE}>
                            <Rect x={0} y={0} width={PAD_SIZE} height={PAD_SIZE} fill="#FFFFFF" />
                            {paths.map((pathStr, index) => (
                                <SvgPath
                                    key={index}
                                    d={pathStr}
                                    stroke="#000000"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ))}
                            {currentPath ? (
                                <SvgPath
                                    d={currentPath}
                                    stroke="#000000"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ) : null}
                        </Svg>
                    </View>

                    {/* 显示层：田字格和彩色笔画 */}
                    <View style={sizeStyles.overlayView} pointerEvents="none">
                        <Svg width={PAD_SIZE} height={PAD_SIZE}>
                            {/* 田字格线 */}
                            <Line x1={PAD_SIZE / 2} y1={0} x2={PAD_SIZE / 2} y2={PAD_SIZE}
                                  stroke="#333" strokeWidth={1} strokeDasharray="8,4" />
                            <Line x1={0} y1={PAD_SIZE / 2} x2={PAD_SIZE} y2={PAD_SIZE / 2}
                                  stroke="#333" strokeWidth={1} strokeDasharray="8,4" />
                            <Line x1={0} y1={0} x2={PAD_SIZE} y2={PAD_SIZE}
                                  stroke="#222" strokeWidth={1} strokeDasharray="8,4" />
                            <Line x1={PAD_SIZE} y1={0} x2={0} y2={PAD_SIZE}
                                  stroke="#222" strokeWidth={1} strokeDasharray="8,4" />

                            {/* 显示笔画 */}
                            {paths.map((pathStr, index) => (
                                <SvgPath
                                    key={index}
                                    d={pathStr}
                                    stroke="#fff"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ))}
                            {currentPath ? (
                                <SvgPath
                                    d={currentPath}
                                    stroke="#f39c12"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ) : null}
                        </Svg>
                    </View>
                </View>
                <View style={styles.gridBorder} pointerEvents="none" />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    disabled={isRecognizing}
                >
                    <Text style={styles.buttonText}>清除</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (disabled || paths.length === 0 || isRecognizing) && styles.buttonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={disabled || paths.length === 0 || isRecognizing}
                >
                    {isRecognizing ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>确定</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    gridBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 3,
        borderColor: '#f39c12',
        borderRadius: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 8,
    },
    clearButton: {
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginRight: 16,
    },
    submitButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#999',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
