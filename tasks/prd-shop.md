# PRD: 商店系统

## Introduction

为游戏添加商店功能，玩家通过练习和战斗获得「肉」作为货币，可在商店购买技能和道具。技能类商品永久拥有，道具类商品为消耗品。本期重点搭建框架，商品内容后续扩展。

## Goals

- 建立游戏内货币系统（肉）
- 在学习模式和战斗模式中奖励肉
- 创建商店页面，展示可购买商品
- 实现购买功能，记录用户拥有的商品
- 为后续技能/道具在战斗中的使用打好基础

## User Stories

### US-001: 学习模式奖励肉
**Description:** 作为玩家，我完成一个字的学习（临摹+默写）后获得1个肉，激励我继续练习。

**Acceptance Criteria:**
- [ ] 完成一个字的完整学习流程（临摹3次+默写3次）后调用 `addMeat(1)`
- [ ] 屏幕显示 "+1 肉" 动画或提示
- [ ] 数据库 `user_rewards.total_meat` 正确累加
- [ ] Typecheck passes

### US-002: 战斗模式奖励肉
**Description:** 作为玩家，我在战斗中击败一个怪物后获得1个肉。

**Acceptance Criteria:**
- [ ] 怪物 HP 归零被击败时调用 `addMeat(1)`
- [ ] 显示获得肉的反馈（如 "+1" 飘字）
- [ ] Boss 击败奖励可设为更高（如3个肉）
- [ ] Typecheck passes

### US-003: 首页添加商店入口
**Description:** 作为玩家，我可以从首页进入商店查看和购买商品。

**Acceptance Criteria:**
- [ ] 首页新增「商店」按钮，样式与其他按钮一致
- [ ] 按钮上或旁边显示当前肉的数量
- [ ] 点击跳转到 `/shop` 页面
- [ ] Typecheck passes

### US-004: 商店页面布局
**Description:** 作为玩家，我可以在商店页面查看所有可购买的商品。

**Acceptance Criteria:**
- [ ] 顶部显示当前肉数量
- [ ] 商品分类展示（技能/道具）
- [ ] 每个商品卡片显示：图标、名称、描述、价格
- [ ] 已拥有的商品显示「已拥有」标记
- [ ] 返回首页按钮
- [ ] Typecheck passes

### US-005: 商品数据结构
**Description:** 作为开发者，我需要定义商品数据结构以便扩展。

**Acceptance Criteria:**
- [ ] 创建 `src/data/shop-items.ts` 定义商品数据
- [ ] 商品类型：`skill`（永久）/ `consumable`（消耗品）
- [ ] 包含 3 个初始技能商品（火球、冰球、闪电）
- [ ] 包含字段：id, name, description, price, type, icon, effect
- [ ] Typecheck passes

### US-006: 购买商品功能
**Description:** 作为玩家，我可以用肉购买商品。

**Acceptance Criteria:**
- [ ] 点击商品显示购买确认
- [ ] 肉不足时按钮禁用，显示提示
- [ ] 购买成功：扣除肉，记录到 `user_inventory` 表
- [ ] 技能类商品购买后不可重复购买
- [ ] 消耗品可重复购买，数量累加
- [ ] Typecheck passes

### US-007: 用户背包数据
**Description:** 作为开发者，我需要存储用户拥有的商品。

**Acceptance Criteria:**
- [ ] 数据库新增 `user_inventory` 表
- [ ] 字段：item_id, quantity, purchased_at
- [ ] 提供查询函数 `getUserInventory()`
- [ ] 提供购买函数 `purchaseItem(itemId)`
- [ ] Typecheck passes

## Functional Requirements

- FR-1: 使用现有 `user_rewards` 表存储肉数量
- FR-2: 学习模式完成单字学习时奖励 1 肉
- FR-3: 战斗模式击败怪物奖励 1 肉，击败 Boss 奖励 3 肉
- FR-4: 首页显示「商店」按钮和当前肉数量
- FR-5: 商店页面展示商品列表，按类型分组
- FR-6: 商品数据定义在 `src/data/shop-items.ts`
- FR-7: 购买时检查肉是否足够，扣除后记录到背包
- FR-8: 技能类商品只能购买一次，消耗品可重复购买

## Non-Goals

- 本期不实现技能在战斗中的实际效果
- 不实现道具的使用逻辑
- 不实现商品的升级系统
- 不实现每日商店刷新机制
- 不实现商品的视觉特效

## Technical Considerations

- 复用现有 `user_rewards` 表的 `total_meat` 字段
- 新增 `user_inventory` 表存储已购商品
- 商品定义为静态数据，便于后续扩展
- 考虑后续技能效果的扩展性（effect 字段预留）

## Design Considerations

- 商店按钮颜色建议：金色/橙色（#f39c12）突出货币主题
- 商品卡片参考现有关卡卡片样式
- 肉的图标可用 emoji（🍖）或自定义图标
- 技能图标：🔥火球、❄️冰球、⚡闪电

## Success Metrics

- 用户可正常获得和消费肉
- 商店页面正常展示商品
- 购买流程完整无报错
- 数据正确持久化

## Open Questions

- 技能在战斗中的具体效果机制（下期设计）
- 是否需要商品详情弹窗
- 消耗品的使用入口在哪里

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/data/shop-items.ts` | 新建 | 商品数据定义 |
| `src/lib/database.ts` | 修改 | 新增 user_inventory 表和相关函数 |
| `app/index.tsx` | 修改 | 添加商店按钮和肉数量显示 |
| `app/shop.tsx` | 新建 | 商店页面 |
| `app/_layout.tsx` | 修改 | 注册 shop 路由 |
| `app/learning.tsx` | 修改 | 添加奖励肉逻辑 |
| `app/battle-v2.tsx` | 修改 | 添加击败怪物奖励肉逻辑 |
