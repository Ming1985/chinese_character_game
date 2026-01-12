import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, useWindowDimensions, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Character } from '../src/types';
import { getCharactersByLevelId } from '../src/data';
import WritingPad from '../src/components/WritingPad';
import { saveAnswerResult, markLevelCompleted, getLevelProgress } from '../src/lib/database';
import { getAudioService } from '../src/lib/audioService';
import { SoundEffect } from '../src/lib/audioTypes';

const MONSTER_MOVE_DURATION = 15000; // 15秒移动到角色位置
const MONSTER_HP = 2;
const HERO_MAX_HP = 3;

// 怪物图片映射
const MONSTER_SPRITES = [
    require('../assets/images/monster_slime.png'),
    require('../assets/images/monster_mushroom.png'),
    require('../assets/images/monster_ghost.png'),
    require('../assets/images/monster_bat.png'),
    require('../assets/images/monster_pumpkin.png'),
    require('../assets/images/monster_cactus.png'),
    require('../assets/images/monster_fire.png'),
    require('../assets/images/monster_ice.png'),
] as const;

interface MonsterState {
    character: Character;
    hp: number;
    defeated: boolean;
    spriteIndex: number; // 随机选择的怪物图片索引 (0-7)
}

export default function BattleV2Screen() {
    const params = useLocalSearchParams();
    const levelId = params.levelId as string;
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [characters, setCharacters] = useState<Character[]>([]);
    const [monsters, setMonsters] = useState<MonsterState[]>([]);
    const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
    const [heroHp, setHeroHp] = useState(HERO_MAX_HP);
    const [gameOver, setGameOver] = useState(false);
    const [victory, setVictory] = useState(false);
    const [showingAnswer, setShowingAnswer] = useState(false); // 显示答案状态

    // 怪物位置动画 (0=右侧刷怪点, 1=左侧角色位置)
    const monsterProgress = useRef(new Animated.Value(0)).current;
    const [isMoving, setIsMoving] = useState(false);
    const [writingEnabled, setWritingEnabled] = useState(false);

    // 火球攻击动画
    const [isAttacking, setIsAttacking] = useState(false);
    const fireballX = useRef(new Animated.Value(0)).current;
    const fireballY = useRef(new Animated.Value(0)).current;
    const fireballOpacity = useRef(new Animated.Value(0)).current;

    // 暂停状态
    const [isPaused, setIsPaused] = useState(false);
    const pausedProgressRef = useRef(0);

    // 角色死亡动画
    const [isDying, setIsDying] = useState(false);
    const heroRotation = useRef(new Animated.Value(0)).current;
    const heroOpacity = useRef(new Animated.Value(1)).current;

    // 播放死亡动画
    const playDeathAnimation = (onComplete: () => void) => {
        setIsDying(true);
        heroRotation.setValue(0);
        heroOpacity.setValue(1);

        Animated.sequence([
            // 先抖动
            Animated.sequence([
                Animated.timing(heroRotation, { toValue: -5, duration: 50, useNativeDriver: true }),
                Animated.timing(heroRotation, { toValue: 5, duration: 50, useNativeDriver: true }),
                Animated.timing(heroRotation, { toValue: -5, duration: 50, useNativeDriver: true }),
                Animated.timing(heroRotation, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]),
            // 然后倒下（旋转90度）
            Animated.timing(heroRotation, {
                toValue: 90,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
        ]).start(() => {
            setTimeout(onComplete, 500);
        });
    };

    // 暂停游戏
    const handlePause = () => {
        if (gameOver || victory || isPaused) return;
        // 保存当前进度并停止动画
        pausedProgressRef.current = (monsterProgress as any)._value ?? 0;
        monsterProgress.stopAnimation();
        setIsMoving(false);
        setWritingEnabled(false);
        setIsPaused(true);
    };

    // 继续游戏
    const handleResume = () => {
        if (!isPaused) return;
        setIsPaused(false);
        setIsMoving(true);
        setWritingEnabled(true);
        // 从暂停位置继续动画
        const remainingProgress = 1 - pausedProgressRef.current;
        const remainingDuration = MONSTER_MOVE_DURATION * remainingProgress;
        monsterProgress.setValue(pausedProgressRef.current);
        Animated.timing(monsterProgress, {
            toValue: 1,
            duration: remainingDuration,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleMonsterAttack();
            }
        });
    };

    // 跳过按钮：显示答案 + 扣血 + 跳过
    const handleSkip = () => {
        if (!currentChar || showingAnswer || gameOver || victory) return;

        // 停止怪物移动
        monsterProgress.stopAnimation();
        setIsMoving(false);
        setWritingEnabled(false);

        // 显示答案
        setShowingAnswer(true);

        // 播放错误音效
        getAudioService().playSoundEffect(SoundEffect.WRONG).catch(console.error);

        // 记录为错误答案
        saveAnswerResult(currentChar.id, false, Date.now());

        // 2秒后扣血并跳过
        setTimeout(() => {
            const newHp = heroHp - 1;
            setHeroHp(newHp);
            setShowingAnswer(false);

            if (newHp <= 0) {
                // 播放死亡动画，然后显示游戏结束
                playDeathAnimation(() => {
                    setGameOver(true);
                });
            } else {
                // 标记当前怪物为击败（跳过）
                const updatedMonsters = [...monsters];
                updatedMonsters[currentMonsterIndex].defeated = true;
                setMonsters(updatedMonsters);

                // 检查是否还有怪物
                if (currentMonsterIndex === monsters.length - 1) {
                    setVictory(true);
                    markLevelCompleted(levelId, Math.max(1, heroHp));
                } else {
                    setCurrentMonsterIndex(currentMonsterIndex + 1);
                }
            }
        }, 2000);
    };

    // 喇叭点击朗读
    const handleSpeakerPress = () => {
        const audio = getAudioService();
        if (currentChar) {
            audio.speakText(currentChar.char).catch(console.error);
            setTimeout(() => {
                audio.speakText(currentChar.word).catch(console.error);
            }, 800);
        }
    };

    // 初始化关卡数据
    useEffect(() => {
        const initLevel = async () => {
            console.log('🎮 battle-v2: levelId =', levelId);
            const chars = getCharactersByLevelId(levelId);
            console.log('🎮 battle-v2: chars.length =', chars.length);
            if (chars.length === 0) {
                console.log('🎮 battle-v2: No characters found, going back');
                router.back();
                return;
            }

            // 获取进度信息并按净错误数排序
            const charIds = chars.map(c => c.id);
            const progressMap = await getLevelProgress(charIds);

            // 按净错误数（错误-正确）降序排列
            const sortedChars = [...chars].sort((a, b) => {
                const progressA = progressMap.get(a.id);
                const progressB = progressMap.get(b.id);
                const netErrorA = progressA ? (progressA.wrongCount - progressA.correctCount) : 0;
                const netErrorB = progressB ? (progressB.wrongCount - progressB.correctCount) : 0;
                return netErrorB - netErrorA;
            });

            setCharacters(sortedChars);
            const monsterList = sortedChars.map(c => ({
                character: c,
                hp: MONSTER_HP,
                defeated: false,
                spriteIndex: Math.floor(Math.random() * 8),
            }));
            setMonsters(monsterList);
        };
        initLevel();
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
            // 播放死亡动画，然后显示游戏结束
            playDeathAnimation(() => {
                setGameOver(true);
            });
        } else {
            // 怪物返回起点，重新开始
            setTimeout(() => startMonsterMovement(), 1000);
        }
    };

    // 火球攻击动画函数
    const playFireballAnimation = (
        heroX: number,
        heroY: number,
        targetX: number,
        targetY: number,
        onComplete: () => void
    ) => {
        // 设置起点
        fireballX.setValue(heroX);
        fireballY.setValue(heroY);
        fireballOpacity.setValue(1);
        setIsAttacking(true);

        // 执行飞行动画
        Animated.parallel([
            Animated.timing(fireballX, {
                toValue: targetX,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
            Animated.timing(fireballY, {
                toValue: targetY,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
        ]).start(() => {
            // 命中音效
            getAudioService().playSoundEffect(SoundEffect.HIT).catch(console.error);
            // 隐藏火球
            fireballOpacity.setValue(0);
            setIsAttacking(false);
            onComplete();
        });
    };

    const handleWritingComplete = async (recognizedChar: string, isCorrect: boolean) => {
        if (!isMoving || currentMonsterIndex >= monsters.length || isAttacking) return;

        const currentMonster = monsters[currentMonsterIndex];
        const targetChar = currentMonster.character.char;

        await saveAnswerResult(currentMonster.character.id, isCorrect, Date.now());

        if (isCorrect && recognizedChar === targetChar) {
            // 写对了，攻击怪物
            monsterProgress.stopAnimation();
            setIsMoving(false);
            setWritingEnabled(false);

            // 计算当前布局尺寸
            const currentSpriteSize = isLandscape ? 80 : 120;
            const currentHeroSize = isLandscape ? 100 : 150;
            const currentGameAreaHeight = isLandscape ? height * 0.35 : height * 0.40;
            const currentHeroTop = isLandscape ? 20 : Math.min(currentGameAreaHeight - currentHeroSize - 30, 180);
            // 怪物与英雄中心对齐
            const currentMonsterTop = currentHeroTop + (currentHeroSize - currentSpriteSize) / 2;

            // 计算火球起点（英雄中心）
            const heroX = width * 0.08 + currentHeroSize / 2;
            const heroY = currentHeroTop + currentHeroSize / 2;

            // 直接获取 Animated.Value 的当前值
            const currentProgressValue = (monsterProgress as any)._value ?? 0;

            // 计算怪物当前位置（与 interpolate 公式一致）
            const monsterCurrentX = width * 0.7 - currentProgressValue * (width * 0.7 - width * 0.2) + currentSpriteSize / 2;
            const monsterCurrentY = currentMonsterTop + currentSpriteSize / 2;

            // 播放火球动画，完成后处理伤害
            playFireballAnimation(heroX, heroY, monsterCurrentX, monsterCurrentY, () => {
                const newHp = currentMonster.hp - 1;
                const updatedMonsters = [...monsters];
                updatedMonsters[currentMonsterIndex].hp = newHp;
                setMonsters(updatedMonsters);

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
                    setTimeout(() => startMonsterMovement(), 1000);
                }
            });
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

    // 动态计算尺寸
    const spriteSize = isLandscape ? 80 : 120;
    const heroSize = isLandscape ? 100 : 150;

    // 布局计算 - 优化角色位置
    const gameAreaHeight = isLandscape ? height * 0.35 : height * 0.40;
    const heroTop = isLandscape ? 20 : Math.min(gameAreaHeight - heroSize - 30, 180);
    // 怪物与英雄中心对齐：monsterTop + spriteSize/2 = heroTop + heroSize/2
    const monsterTop = heroTop + (heroSize - spriteSize) / 2;

    // 怪物的X位置 (0=右侧, 1=左侧靠近英雄)
    const monsterX = monsterProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [width * 0.7, width * 0.2],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* 背景 */}
            <Image
                source={require('../assets/images/jungle_bg.png')}
                style={styles.background}
                resizeMode="cover"
            />

            {/* 游戏区域 - 横屏时减少高度 */}
            <View style={[styles.gameArea, isLandscape && styles.gameAreaLandscape]}>
                {/* 角色 (左侧) */}
                <Animated.View style={[
                    styles.heroContainer,
                    { left: width * 0.08, top: heroTop },
                    {
                        transform: [
                            { rotate: heroRotation.interpolate({
                                inputRange: [-10, 0, 90],
                                outputRange: ['-10deg', '0deg', '90deg'],
                            }) },
                        ],
                    },
                ]}>
                    <Image
                        source={isDying
                            ? require('../assets/images/dino_hero_dead.png')
                            : require('../assets/images/dino_hero_new.png')
                        }
                        style={[styles.heroImage, { width: heroSize, height: heroSize }]}
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
                                <Text style={{ fontSize: isLandscape ? 14 : 18 }}>❤️</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* 怪物 (移动中) */}
                {!currentMonster?.defeated && currentChar && (
                    <Animated.View
                        style={[
                            styles.monsterContainer,
                            { left: monsterX, top: monsterTop },
                        ]}
                    >
                        <Image
                            source={MONSTER_SPRITES[currentMonster.spriteIndex]}
                            style={[styles.monsterImage, { width: spriteSize, height: spriteSize }]}
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

                {/* 火球动画 */}
                {isAttacking && (
                    <Animated.Image
                        source={require('../assets/images/fireball.png')}
                        style={[
                            styles.fireball,
                            {
                                transform: [
                                    { translateX: fireballX },
                                    { translateY: fireballY },
                                ],
                                opacity: fireballOpacity,
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}

                {/* 暂停按钮 */}
                {!gameOver && !victory && !isPaused && (
                    <TouchableOpacity
                        style={styles.pauseButton}
                        onPress={handlePause}
                        testID="pause-button"
                        accessibilityLabel="暂停"
                    >
                        <Text style={styles.pauseButtonText}>⏸️</Text>
                    </TouchableOpacity>
                )}

                {/* 暂停覆盖层 */}
                {isPaused && (
                    <View style={styles.pauseOverlay}>
                        <View style={styles.pauseModal}>
                            <Text style={styles.pauseTitle}>游戏暂停</Text>
                            <TouchableOpacity
                                style={styles.pauseMenuButton}
                                onPress={handleResume}
                            >
                                <Text style={styles.pauseMenuButtonText}>继续游戏</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pauseMenuButton, styles.pauseExitButton]}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.pauseMenuButtonText}>退出关卡</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* 底部UI区 - 横屏时增加高度 */}
            <View style={[styles.bottomUI, isLandscape && styles.bottomUILandscape]}>
                {/* 听写提示 (拼音 + 组词) */}
                {currentChar && !victory && !gameOver && (
                    <View style={styles.charInfo}>
                        <TouchableOpacity
                            style={styles.dictationHint}
                            onPress={handleSpeakerPress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dictationText}>
                                {/* 用拼音替换目标字，比如"两个" → "liang个" */}
                                {currentChar.word.replace(currentChar.char, currentChar.pinyin)}
                            </Text>
                            <Text style={styles.speakerIcon}>🔊</Text>
                        </TouchableOpacity>
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

                            {/* 中间田字格 + 答案覆盖层 */}
                            <View style={styles.writingPadContainer}>
                                <WritingPad
                                    targetChar={currentChar.char}
                                    onComplete={handleWritingComplete}
                                    disabled={!writingEnabled || showingAnswer}
                                />
                                {/* 显示答案覆盖层 */}
                                {showingAnswer && (
                                    <View style={styles.answerOverlay}>
                                        <Text style={styles.answerText}>{currentChar.char}</Text>
                                        <Text style={styles.answerHint}>-1 ❤️</Text>
                                    </View>
                                )}
                            </View>

                            {/* 右侧按钮 */}
                            <TouchableOpacity
                                style={styles.sideButton}
                                onPress={handleSkip}
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
                        <Text style={styles.resultText}>先去学习一下吧！</Text>
                        <View style={styles.resultButtons}>
                            <TouchableOpacity
                                style={[styles.nextButton, styles.learnButton]}
                                onPress={() => router.replace({ pathname: '/learning', params: { levelId } })}
                            >
                                <Text style={styles.nextButtonText}>去学习</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.nextButton, styles.backButton]}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.nextButtonText}>返回</Text>
                            </TouchableOpacity>
                        </View>
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
        flex: 0.40,
        position: 'relative',
    },
    gameAreaLandscape: {
        flex: 0.35,
    },
    heroContainer: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    heroImage: {
        backgroundColor: 'transparent',
    },
    hpBar: {
        flexDirection: 'row',
        marginTop: 4,
    },
    hpHeart: {
        marginHorizontal: 2,
    },
    monsterContainer: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    monsterImage: {
        backgroundColor: 'transparent',
    },
    monsterHpBar: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 4,
    },
    hpBlock: {
        width: 20,
        height: 8,
        borderRadius: 2,
    },
    fireball: {
        position: 'absolute',
        width: 60,
        height: 60,
        zIndex: 100,
    },
    pauseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    pauseButtonText: {
        fontSize: 24,
    },
    pauseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    pauseModal: {
        backgroundColor: '#2c3e50',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        minWidth: 200,
    },
    pauseTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    pauseMenuButton: {
        backgroundColor: '#27ae60',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 6,
        minWidth: 160,
        alignItems: 'center',
    },
    pauseExitButton: {
        backgroundColor: '#e74c3c',
    },
    pauseMenuButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomUI: {
        flex: 0.60,
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomUILandscape: {
        flex: 0.65,
        paddingVertical: 4,
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 16,
    },
    writingPadContainer: {
        position: 'relative',
    },
    answerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(231, 76, 60, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    answerText: {
        fontSize: 120,
        color: '#fff',
        fontWeight: 'bold',
    },
    answerHint: {
        fontSize: 24,
        color: '#fff',
        marginTop: 8,
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
    resultButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    learnButton: {
        backgroundColor: '#9b59b6',
    },
    backButton: {
        backgroundColor: '#34495e',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
});
