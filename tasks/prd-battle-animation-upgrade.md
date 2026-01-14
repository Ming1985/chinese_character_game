# PRD: 战斗系统动画升级 (V3)

## Introduction

将战斗画面从"emoji + 静态图片"升级为专业的 2D 游戏动画效果，达到类似 Brawl Stars / 植物大战僵尸的卡通风格。使用 DragonBones 骨骼动画 + React Native Skia 渲染 + Leonardo.AI 生成美术资产。

创建全新的 `battle-v3.tsx`，保留现有 v2 版本作为备用回退方案。

## Goals

- 建立基于 Skia 的游戏渲染框架，支持精灵、粒子、骨骼动画
- 实现 DragonBones 骨骼动画渲染器（标准功能：动画混合 + 事件回调）
- 使用 Leonardo.AI 生成统一卡通风格的美术资产
- 完成 1 个英雄 + 3 个怪物 + 1 个 Boss 的完整动画
- 保持 iPad 上 60fps 流畅运行

## User Stories

### US-001: 创建 Skia 游戏画布组件
**Description:** 作为开发者，我需要一个基于 Skia 的游戏画布组件，作为所有游戏渲染的基础容器。

**Acceptance Criteria:**
- [ ] 创建 `src/game/GameCanvas.tsx` 组件
- [ ] 支持全屏渲染和自适应尺寸
- [ ] 集成 Reanimated 的 `useFrameCallback` 实现游戏循环
- [ ] 提供 `onUpdate(deltaTime)` 回调用于更新游戏逻辑
- [ ] TypeScript 类型检查通过
- [ ] iPad 模拟器中渲染正常，无闪烁

---

### US-002: 实现精灵图集加载器
**Description:** 作为开发者，我需要加载 TexturePacker 导出的精灵图集，以便高效渲染多个精灵。

**Acceptance Criteria:**
- [ ] 创建 `src/game/SpriteLoader.ts`
- [ ] 支持加载 JSON + PNG 格式的图集
- [ ] 解析精灵帧坐标、尺寸、旋转信息
- [ ] 返回 Skia Image 和帧元数据
- [ ] 处理加载失败的错误情况
- [ ] TypeScript 类型检查通过

---

### US-003: 实现精灵序列帧动画
**Description:** 作为开发者，我需要播放精灵序列帧动画，用于简单的特效（火球、爆炸等）。

**Acceptance Criteria:**
- [ ] 创建 `src/game/SpriteAnimation.ts`
- [ ] 支持从图集中按名称前缀提取帧序列
- [ ] 支持设置播放速度、循环、单次播放
- [ ] 支持播放完成回调
- [ ] 在 GameCanvas 中正确渲染动画
- [ ] TypeScript 类型检查通过

---

### US-004: 实现粒子系统
**Description:** 作为开发者，我需要一个粒子系统来实现爆炸、命中闪光等特效。

**Acceptance Criteria:**
- [ ] 创建 `src/game/ParticleSystem.ts`
- [ ] 支持配置：发射位置、速度范围、颜色、大小、生命周期
- [ ] 支持重力和阻力参数
- [ ] 粒子计算在 UI Thread (Worklet) 中执行
- [ ] 单次爆炸支持 50-100 个粒子，保持 60fps
- [ ] TypeScript 类型检查通过

---

### US-005: 实现火球爆炸粒子特效
**Description:** 作为玩家，我希望火球命中怪物时有明显的爆炸特效，增强打击感。

**Acceptance Criteria:**
- [ ] 火球命中时触发橙黄色粒子爆炸
- [ ] 粒子向四周扩散并逐渐消失
- [ ] 爆炸持续时间约 0.5 秒
- [ ] 同时播放命中音效
- [ ] TypeScript 类型检查通过

---

### US-006: 解析 DragonBones 数据格式
**Description:** 作为开发者，我需要解析 DragonBones 导出的骨骼动画数据。

**Acceptance Criteria:**
- [ ] 创建 `src/game/dragonbones/Parser.ts`
- [ ] 解析 `_ske.json` 骨骼数据（骨骼树、动画关键帧）
- [ ] 解析 `_tex.json` 纹理图集元数据
- [ ] 加载对应的 `_tex.png` 纹理图片
- [ ] 定义完整的 TypeScript 类型 (`src/game/dragonbones/types.ts`)
- [ ] 处理格式错误的异常情况
- [ ] TypeScript 类型检查通过

---

### US-007: 实现骨骼变换计算
**Description:** 作为开发者，我需要根据动画数据计算每帧的骨骼变换矩阵。

**Acceptance Criteria:**
- [ ] 创建 `src/game/dragonbones/Skeleton.ts`
- [ ] 实现骨骼树结构和父子变换链
- [ ] 实现关键帧线性插值
- [ ] 实现贝塞尔曲线插值（用于平滑动画）
- [ ] 支持动画播放控制（play, pause, stop, setTime）
- [ ] TypeScript 类型检查通过

---

### US-008: 实现动画混合
**Description:** 作为开发者，我需要在不同动画之间平滑过渡（如从 idle 切换到 attack）。

**Acceptance Criteria:**
- [ ] 在 `Skeleton.ts` 中添加 `crossFade(animationName, duration)` 方法
- [ ] 过渡期间两个动画的骨骼变换按权重混合
- [ ] 支持设置过渡时长（默认 0.2 秒）
- [ ] 过渡完成后自动切换到新动画
- [ ] TypeScript 类型检查通过

---

### US-009: 实现动画事件回调
**Description:** 作为开发者，我需要在动画特定帧触发事件（如攻击动画的命中帧）。

**Acceptance Criteria:**
- [ ] 支持在 DragonBones 编辑器中定义事件帧
- [ ] 解析器正确读取事件数据
- [ ] 播放时在对应帧触发 `onEvent(eventName, data)` 回调
- [ ] 支持注册多个事件监听器
- [ ] TypeScript 类型检查通过

---

### US-010: 实现 Skia 骨骼渲染器
**Description:** 作为开发者，我需要将骨骼动画渲染到 Skia Canvas 上。

**Acceptance Criteria:**
- [ ] 创建 `src/game/dragonbones/SkiaRenderer.ts`
- [ ] 根据骨骼变换矩阵绘制对应的纹理区域
- [ ] 支持骨骼的缩放、旋转、透明度
- [ ] 按正确的 z-order 绘制骨骼
- [ ] 单个角色渲染性能 < 2ms
- [ ] TypeScript 类型检查通过

---

### US-011: 创建 DragonBones 动画组件
**Description:** 作为开发者，我需要一个封装好的 React 组件来方便地使用骨骼动画。

**Acceptance Criteria:**
- [ ] 创建 `src/game/DragonBonesSprite.tsx`
- [ ] Props: `dataUrl`, `textureUrl`, `animation`, `scale`, `position`
- [ ] 支持 `ref` 获取动画控制方法
- [ ] 自动加载资源并显示加载状态
- [ ] 支持动画完成回调 `onComplete`
- [ ] TypeScript 类型检查通过

---

### US-012: 使用 Leonardo.AI 生成英雄角色部件
**Description:** 作为开发者，我需要使用 AI 生成英雄角色的分层部件图片，用于骨骼动画。

**Acceptance Criteria:**
- [ ] 生成英雄的分层部件：头、身体、左臂、右臂、左腿、右腿
- [ ] 风格统一：卡通、chibi、Brawl Stars 风格
- [ ] 所有部件使用透明背景 PNG
- [ ] 部件尺寸和比例协调
- [ ] 保存到 `assets/sprites/hero/` 目录

---

### US-013: 制作英雄骨骼动画
**Description:** 作为开发者，我需要在 DragonBones 中制作英雄的完整动画集。

**Acceptance Criteria:**
- [ ] 导入 AI 生成的英雄部件
- [ ] 设置骨骼绑定
- [ ] 制作动画：idle (循环)、attack、hurt、victory
- [ ] 攻击动画包含"命中"事件帧
- [ ] 导出 `hero_ske.json`, `hero_tex.json`, `hero_tex.png`
- [ ] 保存到 `assets/sprites/hero/`

---

### US-014: 使用 Leonardo.AI 生成怪物资产
**Description:** 作为开发者，我需要使用 AI 生成 3 种怪物的部件图片。

**Acceptance Criteria:**
- [ ] 生成 3 种不同怪物：史莱姆(绿)、蝙蝠(紫)、骷髅(白)
- [ ] 每种怪物的分层部件（身体、眼睛、四肢等）
- [ ] 风格与英雄统一
- [ ] 透明背景 PNG
- [ ] 保存到 `assets/sprites/monsters/`

---

### US-015: 制作怪物骨骼动画
**Description:** 作为开发者，我需要在 DragonBones 中制作 3 种怪物的动画。

**Acceptance Criteria:**
- [ ] 每种怪物包含动画：idle (循环)、walk (循环)、hurt、death
- [ ] 死亡动画结束后保持最后一帧
- [ ] 导出骨骼数据到 `assets/sprites/monsters/`
- [ ] 文件命名：`slime_ske.json`, `bat_ske.json`, `skeleton_ske.json` 等

---

### US-016: 使用 Leonardo.AI 生成 Boss 资产
**Description:** 作为开发者，我需要生成 1 个 Boss 的部件图片。

**Acceptance Criteria:**
- [ ] Boss 设计：大型红色恶魔或龙
- [ ] 部件更多更细致（双角、翅膀、尾巴等）
- [ ] 尺寸是普通怪物的 2-3 倍
- [ ] 风格与其他角色统一
- [ ] 保存到 `assets/sprites/boss/`

---

### US-017: 制作 Boss 骨骼动画
**Description:** 作为开发者，我需要在 DragonBones 中制作 Boss 的动画。

**Acceptance Criteria:**
- [ ] 动画：idle (循环)、attack、hurt、death、rage (低血量状态)
- [ ] 动画比普通怪物更复杂、更有气势
- [ ] 导出到 `assets/sprites/boss/`

---

### US-018: 创建 battle-v3.tsx 战斗页面
**Description:** 作为开发者，我需要创建新的战斗页面，集成所有动画系统。

**Acceptance Criteria:**
- [ ] 创建 `app/battle-v3.tsx`
- [ ] 复用 battle-v2 的游戏逻辑（怪物生成、书写判定、伤害计算）
- [ ] 使用 GameCanvas 替代原有 View 渲染
- [ ] 使用 DragonBonesSprite 渲染英雄和怪物
- [ ] 路由注册到 `_layout.tsx`
- [ ] TypeScript 类型检查通过

---

### US-019: 集成英雄动画到战斗流程
**Description:** 作为玩家，我希望看到英雄根据战斗状态播放不同动画。

**Acceptance Criteria:**
- [ ] 待机时播放 idle 动画（循环）
- [ ] 写对字时播放 attack 动画
- [ ] attack 动画的"命中"事件触发火球发射
- [ ] 受到攻击时播放 hurt 动画
- [ ] 动画过渡平滑（使用 crossFade）
- [ ] TypeScript 类型检查通过

---

### US-020: 集成怪物动画到战斗流程
**Description:** 作为玩家，我希望看到怪物有生动的动画表现。

**Acceptance Criteria:**
- [ ] 怪物移动时播放 walk 动画
- [ ] 待机时播放 idle 动画
- [ ] 受到攻击时播放 hurt 动画并短暂暂停移动
- [ ] 死亡时播放 death 动画，完成后移除
- [ ] 不同怪物类型随机出现
- [ ] TypeScript 类型检查通过

---

### US-021: 集成 Boss 动画到战斗流程
**Description:** 作为玩家，我希望 Boss 战有更震撼的视觉效果。

**Acceptance Criteria:**
- [ ] Boss 出场时有特殊动画或特效
- [ ] Boss 体型是普通怪物的 2-3 倍
- [ ] 血量低于 30% 时切换到 rage 动画状态
- [ ] Boss 死亡时有更华丽的特效
- [ ] TypeScript 类型检查通过

---

### US-022: 添加奖励飘字特效
**Description:** 作为玩家，我希望击败怪物时看到奖励数字飘出。

**Acceptance Criteria:**
- [ ] 击败怪物时显示 "+1 肉" 飘字
- [ ] 飘字向上移动并逐渐消失
- [ ] 击败 Boss 时奖励数字更大、特效更明显
- [ ] TypeScript 类型检查通过

---

### US-023: 性能优化和测试
**Description:** 作为开发者，我需要确保动画系统在 iPad 上流畅运行。

**Acceptance Criteria:**
- [ ] 同时渲染 1 英雄 + 3 怪物 + 粒子特效，保持 60fps
- [ ] 资源预加载，避免战斗中卡顿
- [ ] 内存使用稳定，无泄漏
- [ ] iPad 真机测试通过
- [ ] iPhone 真机测试通过

---

## Functional Requirements

- FR-1: 创建基于 Skia 的游戏渲染画布，支持 60fps 游戏循环
- FR-2: 支持加载 TexturePacker 导出的精灵图集 (JSON + PNG)
- FR-3: 支持精灵序列帧动画播放（循环、单次、速度控制）
- FR-4: 实现粒子系统，支持爆炸、闪光等特效
- FR-5: 解析 DragonBones 5.x 导出的骨骼动画数据
- FR-6: 实现骨骼变换计算（矩阵链、关键帧插值）
- FR-7: 支持动画混合（crossFade）实现平滑过渡
- FR-8: 支持动画事件回调（如攻击命中帧）
- FR-9: 将骨骼动画渲染到 Skia Canvas
- FR-10: 创建新的 battle-v3.tsx，保留 v2 作为备用
- FR-11: 英雄支持 idle/attack/hurt/victory 动画
- FR-12: 怪物支持 idle/walk/hurt/death 动画
- FR-13: Boss 支持 idle/attack/hurt/death/rage 动画
- FR-14: 火球命中时显示粒子爆炸特效
- FR-15: 击败怪物时显示奖励飘字

## Non-Goals (Out of Scope)

- 不实现 IK (反向动力学) 骨骼
- 不实现网格变形 (Mesh Deformation)
- 不实现物理引擎 (Physics)
- 不实现 3D 效果或视差滚动
- 不修改现有的 battle-v2.tsx
- 不更改游戏核心玩法（书写、判定、关卡）
- 不实现技能系统或复杂战斗机制
- 不实现联网或多人功能

## Technical Considerations

### 已有依赖
- `@shopify/react-native-skia`: 2.2.12
- `react-native-reanimated`: 4.1.1
- `lottie-react-native`: 7.3.1

### 新增工具
- DragonBones Pro (免费编辑器)
- TexturePacker ($39 或免费版)
- Leonardo.AI ($10-30/月)

### 文件结构
```
src/
  game/
    GameCanvas.tsx           # Skia 游戏画布
    SpriteLoader.ts          # 精灵图集加载
    SpriteAnimation.ts       # 序列帧动画
    ParticleSystem.ts        # 粒子系统
    dragonbones/
      types.ts               # 类型定义
      Parser.ts              # 数据解析
      Skeleton.ts            # 骨骼计算
      SkiaRenderer.ts        # Skia 渲染
    DragonBonesSprite.tsx    # 封装组件

assets/
  sprites/
    hero/                    # 英雄资产
    monsters/                # 怪物资产
    boss/                    # Boss 资产
    effects/                 # 特效资产

app/
  battle-v3.tsx              # 新战斗页面
```

### 参考资源
- [DragonBonesJS (Pixi.js)](https://github.com/DragonBones/DragonBonesJS)
- [React Native Skia 文档](https://shopify.github.io/react-native-skia/)
- [Reanimated useFrameCallback](https://docs.swmansion.com/react-native-reanimated/)

## Design Considerations

### 美术风格
- 卡通渲染，chibi 风格
- 参考：Brawl Stars、植物大战僵尸
- 明亮色彩、大眼睛、简洁轮廓
- 所有角色风格统一

### Leonardo.AI Prompt 模板
```
cute [color] [creature], chibi style, game sprite,
transparent background, PNG, simple shapes,
style of Brawl Stars, no text, high quality
```

## Success Metrics

- 战斗画面视觉品质显著提升，不再有"草稿"感
- iPad 上稳定 60fps，无明显卡顿
- 动画过渡平滑，无跳帧
- 所有角色风格统一协调
- 代码结构清晰，易于扩展新角色

## Open Questions

1. 是否需要为不同关卡设计不同的怪物组合？
2. Boss 是否需要多个攻击动画变体？
3. 未来是否需要支持换装/皮肤系统？
4. 是否需要添加战斗背景动画？
