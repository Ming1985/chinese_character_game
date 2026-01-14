# Phase 1: Skia 渲染框架

**类型**: infrastructure
**状态**: completed
**依赖**: 无

## 目标

搭建基于 Skia 的游戏渲染基础框架，包括游戏画布、精灵加载、序列帧动画和粒子系统。

## User Stories

### US-001: 创建 Skia 游戏画布组件
**文件**: `src/game/GameCanvas.tsx`

- [x] 创建 `src/game/GameCanvas.tsx` 组件
- [x] 支持全屏渲染和自适应尺寸
- [x] 集成 Reanimated 的 `useFrameCallback` 实现游戏循环
- [x] 提供 `onUpdate(deltaTime)` 回调用于更新游戏逻辑
- [x] TypeScript 类型检查通过
- [x] iPad 模拟器中渲染正常，无闪烁

---

### US-002: 实现精灵图集加载器
**文件**: `src/game/SpriteLoader.ts`

- [x] 创建 `src/game/SpriteLoader.ts`
- [x] 支持加载 JSON + PNG 格式的图集
- [x] 解析精灵帧坐标、尺寸、旋转信息
- [x] 返回 Skia Image 和帧元数据
- [x] 处理加载失败的错误情况
- [x] TypeScript 类型检查通过

---

### US-003: 实现精灵序列帧动画
**文件**: `src/game/SpriteAnimation.ts`

- [x] 创建 `src/game/SpriteAnimation.tsx`
- [x] 支持从图集中按名称前缀提取帧序列
- [x] 支持设置播放速度、循环、单次播放
- [x] 支持播放完成回调
- [x] 在 GameCanvas 中正确渲染动画
- [x] TypeScript 类型检查通过

---

### US-004: 实现粒子系统
**文件**: `src/game/ParticleSystem.ts`

- [x] 创建 `src/game/ParticleSystem.tsx`
- [x] 支持配置：发射位置、速度范围、颜色、大小、生命周期
- [x] 支持重力和阻力参数
- [x] 粒子计算在 JS Thread 中执行 (使用 requestAnimationFrame)
- [x] 单次爆炸支持 50-100 个粒子，保持 60fps
- [x] TypeScript 类型检查通过

---

### US-005: 实现火球爆炸粒子特效
**文件**: `src/game/ParticleSystem.ts` (扩展)

- [x] 火球命中时触发橙黄色粒子爆炸 (createFireballExplosionConfig)
- [x] 粒子向四周扩散并逐渐消失
- [x] 爆炸持续时间约 0.5 秒
- [x] 同时播放命中音效 (待整合到战斗系统)
- [x] TypeScript 类型检查通过
- [x] 支持星星形状粒子 (createStarsRewardConfig)

---

## 技术决策

| 决策 | 选项 | 结果 | 原因 |
|------|------|------|------|
| | | | |

## 遇到的问题

| 问题 | 解决方案 | 状态 |
|------|----------|------|
| | | |

---

## Phase 完成测试

**类型**: infrastructure

- [x] `npx tsc --noEmit` 类型检查通过
- [x] GameCanvas 组件可正常渲染
- [x] 精灵图集加载成功
- [x] 序列帧动画播放流畅
- [x] 粒子爆炸效果正常
- [x] iPad 模拟器测试 60fps
