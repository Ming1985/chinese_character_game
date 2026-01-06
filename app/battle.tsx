import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect, useMemo } from 'react';
import WritingPad from '../src/components/WritingPad';
import { MonsterSprite, BossSprite, HeroSprite, DefeatedMark } from '../src/components/GameSprites';
import { GameState, MonsterState, Character, GamePhase } from '../src/types';
import { getCharactersByLevelId } from '../src/data';

const MAX_MONSTERS = 8;
const MONSTER_HP = 2;
const BOSS_HP = 3;

// 响应式尺寸
function getResponsiveSizes(screenWidth: number) {
    const isIPad = screenWidth >= 768;
    const isIPadPro = screenWidth >= 1024;
    return {
        heroSize: isIPadPro ? 100 : isIPad ? 85 : 70,
        monsterSize: isIPadPro ? 100 : isIPad ? 85 : 70,
        bossSize: isIPadPro ? 130 : isIPad ? 110 : 90,
        cardSize: isIPadPro ? 80 : isIPad ? 70 : 58,
        cardHeight: isIPadPro ? 70 : isIPad ? 60 : 50,
        gridWidth: isIPadPro ? 360 : isIPad ? 320 : 260,
        fontSize: isIPadPro ? 36 : isIPad ? 32 : 28,
        smallMonsterSize: isIPadPro ? 40 : isIPad ? 36 : 28,
        defeatedMarkSize: isIPadPro ? 36 : isIPad ? 32 : 24,
    };
}

export default function BattleScreen() {
    const { levelId } = useLocalSearchParams<{ levelId: string }>();
    const { width: screenWidth } = useWindowDimensions();
    const sizes = getResponsiveSizes(screenWidth);

    // 获取关卡数据
    const allCharacters = levelId ? getCharactersByLevelId(levelId) : [];
    // 限制最多8个小怪物
    const levelCharacters = allCharacters.slice(0, MAX_MONSTERS);

    // 初始化游戏状态
    const [gameState, setGameState] = useState<GameState>(() => initGameState(levelCharacters));
    const [showAnswer, setShowAnswer] = useState(false);
    const [answerChar, setAnswerChar] = useState<Character | null>(null); // 用于显示答案的字
    const [showHint, setShowHint] = useState(false);
    const [message, setMessage] = useState<string>('');

    // 当前要写的字
    const currentChar = useMemo(() => {
        if (gameState.phase === 'monster') {
            return gameState.monsters[gameState.currentMonsterIndex]?.character || null;
        } else if (gameState.phase === 'boss') {
            return gameState.bossCharacters[gameState.bossCharIndex] || null;
        }
        return null;
    }, [gameState]);

    // 当前怪物
    const currentMonster = useMemo(() => {
        if (gameState.phase === 'monster') {
            return gameState.monsters[gameState.currentMonsterIndex] || null;
        }
        return null;
    }, [gameState]);

    // 3秒后隐藏答案
    useEffect(() => {
        if (showAnswer) {
            const timer = setTimeout(() => {
                setShowAnswer(false);
                setAnswerChar(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showAnswer]);

    // 显示消息后自动隐藏
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // 处理书写完成
    const handleWritingComplete = useCallback((recognizedChar: string, isCorrect: boolean) => {
        if (gameState.phase === 'monster') {
            handleMonsterPhase(isCorrect);
        } else if (gameState.phase === 'boss') {
            handleBossPhase(isCorrect);
        }
    }, [gameState]);

    // 小怪物阶段逻辑
    const handleMonsterPhase = (isCorrect: boolean) => {
        const currentIdx = gameState.currentMonsterIndex;
        const monster = gameState.monsters[currentIdx];

        if (isCorrect) {
            const newHp = monster.hp - 1;
            if (newHp <= 0) {
                // 击败小怪物
                setMessage(`击败「${monster.character.char}」怪!`);
                const newMonsters = [...gameState.monsters];
                newMonsters[currentIdx] = { ...monster, hp: 0, defeated: true };

                // Boss掉血
                const newBossHp = gameState.bossHp - 1;

                // 检查是否所有小怪物都被击败
                const allDefeated = newMonsters.every(m => m.defeated);
                if (allDefeated) {
                    // 进入Boss战
                    setTimeout(() => enterBossPhase(newMonsters), 1500);
                    setGameState(prev => ({
                        ...prev,
                        monsters: newMonsters,
                        bossHp: newBossHp,
                    }));
                } else {
                    // 下一个小怪物
                    const nextIdx = findNextMonster(newMonsters, currentIdx);
                    setTimeout(() => {
                        setGameState(prev => ({
                            ...prev,
                            monsters: newMonsters,
                            currentMonsterIndex: nextIdx,
                            bossHp: newBossHp,
                        }));
                    }, 1000);
                }
            } else {
                // 小怪物受伤但未死
                setMessage('命中! 再来一次!');
                const newMonsters = [...gameState.monsters];
                newMonsters[currentIdx] = { ...monster, hp: newHp };
                setGameState(prev => ({ ...prev, monsters: newMonsters }));
            }
        } else {
            // 写错：怪物回满血
            setMessage('写错了! 怪物回血!');
            setAnswerChar(monster.character); // 保存当前字用于显示答案
            setShowAnswer(true);
            const newMonsters = [...gameState.monsters];
            newMonsters[currentIdx] = {
                ...monster,
                hp: monster.maxHp,
                wrongCount: monster.wrongCount + 1,
            };
            setGameState(prev => ({ ...prev, monsters: newMonsters }));
        }
    };

    // 进入Boss战阶段
    const enterBossPhase = (monsters: MonsterState[]) => {
        // 找出最易错的3个字
        const sortedByWrong = [...monsters].sort((a, b) => b.wrongCount - a.wrongCount);
        let bossChars: Character[];

        if (sortedByWrong[0].wrongCount === 0) {
            // 全对，随机抽3个
            const shuffled = [...monsters].sort(() => Math.random() - 0.5);
            bossChars = shuffled.slice(0, 3).map(m => m.character);
        } else {
            // 取错误最多的3个
            bossChars = sortedByWrong.slice(0, 3).map(m => m.character);
        }

        setMessage('Boss战开始! 连续写对3个字击败Boss!');
        setGameState(prev => ({
            ...prev,
            phase: 'boss',
            bossCharacters: bossChars,
            bossCharIndex: 0,
            bossHp: BOSS_HP,
            bossMaxHp: BOSS_HP,
        }));
    };

    // Boss战阶段逻辑
    const handleBossPhase = (isCorrect: boolean) => {
        if (isCorrect) {
            const newBossHp = gameState.bossHp - 1;
            if (newBossHp <= 0) {
                // 击败Boss，胜利
                setMessage('Boss被击败! 关卡完成!');
                setGameState(prev => ({ ...prev, phase: 'victory', bossHp: 0 }));
            } else {
                // Boss受伤，下一个字
                setMessage(`命中Boss! 还剩${newBossHp}下!`);
                const nextIdx = (gameState.bossCharIndex + 1) % gameState.bossCharacters.length;
                setGameState(prev => ({
                    ...prev,
                    bossHp: newBossHp,
                    bossCharIndex: nextIdx,
                }));
            }
        } else {
            // 写错：Boss回满血
            setMessage('写错了! Boss回满血!');
            setAnswerChar(gameState.bossCharacters[gameState.bossCharIndex]); // 保存当前字
            setShowAnswer(true);
            // 重新随机一个字
            const nextIdx = (gameState.bossCharIndex + 1) % gameState.bossCharacters.length;
            setGameState(prev => ({
                ...prev,
                bossHp: BOSS_HP,
                bossCharIndex: nextIdx,
            }));
        }
    };

    // 跳过当前字
    const handleSkip = () => {
        setAnswerChar(currentChar); // 保存当前字用于显示答案
        setShowAnswer(true);
        if (gameState.phase === 'monster') {
            // 跳过算写错
            const currentIdx = gameState.currentMonsterIndex;
            const monster = gameState.monsters[currentIdx];
            const newMonsters = [...gameState.monsters];
            newMonsters[currentIdx] = {
                ...monster,
                hp: monster.maxHp,
                wrongCount: monster.wrongCount + 1,
            };
            setGameState(prev => ({ ...prev, monsters: newMonsters }));
        } else if (gameState.phase === 'boss') {
            // Boss回满血
            const nextIdx = (gameState.bossCharIndex + 1) % gameState.bossCharacters.length;
            setGameState(prev => ({
                ...prev,
                bossHp: BOSS_HP,
                bossCharIndex: nextIdx,
            }));
        }
    };

    // 胜利/失败界面
    if (gameState.phase === 'victory') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.endScreen}>
                    <Text style={styles.victoryText}>恭喜过关!</Text>
                    <Text style={styles.victoryEmoji}>🎉</Text>
                    <TouchableOpacity
                        style={styles.returnButton}
                        onPress={() => router.replace('/levels')}
                    >
                        <Text style={styles.returnButtonText}>返回关卡</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (gameState.phase === 'defeat') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.endScreen}>
                    <Text style={styles.defeatText}>挑战失败</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => setGameState(initGameState(levelCharacters))}
                    >
                        <Text style={styles.retryButtonText}>重新挑战</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.returnButton}
                        onPress={() => router.replace('/levels')}
                    >
                        <Text style={styles.returnButtonText}>返回关卡</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 顶部状态栏 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>← 退出</Text>
                </TouchableOpacity>
                <Text style={styles.phaseText}>
                    {gameState.phase === 'monster' ? '小怪物战' : 'Boss战'}
                </Text>
            </View>

            {/* Boss血条 */}
            <View style={styles.bossHpContainer}>
                <Text style={styles.bossLabel}>
                    {gameState.phase === 'monster' ? '字妖' : 'Boss'}
                </Text>
                <View style={styles.hpBarBg}>
                    <View
                        style={[
                            styles.hpBarFill,
                            {
                                width: `${(gameState.bossHp / gameState.bossMaxHp) * 100}%`,
                                backgroundColor: gameState.phase === 'boss' ? '#e74c3c' : '#e67e22',
                            },
                        ]}
                    />
                </View>
                <Text style={styles.hpText}>{gameState.bossHp}/{gameState.bossMaxHp}</Text>
            </View>

            {/* 战斗场景 */}
            <View style={styles.battleScene}>
                <View style={styles.heroSide}>
                    <HeroSprite size={sizes.heroSize} />
                    <Text style={styles.heroLabel}>勇士</Text>
                </View>
                <View style={styles.enemySide}>
                    {gameState.phase === 'monster' ? (
                        <MonsterSprite size={sizes.monsterSize} hp={currentMonster?.hp} maxHp={currentMonster?.maxHp} />
                    ) : (
                        <BossSprite size={sizes.bossSize} hp={gameState.bossHp} maxHp={gameState.bossMaxHp} />
                    )}
                    <Text style={styles.enemyLabel}>
                        {gameState.phase === 'monster' ? '字妖' : 'Boss'}
                    </Text>
                </View>
            </View>

            {/* 小怪物进度网格（仅小怪物阶段显示） */}
            {gameState.phase === 'monster' && (
                <View style={[styles.monsterGrid, { width: sizes.gridWidth }]}>
                    {gameState.monsters.map((monster, idx) => (
                        <View
                            key={monster.character.id}
                            style={[
                                styles.monsterCard,
                                { width: sizes.cardSize, height: sizes.cardHeight },
                                monster.defeated && styles.monsterDefeated,
                                idx === gameState.currentMonsterIndex && styles.monsterActive,
                            ]}
                        >
                            {monster.defeated ? (
                                <DefeatedMark size={sizes.defeatedMarkSize} />
                            ) : (
                                <MonsterSprite size={sizes.smallMonsterSize} hp={monster.hp} maxHp={monster.maxHp} />
                            )}
                            <View style={styles.monsterHpBar}>
                                {[...Array(monster.maxHp)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.hpDot,
                                            i < monster.hp ? styles.hpDotFull : styles.hpDotEmpty,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* 当前怪物状态（小怪物阶段） */}
            {gameState.phase === 'monster' && currentMonster && (
                <View style={styles.currentMonsterInfo}>
                    <Text style={styles.currentMonsterLabel}>当前目标</Text>
                    <View style={styles.currentMonsterHp}>
                        {[...Array(currentMonster.maxHp)].map((_, i) => (
                            <Text key={i} style={i < currentMonster.hp ? styles.heartFull : styles.heartEmpty}>
                                ❤️
                            </Text>
                        ))}
                    </View>
                </View>
            )}

            {/* Boss战提示 */}
            {gameState.phase === 'boss' && (
                <View style={styles.bossInfo}>
                    <Text style={styles.bossInfoText}>连续写对 {BOSS_HP} 个字击败Boss!</Text>
                </View>
            )}

            {/* 消息提示 */}
            {message ? (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            ) : null}

            {/* 提示区域 */}
            <View style={styles.hintArea}>
                {currentChar && (
                    <>
                        {/* 显示词语，用拼音替代要写的字，如"早chén" */}
                        <Text style={[styles.hintText, { fontSize: sizes.fontSize }]}>
                            {(() => {
                                // Boss战或小怪物HP满时用word，小怪物HP=1时用word2
                                const useSecondWord = gameState.phase === 'monster' &&
                                    currentMonster && currentMonster.hp === 1 && currentChar.word2;
                                const word = useSecondWord ? currentChar.word2! : currentChar.word;
                                // 用拼音替换目标字
                                return word.replace(currentChar.char, currentChar.pinyin);
                            })()}
                        </Text>
                        {/* 点击提示显示描述性提示 */}
                        {showHint && (
                            <Text style={styles.hintDescription}>{currentChar.hint}</Text>
                        )}
                    </>
                )}
            </View>

            {/* 答案展示 */}
            {showAnswer && answerChar && (
                <View style={styles.answerOverlay}>
                    <Text style={styles.answerChar}>{answerChar.char}</Text>
                    <Text style={styles.answerHint}>记住这个字</Text>
                </View>
            )}

            {/* 书写区域 */}
            <View style={styles.writingArea}>
                <WritingPad
                    targetChar={currentChar?.char || ''}
                    onComplete={handleWritingComplete}
                    disabled={showAnswer}
                />
            </View>

            {/* 底部按钮 */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(!showHint)}>
                    <Text style={styles.hintButtonText}>💡 提示</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>不会写</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// 初始化游戏状态
function initGameState(characters: Character[]): GameState {
    const monsters: MonsterState[] = characters.map(char => ({
        character: char,
        hp: MONSTER_HP,
        maxHp: MONSTER_HP,
        defeated: false,
        wrongCount: 0,
    }));

    return {
        phase: 'monster',
        monsters,
        currentMonsterIndex: 0,
        bossHp: monsters.length,
        bossMaxHp: monsters.length,
        lives: 3,
        bossCharacters: [],
        bossCharIndex: 0,
    };
}

// 找下一个未击败的怪物
function findNextMonster(monsters: MonsterState[], currentIdx: number): number {
    for (let i = 1; i <= monsters.length; i++) {
        const idx = (currentIdx + i) % monsters.length;
        if (!monsters[idx].defeated) {
            return idx;
        }
    }
    return currentIdx;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    backText: {
        color: '#f39c12',
        fontSize: 16,
    },
    phaseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bossHpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    bossLabel: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: 'bold',
        width: 50,
    },
    hpBarBg: {
        flex: 1,
        height: 16,
        backgroundColor: '#333',
        borderRadius: 8,
        overflow: 'hidden',
    },
    hpBarFill: {
        height: '100%',
        borderRadius: 8,
    },
    hpText: {
        color: '#fff',
        fontSize: 12,
        width: 40,
        textAlign: 'right',
    },
    battleScene: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    heroSide: {
        alignItems: 'center',
    },
    heroLabel: {
        color: '#27ae60',
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
    enemySide: {
        alignItems: 'center',
    },
    enemyLabel: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
    monsterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        alignSelf: 'center',
    },
    monsterCard: {
        backgroundColor: '#16213e',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0f3460',
    },
    monsterActive: {
        borderColor: '#f39c12',
        backgroundColor: '#1f2d4a',
    },
    monsterDefeated: {
        opacity: 0.5,
        borderColor: '#27ae60',
    },
    monsterHpBar: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
    hpDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    hpDotFull: {
        backgroundColor: '#e74c3c',
    },
    hpDotEmpty: {
        backgroundColor: '#333',
    },
    currentMonsterInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    currentMonsterLabel: {
        color: '#888',
        fontSize: 14,
    },
    currentMonsterHp: {
        flexDirection: 'row',
        gap: 4,
    },
    heartFull: {
        fontSize: 20,
        opacity: 1,
    },
    heartEmpty: {
        fontSize: 20,
        opacity: 0.3,
    },
    bossInfo: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    bossInfoText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        position: 'absolute',
        top: '25%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 5,
    },
    messageText: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#f39c12',
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    hintArea: {
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 4,
    },
    hintText: {
        fontSize: 28,
        color: '#eee',
        fontWeight: '600',
    },
    hintDescription: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        fontStyle: 'italic',
    },
    answerOverlay: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    answerChar: {
        fontSize: 120,
        color: '#f39c12',
        fontWeight: 'bold',
    },
    answerHint: {
        fontSize: 16,
        color: '#aaa',
        marginTop: 8,
    },
    writingArea: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
    },
    hintButton: {
        backgroundColor: '#0f3460',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    hintButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    skipButton: {
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    skipButtonText: {
        color: '#999',
        fontSize: 16,
    },
    endScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    victoryText: {
        fontSize: 36,
        color: '#27ae60',
        fontWeight: 'bold',
    },
    victoryEmoji: {
        fontSize: 80,
    },
    defeatText: {
        fontSize: 36,
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    retryButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    returnButton: {
        backgroundColor: '#0f3460',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    returnButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
