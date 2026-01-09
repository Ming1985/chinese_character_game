import { View, Text, StyleSheet, Image, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Character } from '../src/types';
import { getCharactersByLevelId } from '../src/data';
import WritingPad from '../src/components/WritingPad';
import { saveAnswerResult, markLevelCompleted } from '../src/lib/database';
import { getAudioService } from '../src/lib/audioService';
import { SoundEffect } from '../src/lib/audioTypes';

const SCREEN = Dimensions.get('window');
const MONSTER_MOVE_DURATION = 15000; // 15秒移动到角色位置
const MONSTER_HP = 2;
const HERO_MAX_HP = 3;

interface MonsterState {
    character: Character;
    hp: number;
    defeated: boolean;
    spriteIndex: number; // 随机选择的怪物图片索引 (0-3)
}

export default function BattleV2Screen() {
    const params = useLocalSearchParams();
    const levelId = params.levelId as string;

    const [characters, setCharacters] = useState<Character[]>([]);
    const [monsters, setMonsters] = useState<MonsterState[]>([]);
    const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
    const [heroHp, setHeroHp] = useState(HERO_MAX_HP);
    const [gameOver, setGameOver] = useState(false);
    const [victory, setVictory] = useState(false);

    // 怪物位置动画 (0=右侧刷怪点, 1=左侧角色位置)
    const monsterProgress = useRef(new Animated.Value(0)).current;
    const [isMoving, setIsMoving] = useState(false);
    const [writingEnabled, setWritingEnabled] = useState(false);

    // 初始化关卡数据
    useEffect(() => {
        const chars = getCharactersByLevelId(levelId);
        if (chars.length === 0) {
            router.back();
            return;
        }
        setCharacters(chars);
        const monsterList = chars.map(c => ({
            character: c,
            hp: MONSTER_HP,
            defeated: false,
            spriteIndex: Math.floor(Math.random() * 4), // 随机选择 0-3
        }));
        setMonsters(monsterList);
    }, [levelId]);

    // 当前怪物和字符（需要在 useEffect 之前声明）
    const currentMonster = monsters[currentMonsterIndex];
    const currentChar = currentMonster?.character;

    // 启动怪物移动
    useEffect(() => {
        if (monsters.length > 0 && currentMonsterIndex < monsters.length && !gameOver && !victory) {
            startMonsterMovement();
        }
    }, [currentMonsterIndex, monsters]);

    // 当新怪物出现时，自动朗读汉字和词语
    useEffect(() => {
        if (currentChar && !gameOver && !victory) {
            const audio = getAudioService();
            // 延迟300ms后先读字
            const timer1 = setTimeout(() => {
                audio.speakText(currentChar.char).catch(console.error);
            }, 300);
            // 延迟1300ms读完整词语（不是speakWord，而是speakText读词）
            const timer2 = setTimeout(() => {
                audio.speakText(currentChar.word).catch(console.error);
            }, 1300);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [currentChar?.id, gameOver, victory]);

    const startMonsterMovement = () => {
        monsterProgress.setValue(0);
        setIsMoving(true);
        setWritingEnabled(true);

        Animated.timing(monsterProgress, {
            toValue: 1,
            duration: MONSTER_MOVE_DURATION,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                // 怪物到达角色位置，攻击角色
                handleMonsterAttack();
            }
        });
    };

    const handleMonsterAttack = () => {
        setIsMoving(false);
        setWritingEnabled(false);
        const newHp = heroHp - 1;
        setHeroHp(newHp);

        getAudioService().playSoundEffect(SoundEffect.WRONG).catch(console.error);

        if (newHp <= 0) {
            setGameOver(true);
        } else {
            // 怪物返回起点，重新开始
            setTimeout(() => startMonsterMovement(), 1000);
        }
    };

    const handleWritingComplete = async (recognizedChar: string, isCorrect: boolean) => {
        if (!isMoving || currentMonsterIndex >= monsters.length) return;

        const currentMonster = monsters[currentMonsterIndex];
        const targetChar = currentMonster.character.char;

        await saveAnswerResult(currentMonster.character.id, isCorrect, Date.now());

        if (isCorrect && recognizedChar === targetChar) {
            // 写对了，攻击怪物
            monsterProgress.stopAnimation();
            setIsMoving(false);
            setWritingEnabled(false);

            const newHp = currentMonster.hp - 1;
            const updatedMonsters = [...monsters];
            updatedMonsters[currentMonsterIndex].hp = newHp;
            setMonsters(updatedMonsters);

            getAudioService().playSoundEffect(SoundEffect.HIT).catch(console.error);

            if (newHp <= 0) {
                // 怪物死亡
                updatedMonsters[currentMonsterIndex].defeated = true;
                setMonsters(updatedMonsters);

                getAudioService().playSoundEffect(SoundEffect.MONSTER_DEFEAT).catch(console.error);

                // 检查是否所有怪物都死了
                if (currentMonsterIndex === monsters.length - 1) {
                    setTimeout(() => {
                        setVictory(true);
                        markLevelCompleted(levelId, 3);
                    }, 1000);
                } else {
                    // 下一只怪物
                    setTimeout(() => {
                        setCurrentMonsterIndex(currentMonsterIndex + 1);
                    }, 1000);
                }
            } else {
                // 怪物受伤，返回起点
                setTimeout(() => startMonsterMovement(), 1500);
            }
        } else {
            // 写错了，怪物继续移动
            getAudioService().playSoundEffect(SoundEffect.WRONG).catch(console.error);
        }
    };

    if (characters.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>加载中...</Text>
            </SafeAreaView>
        );
    }



    // 怪物的X位置 (0=右侧, SCREEN.width*0.8=左侧)
    const monsterX = monsterProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN.width * 0.75, SCREEN.width * 0.15],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* 背景 */}
            <Image
                source={require('../assets/images/jungle_bg.png')}
                style={styles.background}
                resizeMode="cover"
            />

            {/* 游戏区域 */}
            <View style={styles.gameArea}>
                {/* 角色 (左侧) */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('../assets/images/dino_hero.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                    {/* 角色血条 */}
                    <View style={styles.hpBar}>
                        {Array.from({ length: HERO_MAX_HP }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.hpHeart,
                                    { opacity: i < heroHp ? 1 : 0.3 },
                                ]}
                            >
                                <Text>❤️</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 怪物 (移动中) */}
                {!currentMonster?.defeated && currentChar && (
                    <Animated.View
                        style={[
                            styles.monsterContainer,
                            { left: monsterX },
                        ]}
                    >
                        <Image
                            source={
                                currentMonster.spriteIndex === 0
                                    ? require('../assets/images/snake_monster.png')
                                    : currentMonster.spriteIndex === 1
                                        ? require('../assets/images/snake_monster_2.png')
                                        : currentMonster.spriteIndex === 2
                                            ? require('../assets/images/snake_monster_3.png')
                                            : require('../assets/images/snake_monster_4.png')
                            }
                            style={styles.monsterImage}
                            resizeMode="contain"
                        />
                        {/* 怪物血条 */}
                        <View style={styles.monsterHpBar}>
                            {Array.from({ length: MONSTER_HP }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.hpBlock,
                                        { backgroundColor: i < currentMonster.hp ? '#e74c3c' : '#333' },
                                    ]}
                                />
                            ))}
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* 底部UI区 */}
            <View style={styles.bottomUI}>
                {/* 听写提示 (拼音 + 组词) */}
                {currentChar && !victory && !gameOver && (
                    <View style={styles.charInfo}>
                        <View style={styles.dictationHint}>
                            <Text style={styles.dictationText}>
                                {/* 用拼音替换目标字，比如"两个" → "liang个" */}
                                {currentChar.word.replace(currentChar.char, currentChar.pinyin)}
                            </Text>
                            <Text style={styles.speakerIcon}>🔊</Text>
                        </View>
                        <Text style={styles.charWordPinyin}>{currentChar.wordPinyin}</Text>
                    </View>
                )}

                {/* 书写区 */}
                {!victory && !gameOver && currentChar && (
                    <View style={styles.writingArea}>
                        <View style={styles.writingRow}>
                            {/* 左侧按钮 */}
                            <TouchableOpacity
                                style={styles.sideButton}
                                onPress={() => {/* TODO: 提示功能 */ }}
                                testID="hint-button"
                                accessibilityLabel="提示"
                            >
                                <Text style={styles.sideButtonText}>💡</Text>
                            </TouchableOpacity>

                            {/* 中间田字格 */}
                            <WritingPad
                                targetChar={currentChar.char}
                                onComplete={handleWritingComplete}
                                disabled={!writingEnabled}
                            />

                            {/* 右侧按钮 */}
                            <TouchableOpacity
                                style={styles.sideButton}
                                onPress={() => {/* TODO: 跳过功能 */ }}
                                testID="skip-button"
                                accessibilityLabel="跳过"
                            >
                                <Text style={styles.sideButtonText}>⏭️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 胜利界面 */}
                {victory && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>🎉 恭喜过关！</Text>
                        <Text style={styles.resultText}>击败了 {monsters.length} 只怪物</Text>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.nextButtonText}>返回关卡</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 失败界面 */}
                {gameOver && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>💔 挑战失败</Text>
                        <Text style={styles.resultText}>再试一次吧！</Text>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.nextButtonText}>返回关卡</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gameArea: {
        flex: 0.55, // 游戏区域只占上半部分
        position: 'relative',
    },
    heroContainer: {
        position: 'absolute',
        left: SCREEN.width * 0.05,
        top: SCREEN.height * 0.3,
        alignItems: 'center',
        backgroundColor: 'transparent', // 确保透明
    },
    heroImage: {
        width: 150,
        height: 150,
        backgroundColor: 'transparent', // 确保透明
    },
    hpBar: {
        flexDirection: 'row',
        marginTop: 8,
    },
    hpHeart: {
        marginHorizontal: 2,
    },
    monsterContainer: {
        position: 'absolute',
        top: SCREEN.height * 0.25,
        alignItems: 'center',
        backgroundColor: 'transparent', // 确保透明
    },
    monsterImage: {
        width: 120,
        height: 120,
        backgroundColor: 'transparent', // 确保透明
    },
    monsterHpBar: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 4,
    },
    hpBlock: {
        width: 20,
        height: 8,
        borderRadius: 2,
    },
    bottomUI: {
        flex: 0.45, // 底部UI区域占下半部分
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    charInfo: {
        alignItems: 'center',
        marginBottom: 4,
    },
    dictationHint: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(243, 156, 18, 0.15)', // 更透明
        borderRadius: 10,
        marginBottom: 2,
    },
    dictationText: {
        fontSize: 28,
        color: '#f39c12',
        fontWeight: '600',
        marginRight: 8,
    },
    speakerIcon: {
        fontSize: 20,
    },
    charWordPinyin: {
        fontSize: 14,
        color: '#aaa',
    },
    writingArea: {
        paddingBottom: 40, // 增加底部间距确保按钮可见
        alignItems: 'center',
    },
    writingRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // 对齐到顶部，让按钮与田字格顶部对齐
        justifyContent: 'center',
        gap: 16,
    },
    sideButton: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(52, 73, 94, 0.8)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f39c12',
    },
    sideButtonText: {
        fontSize: 28,
    },
    resultContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    resultTitle: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    resultText: {
        fontSize: 18,
        color: '#aaa',
        marginBottom: 24,
    },
    nextButton: {
        backgroundColor: '#27ae60',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
});
