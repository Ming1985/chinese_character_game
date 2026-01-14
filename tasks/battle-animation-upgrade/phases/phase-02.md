# Phase 2: DragonBones 渲染器

**类型**: infrastructure
**状态**: pending
**依赖**: Phase 1 (GameCanvas)

## 目标

实现 DragonBones 骨骼动画的解析和 Skia 渲染，支持动画混合和事件回调。

## User Stories

### US-006: 解析 DragonBones 数据格式
**文件**: `src/game/dragonbones/Parser.ts`, `src/game/dragonbones/types.ts`

- [ ] 创建 `src/game/dragonbones/Parser.ts`
- [ ] 解析 `_ske.json` 骨骼数据（骨骼树、动画关键帧）
- [ ] 解析 `_tex.json` 纹理图集元数据
- [ ] 加载对应的 `_tex.png` 纹理图片
- [ ] 定义完整的 TypeScript 类型 (`src/game/dragonbones/types.ts`)
- [ ] 处理格式错误的异常情况
- [ ] TypeScript 类型检查通过

---

### US-007: 实现骨骼变换计算
**文件**: `src/game/dragonbones/Skeleton.ts`

- [ ] 创建 `src/game/dragonbones/Skeleton.ts`
- [ ] 实现骨骼树结构和父子变换链
- [ ] 实现关键帧线性插值
- [ ] 实现贝塞尔曲线插值（用于平滑动画）
- [ ] 支持动画播放控制（play, pause, stop, setTime）
- [ ] TypeScript 类型检查通过

---

### US-008: 实现动画混合
**文件**: `src/game/dragonbones/Skeleton.ts` (扩展)

- [ ] 在 `Skeleton.ts` 中添加 `crossFade(animationName, duration)` 方法
- [ ] 过渡期间两个动画的骨骼变换按权重混合
- [ ] 支持设置过渡时长（默认 0.2 秒）
- [ ] 过渡完成后自动切换到新动画
- [ ] TypeScript 类型检查通过

---

### US-009: 实现动画事件回调
**文件**: `src/game/dragonbones/Skeleton.ts` (扩展)

- [ ] 支持在 DragonBones 编辑器中定义事件帧
- [ ] 解析器正确读取事件数据
- [ ] 播放时在对应帧触发 `onEvent(eventName, data)` 回调
- [ ] 支持注册多个事件监听器
- [ ] TypeScript 类型检查通过

---

### US-010: 实现 Skia 骨骼渲染器
**文件**: `src/game/dragonbones/SkiaRenderer.ts`

- [ ] 创建 `src/game/dragonbones/SkiaRenderer.ts`
- [ ] 根据骨骼变换矩阵绘制对应的纹理区域
- [ ] 支持骨骼的缩放、旋转、透明度
- [ ] 按正确的 z-order 绘制骨骼
- [ ] 单个角色渲染性能 < 2ms
- [ ] TypeScript 类型检查通过

---

### US-011: 创建 DragonBones 动画组件
**文件**: `src/game/DragonBonesSprite.tsx`

- [ ] 创建 `src/game/DragonBonesSprite.tsx`
- [ ] Props: `dataUrl`, `textureUrl`, `animation`, `scale`, `position`
- [ ] 支持 `ref` 获取动画控制方法
- [ ] 自动加载资源并显示加载状态
- [ ] 支持动画完成回调 `onComplete`
- [ ] TypeScript 类型检查通过

---

## 参考资源

- [DragonBonesJS (Pixi.js)](https://github.com/DragonBones/DragonBonesJS) - 移植参考
- [DragonBones 数据格式文档](https://docs.egret.com/dragonbones/docs/dbPro/create/dataFormat)

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

- [ ] `npx tsc --noEmit` 类型检查通过
- [ ] 可加载测试用 DragonBones 导出文件
- [ ] 骨骼动画正确播放
- [ ] 动画切换过渡平滑
- [ ] 事件回调正确触发
- [ ] 单角色渲染 < 2ms
- [ ] DragonBonesSprite 组件可在 GameCanvas 中使用
