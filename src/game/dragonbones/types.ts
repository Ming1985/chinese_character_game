/**
 * DragonBones 数据格式类型定义
 * 基于 DragonBones 5.x 格式规范
 */

import type { SkImage } from '@shopify/react-native-skia';

// ============ 基础类型 ============

/** 2D 变换矩阵 */
export interface Transform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number; // 弧度
}

/** 颜色变换 */
export interface ColorTransform {
    alphaMultiplier: number;
    redMultiplier: number;
    greenMultiplier: number;
    blueMultiplier: number;
    alphaOffset: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
}

// ============ 骨骼数据 ============

/** 单个骨骼定义 */
export interface BoneData {
    name: string;
    parent?: string;
    transform: Transform;
    length?: number;
}

/** 骨架数据 */
export interface ArmatureData {
    name: string;
    bones: BoneData[];
    slots: SlotData[];
    skins: SkinData[];
    animations: Record<string, AnimationData>;
    defaultActions?: ActionData[];
}

// ============ 插槽和皮肤 ============

/** 插槽数据 */
export interface SlotData {
    name: string;
    parent: string; // 所属骨骼名称
    displayIndex?: number;
    color?: ColorTransform;
    zOrder?: number;
}

/** 皮肤数据 */
export interface SkinData {
    name: string;
    slots: Record<string, SlotDisplayData[]>;
}

/** 插槽显示数据 */
export interface SlotDisplayData {
    type: 'image' | 'mesh' | 'armature';
    name: string;
    transform?: Transform;
    width?: number;
    height?: number;
    path?: string; // 纹理路径
}

// ============ 动画数据 ============

/** 动画数据 */
export interface AnimationData {
    name: string;
    duration: number; // 总时长（帧数）
    playTimes: number; // 播放次数，0=无限循环
    fadeInTime?: number;
    bone?: Record<string, BoneTimelineData>;
    slot?: Record<string, SlotTimelineData>;
    events?: EventFrameData[];
}

/** 骨骼时间轴 */
export interface BoneTimelineData {
    translateFrame?: TransformFrameData[];
    rotateFrame?: TransformFrameData[];
    scaleFrame?: TransformFrameData[];
}

/** 插槽时间轴 */
export interface SlotTimelineData {
    displayFrame?: DisplayFrameData[];
    colorFrame?: ColorFrameData[];
}

/** 变换关键帧 */
export interface TransformFrameData {
    duration: number;
    tweenEasing?: number | null; // null=无缓动，数值=缓动曲线
    value?: number; // 旋转角度或缩放值
    x?: number;
    y?: number;
    curve?: number[]; // 贝塞尔曲线控制点
}

/** 显示关键帧 */
export interface DisplayFrameData {
    duration: number;
    value: number; // displayIndex
}

/** 颜色关键帧 */
export interface ColorFrameData {
    duration: number;
    tweenEasing?: number | null;
    color?: ColorTransform;
}

/** 事件帧 */
export interface EventFrameData {
    name: string;
    frame: number;
    data?: any;
}

/** 动作数据 */
export interface ActionData {
    type: number;
    name: string;
}

// ============ DragonBones 文件格式 ============

/** _ske.json 文件格式 */
export interface DragonBonesData {
    name: string;
    version: string;
    compatibleVersion?: string;
    frameRate: number;
    armature: ArmatureData[];
}

/** _tex.json 文件格式（TexturePacker 格式）*/
export interface TextureAtlasData {
    name: string;
    imagePath: string;
    width: number;
    height: number;
    SubTexture: SubTextureData[];
}

/** 子纹理数据 */
export interface SubTextureData {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    frameX?: number;
    frameY?: number;
    frameWidth?: number;
    frameHeight?: number;
}

// ============ 运行时数据 ============

/** 骨骼运行时实例 */
export interface Bone {
    name: string;
    parent: Bone | null;
    data: BoneData;
    /** 局部变换 */
    transform: Transform;
    /** 世界变换（合成父级变换后的结果）*/
    worldTransform: Transform;
    children: Bone[];
}

/** 插槽运行时实例 */
export interface Slot {
    name: string;
    parent: Bone;
    data: SlotData;
    displayIndex: number;
    color: ColorTransform;
    zOrder: number;
    /** 当前显示的纹理名称 */
    currentTextureName: string | null;
}

/** 动画状态 */
export interface AnimationState {
    name: string;
    data: AnimationData;
    /** 当前播放时间（秒）*/
    currentTime: number;
    /** 播放速度倍数 */
    timeScale: number;
    /** 是否循环 */
    isLooping: boolean;
    /** 是否正在播放 */
    isPlaying: boolean;
    /** 混合权重 (0-1) */
    weight: number;
}

/** 骨架运行时实例 */
export interface Armature {
    name: string;
    data: ArmatureData;
    bones: Map<string, Bone>;
    slots: Slot[];
    animations: Map<string, AnimationData>;
    currentAnimation: AnimationState | null;
    frameRate: number;
}

/** DragonBones 资源包 */
export interface DragonBonesAsset {
    /** 骨架数据 */
    data: DragonBonesData;
    /** 纹理图集 */
    textureAtlas: TextureAtlasData;
    /** Skia 纹理图片 */
    textureImage: SkImage;
}

// ============ 事件类型 ============

export interface AnimationEvent {
    type: 'start' | 'complete' | 'loop' | 'frame';
    animationName: string;
    eventName?: string;
    data?: any;
}

export type AnimationEventHandler = (event: AnimationEvent) => void;
