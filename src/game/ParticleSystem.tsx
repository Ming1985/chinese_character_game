/**
 * ParticleSystem - 粒子系统
 *
 * 高性能粒子系统，用于爆炸、闪光等特效。
 * 粒子更新在 JS 线程进行，渲染使用 Skia。
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import type { Particle, ParticleEmitterConfig, ParticleShape } from './types';

export interface ParticleSystemProps {
    /** 是否激活 (为 true 时显示粒子) */
    active: boolean;
    /** 发射器配置 */
    config: ParticleEmitterConfig;
    /** 所有粒子消失后的回调 */
    onComplete?: () => void;
}

/**
 * 随机数生成器
 */
function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 创建星星路径
 */
function createStarPath(cx: number, cy: number, size: number, rotation: number = 0): string {
    const points = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    const path: string[] = [];

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2 + rotation;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        if (i === 0) {
            path.push(`M ${x} ${y}`);
        } else {
            path.push(`L ${x} ${y}`);
        }
    }
    path.push('Z');

    return path.join(' ');
}

/**
 * 创建粒子
 */
function createParticle(config: ParticleEmitterConfig): Particle {
    const angle = random(config.angle.min, config.angle.max);
    const speed = random(config.speed.min, config.speed.max);
    const life = random(config.life.min, config.life.max);

    return {
        x: config.x,
        y: config.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: random(config.size.min, config.size.max),
        color: randomChoice(config.colors),
        life,
        maxLife: life,
        opacity: 1,
        shape: config.shape || 'circle',
        rotation: random(0, Math.PI * 2),
    };
}

/**
 * 创建一批粒子
 */
function createParticles(config: ParticleEmitterConfig): Particle[] {
    return Array.from({ length: config.count }, () => createParticle(config));
}

/**
 * 更新粒子状态
 */
function updateParticle(particle: Particle, deltaTime: number, config: ParticleEmitterConfig): Particle | null {
    const dt = deltaTime / 1000; // 转换为秒

    let { x, y, vx, vy, life, maxLife } = particle;

    // 应用重力
    if (config.gravity) {
        vy += config.gravity * dt;
    }

    // 应用阻力
    if (config.drag) {
        vx *= 1 - config.drag * dt;
        vy *= 1 - config.drag * dt;
    }

    x += vx * dt;
    y += vy * dt;

    // 更新生命
    life -= deltaTime;

    if (life <= 0) {
        return null; // 粒子已死亡
    }

    // 计算透明度 (生命结束时淡出)
    const opacity = Math.max(0, life / maxLife);

    return {
        ...particle,
        x,
        y,
        vx,
        vy,
        life,
        opacity,
    };
}

/**
 * ParticleSystem 组件
 *
 * @example
 * ```tsx
 * <ParticleSystem
 *   active={showExplosion}
 *   config={{
 *     x: 100,
 *     y: 100,
 *     count: 50,
 *     speed: { min: 100, max: 300 },
 *     angle: { min: 0, max: Math.PI * 2 },
 *     size: { min: 3, max: 8 },
 *     life: { min: 300, max: 600 },
 *     colors: ['#FF6B35', '#FFD93D', '#FF4757'],
 *     gravity: 200,
 *     drag: 0.5,
 *   }}
 *   onComplete={() => setShowExplosion(false)}
 * />
 * ```
 */
export function ParticleSystem({ active, config, onComplete }: ParticleSystemProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const lastTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const hasEmittedRef = useRef(false);

    // 发射粒子
    useEffect(() => {
        if (active && !hasEmittedRef.current) {
            setParticles(createParticles(config));
            hasEmittedRef.current = true;
            lastTimeRef.current = performance.now();
        } else if (!active) {
            hasEmittedRef.current = false;
            setParticles([]);
        }
    }, [active, config]);

    // 动画循环
    useEffect(() => {
        if (!active || particles.length === 0) {
            return;
        }

        const animate = () => {
            const now = performance.now();
            const deltaTime = Math.min(now - lastTimeRef.current, 100); // 限制最大 deltaTime
            lastTimeRef.current = now;

            setParticles((prevParticles) => {
                const updated = prevParticles
                    .map((p) => updateParticle(p, deltaTime, config))
                    .filter((p): p is Particle => p !== null);

                // 所有粒子消失后触发回调
                if (updated.length === 0 && prevParticles.length > 0) {
                    onComplete?.();
                }

                return updated;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [active, particles.length, config, onComplete]);

    if (!active || particles.length === 0) {
        return null;
    }

    return (
        <Group>
            {particles.map((particle, index) => {
                if (particle.shape === 'star') {
                    const pathString = createStarPath(
                        particle.x,
                        particle.y,
                        particle.size,
                        particle.rotation || 0
                    );
                    const path = Skia.Path.MakeFromSVGString(pathString);
                    return path ? (
                        <Path
                            key={index}
                            path={path}
                            color={particle.color}
                            opacity={particle.opacity}
                        />
                    ) : null;
                } else {
                    return (
                        <Circle
                            key={index}
                            cx={particle.x}
                            cy={particle.y}
                            r={particle.size}
                            color={particle.color}
                            opacity={particle.opacity}
                        />
                    );
                }
            })}
        </Group>
    );
}

// ============ 预设配置 ============

/**
 * 火球爆炸预设配置
 */
export function createFireballExplosionConfig(x: number, y: number): ParticleEmitterConfig {
    return {
        x,
        y,
        count: 60,
        speed: { min: 150, max: 400 },
        angle: { min: 0, max: Math.PI * 2 },
        size: { min: 4, max: 12 },
        life: { min: 300, max: 600 },
        colors: ['#FF6B35', '#FFD93D', '#FF4757', '#FFA502', '#FF6348'],
        gravity: 300,
        drag: 2,
    };
}

/**
 * 命中闪光预设配置
 */
export function createHitFlashConfig(x: number, y: number): ParticleEmitterConfig {
    return {
        x,
        y,
        count: 20,
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: Math.PI * 2 },
        size: { min: 2, max: 6 },
        life: { min: 100, max: 300 },
        colors: ['#FFFFFF', '#FFFACD', '#FFE4B5'],
        gravity: 0,
        drag: 3,
    };
}

/**
 * 星星奖励预设配置
 */
export function createStarsRewardConfig(x: number, y: number): ParticleEmitterConfig {
    return {
        x,
        y,
        count: 30,
        speed: { min: 100, max: 250 },
        angle: { min: -Math.PI, max: 0 }, // 向上发射
        size: { min: 6, max: 12 },
        life: { min: 500, max: 1000 },
        colors: ['#FF0080', '#FF6B35', '#FFD700', '#00FF00', '#00BFFF', '#9B59B6'], // 彩虹色：粉红、橙、黄、绿、蓝、紫
        gravity: 150,
        drag: 1,
        shape: 'star',
    };
}

export default ParticleSystem;
