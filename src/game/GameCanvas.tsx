/**
 * GameCanvas - Skia 游戏画布组件
 *
 * 提供基于 Skia 的游戏渲染画布，集成 Reanimated 游戏循环。
 * 支持全屏渲染、自适应尺寸、deltaTime 回调。
 */

import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
    useSharedValue,
    useFrameCallback,
    runOnJS,
} from 'react-native-reanimated';

export interface GameCanvasProps {
    /** 游戏更新回调，每帧调用 */
    onUpdate?: (deltaTime: number) => void;
    /** 是否暂停游戏循环 */
    paused?: boolean;
    /** 子元素（Skia 绘制元素） */
    children?: React.ReactNode;
    /** 自定义样式 */
    style?: object;
}

export interface GameCanvasRef {
    /** 获取画布尺寸 */
    getSize: () => { width: number; height: number };
    /** 暂停游戏循环 */
    pause: () => void;
    /** 恢复游戏循环 */
    resume: () => void;
}

/**
 * GameCanvas 组件
 *
 * @example
 * ```tsx
 * <GameCanvas onUpdate={(dt) => console.log('deltaTime:', dt)}>
 *   <Circle cx={100} cy={100} r={50} color="red" />
 * </GameCanvas>
 * ```
 */
export const GameCanvas = React.forwardRef<GameCanvasRef, GameCanvasProps>(
    ({ onUpdate, paused = false, children, style }, ref) => {
        const { width, height } = useWindowDimensions();
        const lastTime = useSharedValue(0);
        const isPaused = useSharedValue(paused);

        // 同步 paused prop 到 shared value
        useEffect(() => {
            isPaused.value = paused;
        }, [paused, isPaused]);

        // 暴露方法给父组件
        React.useImperativeHandle(
            ref,
            () => ({
                getSize: () => ({ width, height }),
                pause: () => {
                    isPaused.value = true;
                },
                resume: () => {
                    isPaused.value = false;
                },
            }),
            [width, height, isPaused]
        );

        // 游戏循环 - 在 UI 线程运行
        useFrameCallback((frameInfo) => {
            'worklet';
            if (isPaused.value) {
                lastTime.value = frameInfo.timestamp;
                return;
            }

            // 计算 deltaTime (毫秒)
            const currentTime = frameInfo.timestamp;
            const deltaTime =
                lastTime.value === 0 ? 16.67 : currentTime - lastTime.value;
            lastTime.value = currentTime;

            // 限制 deltaTime 避免跳帧
            const clampedDelta = Math.min(deltaTime, 100);

            // 回调到 JS 线程
            if (onUpdate) {
                runOnJS(onUpdate)(clampedDelta);
            }
        }, true);

        return (
            <View style={[styles.container, style]}>
                <Canvas style={styles.canvas}>
                    <Group>{children}</Group>
                </Canvas>
            </View>
        );
    }
);

GameCanvas.displayName = 'GameCanvas';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvas: {
        flex: 1,
    },
});

export default GameCanvas;
