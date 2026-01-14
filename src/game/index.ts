/**
 * 游戏模块导出
 */

// 组件
export { GameCanvas } from './GameCanvas';
export type { GameCanvasProps, GameCanvasRef } from './GameCanvas';

export { SpriteAnimation, createFrameNames } from './SpriteAnimation';
export type { SpriteAnimationProps, SpriteAnimationRef } from './SpriteAnimation';

export {
    ParticleSystem,
    createFireballExplosionConfig,
    createHitFlashConfig,
    createStarsRewardConfig,
} from './ParticleSystem';
export type { ParticleSystemProps } from './ParticleSystem';

// 工具函数
export {
    loadSpriteAtlas,
    getFrame,
    getFramesByPrefix,
    clearAtlasCache,
    preloadAtlases,
} from './SpriteLoader';

// 类型
export type {
    SpriteFrame,
    SpriteAtlas,
    TexturePackerJson,
    SpriteAnimationConfig,
    AnimationState,
    Particle,
    ParticleEmitterConfig,
    Vector2,
    Rect,
} from './types';
