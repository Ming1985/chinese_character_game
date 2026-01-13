import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getTotalMeat, getUserInventory, purchaseItem, setMeat, InventoryItem } from '../src/lib/database';
import { SKILL_ITEMS, CONSUMABLE_ITEMS, ShopItem } from '../src/data/shop-items';

export default function ShopScreen() {
    const [meatCount, setMeatCount] = useState(0);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [purchasing, setPurchasing] = useState(false);

    // 加载数据
    const loadData = useCallback(async () => {
        const meat = await getTotalMeat();
        const inv = await getUserInventory();
        setMeatCount(meat);
        setInventory(inv);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // // TODO: 临时设置肉腿为15，用完后删除这段代码
    // useEffect(() => {
    //     setMeat(15).then(loadData);
    // }, []);

    // 获取已拥有数量
    const getOwnedQuantity = (itemId: string): number => {
        return inventory.find(inv => inv.itemId === itemId)?.quantity ?? 0;
    };

    // 购买商品
    const handlePurchase = async (item: ShopItem) => {
        if (purchasing) return;

        const owned = getOwnedQuantity(item.id) > 0;

        // 技能类不可重复购买
        if (item.type === 'skill' && owned) {
            Alert.alert('提示', '你已经拥有这个技能了');
            return;
        }

        // 检查余额
        if (meatCount < item.price) {
            Alert.alert('余额不足', `需要 ${item.price} 个肉，当前只有 ${meatCount} 个`);
            return;
        }

        // 确认购买
        Alert.alert(
            '确认购买',
            `确定要花费 ${item.price} 个肉购买「${item.name}」吗？`,
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '确定',
                    onPress: async () => {
                        setPurchasing(true);
                        const success = await purchaseItem(
                            item.id,
                            item.price,
                            item.type === 'consumable'
                        );
                        if (success) {
                            await loadData();
                            Alert.alert('购买成功', `你获得了「${item.name}」！`);
                        } else {
                            Alert.alert('购买失败', '请稍后再试');
                        }
                        setPurchasing(false);
                    },
                },
            ]
        );
    };

    // 渲染商品卡片
    const renderItem = (item: ShopItem) => {
        const quantity = getOwnedQuantity(item.id);
        const isSkillOwned = item.type === 'skill' && quantity > 0;
        const canAfford = meatCount >= item.price;

        return (
            <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemIcon}>
                    <Text style={styles.itemIconText}>{item.icon}</Text>
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                    <View style={styles.itemPriceRow}>
                        <Text style={styles.itemPrice}>🍖 {item.price}</Text>
                        {item.type === 'consumable' && quantity > 0 && (
                            <Text style={styles.ownedCount}>已有 {quantity} 个</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.buyButton,
                        isSkillOwned && styles.buyButtonOwned,
                        !canAfford && !isSkillOwned && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handlePurchase(item)}
                    disabled={isSkillOwned || purchasing}
                >
                    <Text style={[
                        styles.buyButtonText,
                        isSkillOwned && styles.buyButtonTextOwned,
                    ]}>
                        {isSkillOwned ? '已拥有' : '购买'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 顶部导航 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>商店</Text>
                <View style={styles.meatDisplay}>
                    <Text style={styles.meatText}>🍖 {meatCount}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* 技能类商品 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚔️ 攻击技能</Text>
                    <Text style={styles.sectionSubtitle}>购买后永久拥有</Text>
                    {SKILL_ITEMS.map(renderItem)}
                </View>

                {/* 消耗品类商品 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎒 道具</Text>
                    <Text style={styles.sectionSubtitle}>消耗品，用完需要再买</Text>
                    {CONSUMABLE_ITEMS.map(renderItem)}
                </View>

                {/* 提示区 */}
                <View style={styles.tipSection}>
                    <Text style={styles.tipText}>
                        💡 完成学习获得肉：每学会一个字 +1 肉
                    </Text>
                    <Text style={styles.tipText}>
                        💡 战斗奖励：击败怪物 +1 肉，击败 Boss +3 肉
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#f39c12',
        fontSize: 16,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#eee',
    },
    meatDisplay: {
        backgroundColor: '#f39c12',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    meatText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#eee',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#0f3460',
    },
    itemIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemIconText: {
        fontSize: 28,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#eee',
    },
    itemDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    itemPrice: {
        fontSize: 14,
        color: '#f39c12',
        fontWeight: '600',
    },
    ownedCount: {
        fontSize: 12,
        color: '#27ae60',
        marginLeft: 10,
    },
    buyButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buyButtonOwned: {
        backgroundColor: '#333',
    },
    buyButtonDisabled: {
        backgroundColor: '#444',
        opacity: 0.6,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    buyButtonTextOwned: {
        color: '#888',
    },
    tipSection: {
        marginTop: 8,
        padding: 16,
        backgroundColor: '#16213e',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0f3460',
    },
    tipText: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
    },
});
