/**
 * SpriteAnimation - 精灵序列帧动画
 *
 * 在 GameCanvas 中播放精灵图集的序列帧动画。
 * 支持循环、单次播放、播放完成回调。
 */

import React, { useEffect, useRef } from 'react';
import { Image, rect, useImage } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { SpriteAtlas, SpriteFrame, AnimationState } from './types';

export interface SpriteAnimationProps {
    /** 精灵图集 */
    atlas: SpriteAtlas;
    /** 帧名称列表 */
    frameNames: string[];
    /** 每帧持续时间 (毫秒)，默认 100ms */
    frameDuration?: number;
    /** 是否循环，默认 true */
    loop?: boolean;
    /** 是否自动播放，默认 true */
    autoPlay?: boolean;
    /** 位置 X */
    x: number;
    /** 位置 Y */
    y: number;
    /** 宽度 (可选，默认使用帧原始尺寸) */
    width?: number;
    /** 高度 (可选，默认使用帧原始尺寸) */
    height?: number;
    /** 播放完成回调 (非循环动画) */
    onComplete?: () => void;
    /** 透明度 */
    opacity?: number;
}

export interface SpriteAnimationRef {
    /** 播放动画 */
    play: () => void;
    /** 暂停动画 */
    pause: () => void;
    /** 停止并重置到第一帧 */
    stop: () => void;
    /** 跳转到指定帧 */
    goToFrame: (frameIndex: number) => void;
    /** 获取当前帧索引 */
    getCurrentFrame: () => number;
    /** 是否正在播放 */
    isPlaying: () => boolean;
}

/**
 * SpriteAnimation 组件
 *
 * @example
 * ```tsx
 * <SpriteAnimation
 *   atlas={explosionAtlas}
 *   frameNames={['explosion_0', 'explosion_1', 'explosion_2']}
 *   frameDuration={100}
 *   loop={false}
 *   x={100}
 *   y={100}
 *   onComplete={() => console.log('Animation finished')}
 * />
 * ```
 */
export const SpriteAnimation = React.forwardRef<SpriteAnimationRef, SpriteAnimationProps>(
    (
        {
            atlas,
            frameNames,
            frameDuration = 100,
            loop = true,
            autoPlay = true,
            x,
            y,
            width,
            height,
            onComplete,
            opacity = 1,
        },
        ref
    ) => {
        // 动画状态
        const currentFrameIndex = useSharedValue(0);
        const elapsedTime = useSharedValue(0);
        const isPlaying = useSharedValue(autoPlay);
        const hasCompleted = useRef(false);

        // 获取帧数据
        const frames = frameNames
            .map((name) => atlas.frames.get(name))
            .filter((f): f is SpriteFrame => f !== undefined);

        if (frames.length === 0) {
            console.warn('SpriteAnimation: No valid frames found');
            return null;
        }

        // 计算默认尺寸
        const defaultWidth = frames[0].width;
        const defaultHeight = frames[0].height;
        const displayWidth = width ?? defaultWidth;
        const displayHeight = height ?? defaultHeight;

        // 动画更新 - 使用 requestAnimationFrame
        useEffect(() => {
            if (!isPlaying.value) {
                return;
            }

            let lastTime = performance.now();
            let animationFrameId: number;

            function animate(currentTime: number): void {
                const deltaTime = Math.min(currentTime - lastTime, 100);
                lastTime = currentTime;

                elapsedTime.value += deltaTime;

                if (elapsedTime.value >= frameDuration) {
                    elapsedTime.value = 0;
                    const nextFrame = currentFrameIndex.value + 1;

                    if (nextFrame >= frames.length) {
                        if (loop) {
                            currentFrameIndex.value = 0;
                        } else {
                            isPlaying.value = false;
                            currentFrameIndex.value = frames.length - 1;
                            if (!hasCompleted.current && onComplete) {
                                hasCompleted.current = true;
                                onComplete();
                            }
                            return;
                        }
                    } else {
                        currentFrameIndex.value = nextFrame;
                    }
                }

                animationFrameId = requestAnimationFrame(animate);
            }

            animationFrameId = requestAnimationFrame(animate);

            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            };
        }, [isPlaying.value, frameDuration, frames.length, loop, onComplete]);

        // 暴露方法
        React.useImperativeHandle(ref, () => ({
            play: () => {
                isPlaying.value = true;
                hasCompleted.current = false;
            },
            pause: () => {
                isPlaying.value = false;
            },
            stop: () => {
                isPlaying.value = false;
                currentFrameIndex.value = 0;
                elapsedTime.value = 0;
                hasCompleted.current = false;
            },
            goToFrame: (frameIndex: number) => {
                currentFrameIndex.value = Math.max(0, Math.min(frameIndex, frames.length - 1));
            },
            getCurrentFrame: () => currentFrameIndex.value,
            isPlaying: () => isPlaying.value,
        }));

        // 使用 useDerivedValue 获取当前帧
        const currentFrame = useDerivedValue(() => {
            const index = Math.floor(currentFrameIndex.value) % frames.length;
            return frames[index];
        });

        // 源矩形 (图集中的位置)
        const srcRect = useDerivedValue(() => {
            const frame = currentFrame.value;
            return rect(frame.x, frame.y, frame.width, frame.height);
        });

        // 目标矩形 (屏幕上的位置)
        const dstRect = useDerivedValue(() => {
            return rect(x, y, displayWidth, displayHeight);
        });

        return (
            <Image
                image={atlas.image}
                rect={srcRect}
                fit="fill"
                x={x}
                y={y}
                width={displayWidth}
                height={displayHeight}
                opacity={opacity}
            />
        );
    }
);

SpriteAnimation.displayName = 'SpriteAnimation';

/**
 * 创建帧名称数组的辅助函数
 *
 * @example
 * ```ts
 * // 生成 ['explosion_0', 'explosion_1', ..., 'explosion_9']
 * const frames = createFrameNames('explosion_', 10);
 * ```
 */
export function createFrameNames(prefix: string, count: number, startIndex = 0): string[] {
    return Array.from({ length: count }, (_, i) => `${prefix}${startIndex + i}`);
}

export default SpriteAnimation;
