/**
 * DragonBones 骨骼动画系统
 * 负责骨骼变换计算、动画播放和混合
 */

import type {
    DragonBonesAsset,
    ArmatureData,
    Bone,
    Slot,
    AnimationState,
    Armature,
    Transform,
    BoneData,
    AnimationData,
    BoneTimelineData,
    TransformFrameData,
    AnimationEvent,
    AnimationEventHandler,
    ColorTransform,
} from './types';

/**
 * 创建默认变换
 */
function createDefaultTransform(): Transform {
    return {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
    };
}

/**
 * 创建默认颜色变换
 */
function createDefaultColorTransform(): ColorTransform {
    return {
        alphaMultiplier: 1,
        redMultiplier: 1,
        greenMultiplier: 1,
        blueMultiplier: 1,
        alphaOffset: 0,
        redOffset: 0,
        greenOffset: 0,
        blueOffset: 0,
    };
}

/**
 * 复制变换
 */
function copyTransform(source: Transform): Transform {
    return { ...source };
}

/**
 * 合成父子变换
 */
function composeTransform(parent: Transform, local: Transform): Transform {
    const cos = Math.cos(parent.rotation);
    const sin = Math.sin(parent.rotation);

    return {
        x: parent.x + (local.x * cos - local.y * sin) * parent.scaleX,
        y: parent.y + (local.x * sin + local.y * cos) * parent.scaleY,
        scaleX: parent.scaleX * local.scaleX,
        scaleY: parent.scaleY * local.scaleY,
        rotation: parent.rotation + local.rotation,
    };
}

/**
 * 线性插值变换
 */
function lerpTransform(a: Transform, b: Transform, t: number): Transform {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        scaleX: a.scaleX + (b.scaleX - a.scaleX) * t,
        scaleY: a.scaleY + (b.scaleY - a.scaleY) * t,
        rotation: a.rotation + (b.rotation - a.rotation) * t,
    };
}

/**
 * 缓动函数
 */
function applyEasing(t: number, easing: number | null | undefined): number {
    if (easing === null || easing === undefined) {
        return t;
    }

    // DragonBones 缓动值：
    // null = 线性
    // 0 = 阶跃
    // 其他 = 缓动曲线
    if (easing === 0) {
        return t < 1 ? 0 : 1;
    }

    // 简化的缓动实现
    if (easing > 0) {
        return Math.pow(t, easing + 1);
    } else {
        return 1 - Math.pow(1 - t, -easing + 1);
    }
}

/**
 * 创建骨骼实例
 */
function createBone(data: BoneData, parent: Bone | null): Bone {
    return {
        name: data.name,
        parent,
        data,
        transform: copyTransform(data.transform),
        worldTransform: createDefaultTransform(),
        children: [],
    };
}

/**
 * 创建插槽实例
 */
function createSlot(slotData: any, parentBone: Bone): Slot {
    return {
        name: slotData.name,
        parent: parentBone,
        data: slotData,
        displayIndex: slotData.displayIndex ?? 0,
        color: slotData.color ?? createDefaultColorTransform(),
        zOrder: slotData.zOrder ?? 0,
        currentTextureName: null,
    };
}

/**
 * 骨架类
 */
export class DragonBonesSkeleton {
    private asset: DragonBonesAsset;
    private armature: Armature;
    private eventHandlers: AnimationEventHandler[] = [];
    private lastUpdateTime: number = 0;

    constructor(asset: DragonBonesAsset, armatureName?: string) {
        this.asset = asset;

        // 查找骨架数据
        const armatureData = armatureName
            ? asset.data.armature.find((a) => a.name === armatureName)
            : asset.data.armature[0];

        if (!armatureData) {
            throw new Error(`Armature not found: ${armatureName}`);
        }

        // 构建骨骼树
        const bones = new Map<string, Bone>();
        const rootBones: Bone[] = [];

        // 第一遍：创建所有骨骼
        armatureData.bones.forEach((boneData) => {
            const bone = createBone(boneData, null);
            bones.set(boneData.name, bone);
        });

        // 第二遍：建立父子关系
        armatureData.bones.forEach((boneData) => {
            const bone = bones.get(boneData.name)!;
            if (boneData.parent) {
                const parent = bones.get(boneData.parent);
                if (parent) {
                    bone.parent = parent;
                    parent.children.push(bone);
                }
            } else {
                rootBones.push(bone);
            }
        });

        // 创建插槽
        const slots: Slot[] = armatureData.slots.map((slotData) => {
            const parentBone = bones.get(slotData.parent);
            if (!parentBone) {
                throw new Error(`Slot parent bone not found: ${slotData.parent}`);
            }
            return createSlot(slotData, parentBone);
        });

        // 按 z-order 排序插槽
        slots.sort((a, b) => a.zOrder - b.zOrder);

        // 创建动画映射
        const animations = new Map<string, AnimationData>();
        Object.entries(armatureData.animations).forEach(([name, data]) => {
            animations.set(name, data);
        });

        this.armature = {
            name: armatureData.name,
            data: armatureData,
            bones,
            slots,
            animations,
            currentAnimation: null,
            frameRate: asset.data.frameRate,
        };

        // 初始化世界变换
        rootBones.forEach((bone) => this.updateBoneTransform(bone));
    }

    /**
     * 递归更新骨骼世界变换
     */
    private updateBoneTransform(bone: Bone): void {
        if (bone.parent) {
            bone.worldTransform = composeTransform(bone.parent.worldTransform, bone.transform);
        } else {
            bone.worldTransform = copyTransform(bone.transform);
        }

        bone.children.forEach((child) => this.updateBoneTransform(child));
    }

    /**
     * 播放动画
     */
    play(animationName: string, loop: boolean = true): void {
        const animData = this.armature.animations.get(animationName);
        if (!animData) {
            console.warn(`Animation not found: ${animationName}`);
            return;
        }

        this.armature.currentAnimation = {
            name: animationName,
            data: animData,
            currentTime: 0,
            timeScale: 1,
            isLooping: loop,
            isPlaying: true,
            weight: 1,
        };

        this.lastUpdateTime = performance.now();
        this.emitEvent({ type: 'start', animationName });
    }

    /**
     * 停止动画
     */
    stop(): void {
        if (this.armature.currentAnimation) {
            this.armature.currentAnimation.isPlaying = false;
            this.armature.currentAnimation = null;
        }
    }

    /**
     * 暂停/继续
     */
    setPaused(paused: boolean): void {
        if (this.armature.currentAnimation) {
            this.armature.currentAnimation.isPlaying = !paused;
        }
    }

    /**
     * 更新动画（每帧调用）
     */
    update(deltaTime: number): void {
        const anim = this.armature.currentAnimation;
        if (!anim || !anim.isPlaying) {
            return;
        }

        // 更新时间
        anim.currentTime += (deltaTime / 1000) * anim.timeScale;

        const duration = anim.data.duration / this.armature.frameRate;

        // 检查循环
        if (anim.currentTime >= duration) {
            if (anim.isLooping) {
                anim.currentTime = anim.currentTime % duration;
                this.emitEvent({ type: 'loop', animationName: anim.name });
            } else {
                anim.currentTime = duration;
                anim.isPlaying = false;
                this.emitEvent({ type: 'complete', animationName: anim.name });
            }
        }

        // 应用骨骼动画
        this.applyBoneAnimation(anim);

        // 更新世界变换
        this.armature.bones.forEach((bone) => {
            if (!bone.parent) {
                this.updateBoneTransform(bone);
            }
        });
    }

    /**
     * 应用骨骼动画
     */
    private applyBoneAnimation(anim: AnimationState): void {
        if (!anim.data.bone) {
            return;
        }

        const frameTime = anim.currentTime * this.armature.frameRate;

        Object.entries(anim.data.bone).forEach(([boneName, timeline]) => {
            const bone = this.armature.bones.get(boneName);
            if (!bone) {
                return;
            }

            // 应用平移
            if (timeline.translateFrame) {
                const frame = this.findFrame(timeline.translateFrame, frameTime);
                if (frame) {
                    bone.transform.x = bone.data.transform.x + (frame.x ?? 0);
                    bone.transform.y = bone.data.transform.y + (frame.y ?? 0);
                }
            }

            // 应用旋转
            if (timeline.rotateFrame) {
                const frame = this.findFrame(timeline.rotateFrame, frameTime);
                if (frame) {
                    bone.transform.rotation = bone.data.transform.rotation + (frame.value ?? 0);
                }
            }

            // 应用缩放
            if (timeline.scaleFrame) {
                const frame = this.findFrame(timeline.scaleFrame, frameTime);
                if (frame) {
                    bone.transform.scaleX = bone.data.transform.scaleX * (frame.value ?? 1);
                    bone.transform.scaleY = bone.data.transform.scaleY * (frame.value ?? 1);
                }
            }
        });
    }

    /**
     * 查找当前帧
     */
    private findFrame(frames: TransformFrameData[], time: number): TransformFrameData | null {
        if (frames.length === 0) {
            return null;
        }

        let frameIndex = 0;
        let currentTime = 0;

        for (let i = 0; i < frames.length; i++) {
            if (currentTime <= time && time < currentTime + frames[i].duration) {
                frameIndex = i;
                break;
            }
            currentTime += frames[i].duration;
        }

        return frames[frameIndex];
    }

    /**
     * 获取骨架数据
     */
    getArmature(): Armature {
        return this.armature;
    }

    /**
     * 获取纹理图集
     */
    getTextureAtlas() {
        return this.asset.textureAtlas;
    }

    /**
     * 获取纹理图片
     */
    getTextureImage() {
        return this.asset.textureImage;
    }

    /**
     * 添加事件监听
     */
    addEventListener(handler: AnimationEventHandler): void {
        this.eventHandlers.push(handler);
    }

    /**
     * 移除事件监听
     */
    removeEventListener(handler: AnimationEventHandler): void {
        const index = this.eventHandlers.indexOf(handler);
        if (index !== -1) {
            this.eventHandlers.splice(index, 1);
        }
    }

    /**
     * 触发事件
     */
    private emitEvent(event: AnimationEvent): void {
        this.eventHandlers.forEach((handler) => handler(event));
    }
}
