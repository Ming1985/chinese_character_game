# Phase 5: 战斗整合

**类型**: ui
**状态**: pending
**依赖**: Phase 1-4 (框架 + 所有资产)

## 目标

创建 battle-v3.tsx，将动画系统整合到战斗流程中，实现完整的游戏体验。

## User Stories

### US-018: 创建 battle-v3.tsx 战斗页面
**文件**: `app/battle-v3.tsx`

- [ ] 创建 `app/battle-v3.tsx`
- [ ] 复用 battle-v2 的游戏逻辑（怪物生成、书写判定、伤害计算）
- [ ] 使用 GameCanvas 替代原有 View 渲染
- [ ] 使用 DragonBonesSprite 渲染英雄和怪物
- [ ] 路由注册到 `_layout.tsx`
- [ ] TypeScript 类型检查通过

---

### US-019: 集成英雄动画到战斗流程
**文件**: `app/battle-v3.tsx`

- [ ] 待机时播放 idle 动画（循环）
- [ ] 写对字时播放 attack 动画
- [ ] attack 动画的"命中"事件触发火球发射
- [ ] 受到攻击时播放 hurt 动画
- [ ] 动画过渡平滑（使用 crossFade）
- [ ] TypeScript 类型检查通过

**状态-动画映射**:
| 游戏状态 | 英雄动画 |
|----------|----------|
| 等待书写 | idle |
| 书写正确 | attack → idle |
| 受到攻击 | hurt → idle |
| 战斗胜利 | victory |

---

### US-020: 集成怪物动画到战斗流程
**文件**: `app/battle-v3.tsx`

- [ ] 怪物移动时播放 walk 动画
- [ ] 待机时播放 idle 动画
- [ ] 受到攻击时播放 hurt 动画并短暂暂停移动
- [ ] 死亡时播放 death 动画，完成后移除
- [ ] 不同怪物类型随机出现
- [ ] TypeScript 类型检查通过

**状态-动画映射**:
| 游戏状态 | 怪物动画 |
|----------|----------|
| 向英雄移动 | walk |
| 到达攻击范围 | idle |
| 被火球命中 | hurt → walk |
| HP 归零 | death (保持) |

---

### US-021: 集成 Boss 动画到战斗流程
**文件**: `app/battle-v3.tsx`

- [ ] Boss 出场时有特殊动画或特效
- [ ] Boss 体型是普通怪物的 2-3 倍
- [ ] 血量低于 30% 时切换到 rage 动画状态
- [ ] Boss 死亡时有更华丽的特效
- [ ] TypeScript 类型检查通过

---

### US-022: 添加奖励飘字特效
**文件**: `app/battle-v3.tsx` 或 `src/game/RewardText.tsx`

- [ ] 击败怪物时显示 "+1 肉" 飘字
- [ ] 飘字向上移动并逐渐消失
- [ ] 击败 Boss 时奖励数字更大、特效更明显
- [ ] TypeScript 类型检查通过

---

## 整合架构

```
battle-v3.tsx
├── GameCanvas
│   ├── 背景层
│   ├── DragonBonesSprite (怪物们)
│   ├── DragonBonesSprite (英雄)
│   ├── SpriteAnimation (火球)
│   ├── ParticleSystem (爆炸)
│   └── RewardText (飘字)
├── WritingPad (书写区)
└── UI 层 (血条、生字提示等)
```

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

**类型**: ui

- [ ] `npx tsc --noEmit` 类型检查通过
- [ ] battle-v3 路由可访问
- [ ] 英雄动画状态切换正确
- [ ] 怪物动画状态切换正确
- [ ] Boss 特殊逻辑生效 (rage 状态)
- [ ] 火球发射与 attack 事件同步
- [ ] 粒子爆炸在正确位置显示
- [ ] 奖励飘字显示
- [ ] 书写判定逻辑正常
- [ ] iPad 模拟器完整流程测试通过
