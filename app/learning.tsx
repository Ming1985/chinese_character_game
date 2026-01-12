import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Character } from '../src/types';
import { getCharactersByLevelId } from '../src/data';
import WritingPad, { WritingPadRef } from '../src/components/WritingPad';
import { getAudioService } from '../src/lib/audioService';
import {
    getLearningProgress,
    saveLearningProgress,
    clearLearningProgress,
    addMeat,
    getTotalMeat,
    getLevelProgress,
    LearningProgress,
} from '../src/lib/database';

type LearningStage = 'tracing' | 'dictation' | 'correction';
const TRACING_REQUIRED = 3;   // 临摹需要正确3次
const DICTATION_REQUIRED = 3; // 默写需要正确3次

export default function LearningScreen() {
    const params = useLocalSearchParams();
    const levelId = params.levelId as string;
    const { height } = useWindowDimensions();

    // 状态
    const [characters, setCharacters] = useState<Character[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stage, setStage] = useState<LearningStage>('tracing');
    const [correctCount, setCorrectCount] = useState(0);
    const [totalMeat, setTotalMeat] = useState(0);
    const [earnedMeatThisSession, setEarnedMeatThisSession] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedProgress, setSavedProgress] = useState<LearningProgress | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'stage'; message: string } | null>(null);

    // 肉腿掉落动画
    const [showMeatDrop, setShowMeatDrop] = useState(false);
    const meatY = useRef(new Animated.Value(-100)).current;
    const meatOpacity = useRef(new Animated.Value(0)).current;

    // 礼花动画
    const [showCelebration, setShowCelebration] = useState(false);
    const celebrationScale = useRef(new Animated.Value(0)).current;

    const writingPadRef = useRef<WritingPadRef>(null);

    // 初始化
    useEffect(() => {
        const init = async () => {
            const chars = getCharactersByLevelId(levelId);

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

            const meat = await getTotalMeat();
            setTotalMeat(meat);

            // 检查是否有保存的进度
            const progress = await getLearningProgress(levelId);
            if (progress && progress.characterIndex < sortedChars.length) {
                setSavedProgress(progress);
                setShowResumeModal(true);
            }
        };
        init();
    }, [levelId]);

    // 恢复进度
    const handleResume = () => {
        if (savedProgress) {
            setCurrentIndex(savedProgress.characterIndex);
            setStage(savedProgress.stage);
            setCorrectCount(savedProgress.correctCount);
            setEarnedMeatThisSession(savedProgress.earnedMeat);
        }
        setShowResumeModal(false);
    };

    // 重新开始
    const handleRestart = async () => {
        await clearLearningProgress(levelId);
        setShowResumeModal(false);
    };

    // 保存进度
    const saveProgress = useCallback(async () => {
        await saveLearningProgress({
            levelId,
            characterIndex: currentIndex,
            stage: stage === 'correction' ? 'dictation' : stage,
            correctCount,
            earnedMeat: earnedMeatThisSession,
            lastUpdated: Date.now(),
        });
    }, [levelId, currentIndex, stage, correctCount, earnedMeatThisSession]);

    // 当前学习的字
    const currentChar = characters[currentIndex];

    // 播放肉腿掉落动画
    const playMeatDropAnimation = () => {
        meatY.setValue(-100);
        meatOpacity.setValue(1);
        setShowMeatDrop(true);

        Animated.sequence([
            Animated.timing(meatY, {
                toValue: height / 2 - 50,
                duration: 600,
                useNativeDriver: true,
            }),
            // 弹跳效果
            Animated.timing(meatY, {
                toValue: height / 2 - 80,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(meatY, {
                toValue: height / 2 - 50,
                duration: 150,
                useNativeDriver: true,
            }),
            // 淡出
            Animated.timing(meatOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowMeatDrop(false);
        });
    };

    // 播放庆祝动画
    const playCelebration = () => {
        setShowCelebration(true);
        celebrationScale.setValue(0);

        Animated.spring(celebrationScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // 进入下一个字
    const goToNextCharacter = async () => {
        // 增加肉腿
        const newTotal = await addMeat(1);
        setTotalMeat(newTotal);
        setEarnedMeatThisSession(prev => prev + 1);

        // 播放肉腿动画
        playMeatDropAnimation();

        // 检查是否完成所有字
        if (currentIndex + 1 >= characters.length) {
            // 学习完成
            await clearLearningProgress(levelId);
            setTimeout(() => {
                setIsCompleted(true);
                playCelebration();
            }, 1000);
        } else {
            // 进入下一个字
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setStage('tracing');
                setCorrectCount(0);
                setFeedback(null);
            }, 1000);
        }
    };

    // 处理书写完成
    const handleWritingComplete = async (recognizedChar: string, isCorrect: boolean) => {
        const audioService = getAudioService();

        if (stage === 'tracing') {
            // 临摹阶段
            if (isCorrect) {
                const newCount = correctCount + 1;
                setCorrectCount(newCount);

                if (newCount >= TRACING_REQUIRED) {
                    // 进入默写阶段
                    setFeedback({ type: 'stage', message: '临摹完成，开始默写！' });
                    audioService.speakWord('开始默写');
                    setTimeout(() => {
                        setStage('dictation');
                        setCorrectCount(0);
                        setFeedback(null);
                    }, 1500);
                } else {
                    setFeedback({ type: 'correct', message: `正确！(${newCount}/${TRACING_REQUIRED})` });
                    audioService.speakWord('对');
                    setTimeout(() => {
                        setFeedback(null);
                    }, 800);
                }
            } else {
                setFeedback({ type: 'wrong', message: '再试一次' });
                audioService.speakWord('再试');
                setTimeout(() => {
                    setFeedback(null);
                }, 800);
            }
        } else if (stage === 'dictation') {
            // 默写阶段
            if (isCorrect) {
                const newCount = correctCount + 1;
                setCorrectCount(newCount);

                if (newCount >= DICTATION_REQUIRED) {
                    // 完成该字学习
                    setFeedback({ type: 'correct', message: '太棒了！' });
                    audioService.speakWord('太棒了');
                    goToNextCharacter();
                } else {
                    setFeedback({ type: 'correct', message: `正确！(${newCount}/${DICTATION_REQUIRED})` });
                    audioService.speakWord('对');
                    setTimeout(() => {
                        setFeedback(null);
                    }, 800);
                }
            } else {
                // 默写错误，进入纠错模式
                setFeedback({ type: 'wrong', message: '看着字写一遍' });
                audioService.speakWord('看着写');
                setTimeout(() => {
                    setStage('correction');
                    setFeedback(null);
                }, 1000);
            }
        } else if (stage === 'correction') {
            // 纠错模式
            if (isCorrect) {
                setFeedback({ type: 'correct', message: '好，继续默写' });
                audioService.speakWord('继续默写');
                setTimeout(() => {
                    setStage('dictation');
                    setFeedback(null);
                }, 1000);
            } else {
                setFeedback({ type: 'wrong', message: '再试一次' });
                audioService.speakWord('再试');
                setTimeout(() => {
                    setFeedback(null);
                }, 800);
            }
        }

        // 保存进度
        await saveProgress();
    };

    // 退出确认
    const handleExit = async () => {
        await saveProgress();
        router.back();
    };

    // 渲染完成页面
    if (isCompleted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.completedContainer}>
                    <Animated.View style={[styles.celebrationContainer, { transform: [{ scale: celebrationScale }] }]}>
                        <Text style={styles.celebrationEmoji}>🎉</Text>
                    </Animated.View>
                    <Text style={styles.completedTitle}>学习完成！</Text>
                    <Text style={styles.completedSubtitle}>
                        本次学习了 {characters.length} 个字
                    </Text>
                    <View style={styles.meatEarned}>
                        <Text style={styles.meatEarnedText}>获得肉腿</Text>
                        <Text style={styles.meatEarnedCount}>+{earnedMeatThisSession}</Text>
                    </View>
                    <View style={styles.completedButtons}>
                        <TouchableOpacity
                            style={[styles.completedButton, styles.backButton]}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.completedButtonText}>返回关卡</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.completedButton, styles.battleButton]}
                            onPress={() => router.replace({ pathname: '/battle-v2', params: { levelId } })}
                        >
                            <Text style={styles.completedButtonText}>开始闯关</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // 加载中
    if (!currentChar) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const showDemoChar = stage === 'tracing' || stage === 'correction';
    const stageText = stage === 'tracing' ? '临摹' : stage === 'dictation' ? '默写' : '纠错';
    const requiredCount = stage === 'tracing' ? TRACING_REQUIRED : DICTATION_REQUIRED;

    // 默写提示：将目标字替换为下划线
    const getDictationHint = () => {
        if (!currentChar) return '';
        const word = currentChar.word;
        return word.replace(new RegExp(currentChar.char, 'g'), '___');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitButton}>
                    <Text style={styles.exitButtonText}>← 退出</Text>
                </TouchableOpacity>
                <Text style={styles.progress}>
                    第 {currentIndex + 1}/{characters.length} 字
                </Text>
                <View style={styles.meatDisplay}>
                    <Text style={styles.meatIcon}>🍖</Text>
                    <Text style={styles.meatCount}>{totalMeat}</Text>
                </View>
            </View>

            {/* 主内容区 */}
            <View style={styles.content}>
                {/* 示范字区域 */}
                <View style={styles.demoArea}>
                    {showDemoChar ? (
                        <>
                            <Text style={styles.demoChar}>{currentChar.char}</Text>
                            <Text style={styles.demoPinyin}>{currentChar.pinyin}</Text>
                            <Text style={styles.demoWord}>{currentChar.word}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.hiddenChar}>?</Text>
                            <Text style={styles.demoPinyin}>{currentChar.pinyin}</Text>
                            <Text style={styles.demoHint}>{getDictationHint()}</Text>
                        </>
                    )}
                </View>

                {/* 书写区域 */}
                <View style={styles.writingArea}>
                    <WritingPad
                        ref={writingPadRef}
                        targetChar={currentChar.char}
                        onComplete={handleWritingComplete}
                    />
                </View>

                {/* 进度指示 */}
                <View style={styles.stageIndicator}>
                    <Text style={[
                        styles.stageText,
                        stage === 'correction' && styles.stageTextCorrection
                    ]}>
                        {stageText}
                    </Text>
                    <View style={styles.progressDots}>
                        {Array.from({ length: requiredCount }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progressDot,
                                    i < correctCount && styles.progressDotFilled
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* 反馈 */}
                {feedback && (
                    <View style={[
                        styles.feedbackContainer,
                        feedback.type === 'correct' && styles.feedbackCorrect,
                        feedback.type === 'wrong' && styles.feedbackWrong,
                        feedback.type === 'stage' && styles.feedbackStage,
                    ]}>
                        <Text style={styles.feedbackText}>{feedback.message}</Text>
                    </View>
                )}
            </View>

            {/* 肉腿掉落动画 */}
            {showMeatDrop && (
                <Animated.View
                    style={[
                        styles.meatDrop,
                        {
                            transform: [{ translateY: meatY }],
                            opacity: meatOpacity,
                        }
                    ]}
                    pointerEvents="none"
                >
                    <Text style={styles.meatDropEmoji}>🍖</Text>
                </Animated.View>
            )}

            {/* 退出确认弹窗 */}
            <Modal visible={showExitModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>退出学习？</Text>
                        <Text style={styles.modalText}>进度已保存，下次可继续</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowExitModal(false)}
                            >
                                <Text style={styles.modalButtonText}>继续学习</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleExit}
                            >
                                <Text style={styles.modalButtonText}>退出</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 恢复进度弹窗 */}
            <Modal visible={showResumeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>发现未完成的学习</Text>
                        <Text style={styles.modalText}>
                            上次学到第 {(savedProgress?.characterIndex ?? 0) + 1} 个字
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={handleRestart}
                            >
                                <Text style={styles.modalButtonText}>重新开始</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleResume}
                            >
                                <Text style={styles.modalButtonText}>继续学习</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
    },

    // 头部
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    exitButton: {
        padding: 8,
    },
    exitButtonText: {
        color: '#f39c12',
        fontSize: 16,
    },
    progress: {
        fontSize: 18,
        color: '#eee',
        fontWeight: '600',
    },
    meatDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f3460',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    meatIcon: {
        fontSize: 20,
        marginRight: 4,
    },
    meatCount: {
        fontSize: 16,
        color: '#f39c12',
        fontWeight: '600',
    },

    // 主内容
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },

    // 示范字区域
    demoArea: {
        alignItems: 'center',
        marginBottom: 20,
    },
    demoChar: {
        fontSize: 100,
        color: '#fff',
        fontWeight: 'bold',
    },
    hiddenChar: {
        fontSize: 100,
        color: '#444',
        fontWeight: 'bold',
    },
    demoPinyin: {
        fontSize: 24,
        color: '#888',
        marginTop: 8,
    },
    demoWord: {
        fontSize: 20,
        color: '#f39c12',
        marginTop: 8,
    },
    demoHint: {
        fontSize: 18,
        color: '#9b59b6',
        marginTop: 8,
    },

    // 书写区域
    writingArea: {
        marginVertical: 20,
    },

    // 进度指示
    stageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    stageText: {
        fontSize: 18,
        color: '#27ae60',
        fontWeight: '600',
        marginRight: 12,
    },
    stageTextCorrection: {
        color: '#e74c3c',
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
    },
    progressDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#0f3460',
        borderWidth: 2,
        borderColor: '#27ae60',
    },
    progressDotFilled: {
        backgroundColor: '#27ae60',
    },

    // 反馈
    feedbackContainer: {
        position: 'absolute',
        bottom: 100,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    feedbackCorrect: {
        backgroundColor: 'rgba(39, 174, 96, 0.9)',
    },
    feedbackWrong: {
        backgroundColor: 'rgba(231, 76, 60, 0.9)',
    },
    feedbackStage: {
        backgroundColor: 'rgba(155, 89, 182, 0.9)',
    },
    feedbackText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    // 肉腿掉落
    meatDrop: {
        position: 'absolute',
        left: '50%',
        marginLeft: -40,
        zIndex: 100,
    },
    meatDropEmoji: {
        fontSize: 80,
    },

    // 完成页面
    completedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    celebrationContainer: {
        marginBottom: 20,
    },
    celebrationEmoji: {
        fontSize: 100,
    },
    completedTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    completedSubtitle: {
        fontSize: 18,
        color: '#888',
        marginBottom: 24,
    },
    meatEarned: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f3460',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    meatEarnedText: {
        fontSize: 20,
        color: '#eee',
        marginRight: 12,
    },
    meatEarnedCount: {
        fontSize: 28,
        color: '#f39c12',
        fontWeight: 'bold',
    },
    completedButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    completedButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    backButton: {
        backgroundColor: '#0f3460',
    },
    battleButton: {
        backgroundColor: '#27ae60',
    },
    completedButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    // 弹窗
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#16213e',
        borderRadius: 20,
        padding: 24,
        width: '80%',
        maxWidth: 360,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    modalButtonCancel: {
        backgroundColor: '#0f3460',
    },
    modalButtonConfirm: {
        backgroundColor: '#9b59b6',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
