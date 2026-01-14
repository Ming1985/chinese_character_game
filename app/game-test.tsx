/**
 * 游戏动画测试页面
 *
 * 用于验证 Phase 1 的 Skia 渲染框架功能。
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Circle, Rect as SkiaRect, Group } from '@shopify/react-native-skia';
import { router } from 'expo-router';
import {
    GameCanvas,
    ParticleSystem,
    createFireballExplosionConfig,
    createHitFlashConfig,
    createStarsRewardConfig,
} from '../src/game';

export default function GameTestScreen() {
    const [fps, setFps] = useState(0);
    const [frameCount, setFrameCount] = useState(0);

    // 粒子系统状态
    const [showFireball, setShowFireball] = useState(false);
    const [showHitFlash, setShowHitFlash] = useState(false);
    const [showStars, setShowStars] = useState(false);
    const [explosionPos, setExplosionPos] = useState({ x: 200, y: 300 });

    // FPS 计算
    const lastFpsTimeRef = React.useRef(performance.now());
    const fpsFrameCountRef = React.useRef(0);

    const handleUpdate = useCallback((deltaTime: number) => {
        fpsFrameCountRef.current++;
        setFrameCount((c) => c + 1);

        const now = performance.now();
        if (now - lastFpsTimeRef.current >= 1000) {
            setFps(fpsFrameCountRef.current);
            fpsFrameCountRef.current = 0;
            lastFpsTimeRef.current = now;
        }
    }, []);

    // 触发火球爆炸
    const triggerFireball = () => {
        const x = 100 + Math.random() * 200;
        const y = 200 + Math.random() * 200;
        setExplosionPos({ x, y });
        setShowFireball(true);
    };

    // 触发命中闪光
    const triggerHitFlash = () => {
        const x = 100 + Math.random() * 200;
        const y = 200 + Math.random() * 200;
        setExplosionPos({ x, y });
        setShowHitFlash(true);
    };

    // 触发星星奖励
    const triggerStars = () => {
        const x = 100 + Math.random() * 200;
        const y = 200 + Math.random() * 200;
        setExplosionPos({ x, y });
        setShowStars(true);
    };

    return (
        <View style={styles.container}>
            {/* 返回按钮 */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>← 返回</Text>
            </TouchableOpacity>

            {/* FPS 显示 */}
            <View style={styles.fpsContainer}>
                <Text style={styles.fpsText}>FPS: {fps}</Text>
                <Text style={styles.frameText}>Frames: {frameCount}</Text>
            </View>

            {/* Skia 游戏画布 */}
            <View style={styles.canvasContainer}>
                <GameCanvas onUpdate={handleUpdate}>
                    {/* 背景网格 */}
                    <SkiaRect x={0} y={0} width={400} height={600} color="#1a1a2e" />

                    {/* 测试圆形 */}
                    <Circle cx={200} cy={300} r={30} color="#e94560" />

                    {/* 粒子系统 */}
                    <ParticleSystem
                        active={showFireball}
                        config={createFireballExplosionConfig(explosionPos.x, explosionPos.y)}
                        onComplete={() => setShowFireball(false)}
                    />
                    <ParticleSystem
                        active={showHitFlash}
                        config={createHitFlashConfig(explosionPos.x, explosionPos.y)}
                        onComplete={() => setShowHitFlash(false)}
                    />
                    <ParticleSystem
                        active={showStars}
                        config={createStarsRewardConfig(explosionPos.x, explosionPos.y)}
                        onComplete={() => setShowStars(false)}
                    />
                </GameCanvas>
            </View>

            {/* 控制按钮 */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={[styles.button, styles.fireballButton]} onPress={triggerFireball}>
                    <Text style={styles.buttonText}>火球爆炸</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.hitButton]} onPress={triggerHitFlash}>
                    <Text style={styles.buttonText}>命中闪光</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.starsButton]} onPress={triggerStars}>
                    <Text style={styles.buttonText}>星星奖励</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    backText: {
        color: '#fff',
        fontSize: 18,
    },
    fpsContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        alignItems: 'flex-end',
    },
    fpsText: {
        color: '#00ff00',
        fontSize: 16,
        fontWeight: 'bold',
    },
    frameText: {
        color: '#888',
        fontSize: 12,
    },
    canvasContainer: {
        flex: 1,
        marginTop: 100,
        marginBottom: 150,
        marginHorizontal: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    fireballButton: {
        backgroundColor: '#FF6B35',
    },
    hitButton: {
        backgroundColor: '#FFFFFF',
    },
    starsButton: {
        backgroundColor: '#FFD700',
    },
    buttonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
});
