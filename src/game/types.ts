/**
 * 游戏模块类型定义
 */

import type { SkImage } from '@shopify/react-native-skia';

// ============ 精灵图集类型 ============

/** TexturePacker 导出的帧数据 */
export interface SpriteFrame {
    /** 帧名称 */
    name: string;
    /** 在图集中的 X 坐标 */
    x: number;
    /** 在图集中的 Y 坐标 */
    y: number;
    /** 帧宽度 */
    width: number;
    /** 帧高度 */
    height: number;
    /** 是否旋转 90 度 */
    rotated?: boolean;
    /** 是否被裁剪 */
    trimmed?: boolean;
    /** 原始尺寸 */
    sourceSize?: { w: number; h: number };
    /** 裁剪偏移 */
    spriteSourceSize?: { x: number; y: number; w: number; h: number };
}

/** TexturePacker JSON 格式 (Hash 格式) */
export interface TexturePackerJson {
    frames: Record<string, {
        frame: { x: number; y: number; w: number; h: number };
        rotated: boolean;
        trimmed: boolean;
        spriteSourceSize: { x: number; y: number; w: number; h: number };
        sourceSize: { w: number; h: number };
    }>;
    meta: {
        image: string;
        size: { w: number; h: number };
        scale: string;
    };
}

/** 加载后的精灵图集 */
export interface SpriteAtlas {
    /** Skia 图片对象 */
    image: SkImage;
    /** 帧数据映射 */
    frames: Map<string, SpriteFrame>;
    /** 图集尺寸 */
    size: { width: number; height: number };
}

// ============ 动画类型 ============

/** 序列帧动画配置 */
export interface SpriteAnimationConfig {
    /** 动画名称 */
    name: string;
    /** 帧名称列表 */
    frameNames: string[];
    /** 每帧持续时间 (毫秒) */
    frameDuration: number;
    /** 是否循环 */
    loop: boolean;
}

/** 动画播放状态 */
export interface AnimationState {
    /** 当前帧索引 */
    currentFrame: number;
    /** 当前帧已播放时间 */
    elapsedTime: number;
    /** 是否正在播放 */
    playing: boolean;
    /** 是否已完成 (非循环动画) */
    finished: boolean;
}

// ============ 粒子系统类型 ============

/** 粒子形状 */
export type ParticleShape = 'circle' | 'star';

/** 单个粒子 */
export interface Particle {
    /** 位置 X */
    x: number;
    /** 位置 Y */
    y: number;
    /** 速度 X */
    vx: number;
    /** 速度 Y */
    vy: number;
    /** 大小 */
    size: number;
    /** 颜色 */
    color: string;
    /** 剩余生命 (毫秒) */
    life: number;
    /** 初始生命 (用于计算透明度) */
    maxLife: number;
    /** 透明度 */
    opacity: number;
    /** 形状 */
    shape: ParticleShape;
    /** 旋转角度 (弧度) */
    rotation?: number;
}

/** 粒子发射器配置 */
export interface ParticleEmitterConfig {
    /** 发射位置 X */
    x: number;
    /** 发射位置 Y */
    y: number;
    /** 粒子数量 */
    count: number;
    /** 速度范围 */
    speed: { min: number; max: number };
    /** 发射角度范围 (弧度) */
    angle: { min: number; max: number };
    /** 粒子大小范围 */
    size: { min: number; max: number };
    /** 生命周期范围 (毫秒) */
    life: { min: number; max: number };
    /** 颜色列表 (随机选择) */
    colors: string[];
    /** 重力 (Y 方向加速度) */
    gravity?: number;
    /** 阻力系数 (0-1) */
    drag?: number;
    /** 粒子形状 (默认 circle) */
    shape?: ParticleShape;
}

// ============ 通用类型 ============

/** 2D 向量 */
export interface Vector2 {
    x: number;
    y: number;
}

/** 矩形区域 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
