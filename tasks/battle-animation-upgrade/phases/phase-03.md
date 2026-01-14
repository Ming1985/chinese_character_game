# Phase 3: 英雄美术资产

**类型**: animation
**状态**: pending
**依赖**: Phase 2 (DragonBones 渲染器可用于验证)

## 目标

使用 Leonardo.AI 生成英雄角色部件，并在 DragonBones 中制作完整动画。

## User Stories

### US-012: 使用 Leonardo.AI 生成英雄角色部件
**输出目录**: `assets/sprites/hero/`

- [ ] 生成英雄的分层部件：头、身体、左臂、右臂、左腿、右腿
- [ ] 风格统一：卡通、chibi、Brawl Stars 风格
- [ ] 所有部件使用透明背景 PNG
- [ ] 部件尺寸和比例协调
- [ ] 保存到 `assets/sprites/hero/` 目录

**Prompt 模板**:
```
cute green dragon hero, chibi style, game sprite,
transparent background, PNG, simple shapes,
style of Brawl Stars, no text, high quality,
[specific body part], separated layer
```

---

### US-013: 制作英雄骨骼动画
**输出文件**: `assets/sprites/hero/hero_ske.json`, `hero_tex.json`, `hero_tex.png`

- [ ] 导入 AI 生成的英雄部件
- [ ] 设置骨骼绑定
- [ ] 制作动画：idle (循环)、attack、hurt、victory
- [ ] 攻击动画包含"命中"事件帧
- [ ] 导出 `hero_ske.json`, `hero_tex.json`, `hero_tex.png`
- [ ] 保存到 `assets/sprites/hero/`

**动画规格**:
| 动画 | 帧数 | 时长 | 循环 | 事件 |
|------|------|------|------|------|
| idle | 8-12 | 1s | 是 | 无 |
| attack | 6-8 | 0.5s | 否 | hit (第4帧) |
| hurt | 4-6 | 0.3s | 否 | 无 |
| victory | 10-15 | 1.5s | 否 | 无 |

---

## 工具准备

- [ ] 注册 Leonardo.AI 账号
- [ ] 下载安装 DragonBones Pro
- [ ] 熟悉 DragonBones 基本操作

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

**类型**: animation

- [ ] 英雄部件 PNG 文件完整（6个以上）
- [ ] 风格统一，无明显违和感
- [ ] DragonBones 项目文件保存
- [ ] 4 个动画导出成功
- [ ] 在 DragonBonesSprite 中可正常播放
- [ ] idle 动画循环流畅
- [ ] attack 动画事件正确触发
- [ ] 视觉效果符合"卡通 chibi"风格
