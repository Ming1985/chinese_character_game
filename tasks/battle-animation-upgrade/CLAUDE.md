# 战斗系统动画升级 (V3)

## 关键文件
@ROADMAP.md
@session.md

## 项目概述

将战斗画面从 emoji + 静态图升级为专业 2D 游戏动画。使用 DragonBones 骨骼动画 + Skia 渲染 + Leonardo.AI 生成美术资产。创建 battle-v3.tsx，保留 v2 备用。

## 技术栈

- **框架**: React Native + Expo SDK 54
- **渲染**: @shopify/react-native-skia 2.2.12
- **动画**: react-native-reanimated 4.1.1
- **骨骼**: DragonBones 5.x (自实现渲染器)
- **美术**: Leonardo.AI + TexturePacker

## 开发规范

### 代码规范
- TypeScript 严格模式
- 动画计算在 UI Thread (Worklet)
- 单个角色渲染 < 2ms
- 目标 60fps

### 文件结构
```
src/game/
  GameCanvas.tsx           # Skia 画布
  SpriteLoader.ts          # 图集加载
  SpriteAnimation.ts       # 序列帧
  ParticleSystem.ts        # 粒子系统
  dragonbones/
    types.ts               # 类型定义
    Parser.ts              # 数据解析
    Skeleton.ts            # 骨骼计算
    SkiaRenderer.ts        # 渲染器
  DragonBonesSprite.tsx    # 封装组件
```

### 提交规范
- 每个 User Story 完成后提交
- Commit message: `feat(US-xxx): 简要描述`
- 例: `feat(US-001): 创建 GameCanvas 组件`

## 工作流程

### Session 开始
读取 `tasks/battle-animation-upgrade/session.md` 了解当前状态，直接继续工作

### 开发中
- 完成任务 → 勾选 phase 文件 checkbox
- 遇到错误 → 记录到 phase 文件「遇到的问题」表
- 做决策 → 记录到 phase 文件「技术决策」表

### 保存进度
运行 `/checkpoint` 更新所有状态文件

### Phase 完成时
1. 完成「Phase 完成测试」清单
2. 测试通过后更新 ROADMAP.md

## 项目特定规则

### DragonBones 渲染器
- 实现标准功能：骨骼变换 + 动画混合 + 事件回调
- 不实现：IK、网格变形、物理引擎
- 参考 DragonBonesJS (Pixi.js) 移植

### 美术资产
- 风格：卡通 chibi，参考 Brawl Stars
- 格式：透明背景 PNG
- AI Prompt 模板:
  ```
  cute [color] [creature], chibi style, game sprite,
  transparent background, PNG, simple shapes,
  style of Brawl Stars, no text, high quality
  ```

### 性能要求
- 同时渲染 1英雄 + 3怪物 + 粒子，保持 60fps
- 资源预加载，避免战斗中卡顿
- iPad/iPhone 真机测试通过

### 不做的事情
- 不修改 battle-v2.tsx
- 不更改游戏核心玩法
- 不实现技能系统
- 不实现联网功能

## 验证方式

```bash
npx tsc --noEmit           # 类型检查
npm start                  # 按 i 打开 iOS 模拟器
# 进入 battle-v3 测试动画效果
```
