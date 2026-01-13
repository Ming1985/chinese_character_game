// 商店商品数据

export type ItemType = 'skill' | 'consumable';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: ItemType;
    icon: string;
    effect?: string; // 预留给后续实现具体效果
}

// 技能类商品
export const SKILL_ITEMS: ShopItem[] = [
    {
        id: 'skill-fireball',
        name: '火球术',
        description: '释放火球攻击怪物，造成额外伤害',
        price: 100,
        type: 'skill',
        icon: '🔥',
        effect: 'damage_boost',
    },
    {
        id: 'skill-iceball',
        name: '冰冻术',
        description: '冰冻怪物，减缓其移动速度',
        price: 150,
        type: 'skill',
        icon: '❄️',
        effect: 'slow_enemy',
    },
    {
        id: 'skill-lightning',
        name: '闪电链',
        description: '召唤闪电，对怪物造成持续伤害',
        price: 200,
        type: 'skill',
        icon: '⚡',
        effect: 'chain_damage',
    },
];

// 消耗品类商品（后续扩展）
export const CONSUMABLE_ITEMS: ShopItem[] = [
    {
        id: 'item-revive',
        name: '复活药水',
        description: '战斗失败时自动复活，保留当前进度',
        price: 5,
        type: 'consumable',
        icon: '💊',
        effect: 'revive',
    },
    {
        id: 'item-time-extend',
        name: '时间沙漏',
        description: '延长怪物到达时间5秒',
        price: 3,
        type: 'consumable',
        icon: '⏳',
        effect: 'time_extend',
    },
];

// 所有商品
export const ALL_SHOP_ITEMS: ShopItem[] = [...SKILL_ITEMS, ...CONSUMABLE_ITEMS];

// 根据 ID 获取商品
export function getShopItemById(id: string): ShopItem | undefined {
    return ALL_SHOP_ITEMS.find(item => item.id === id);
}

// 获取商品分类
export function getItemsByType(type: ItemType): ShopItem[] {
    return ALL_SHOP_ITEMS.filter(item => item.type === type);
}
