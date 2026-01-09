import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { getAudioService } from '../src/lib/audioService';
import { saveSetting, getAllSettings } from '../src/lib/database';

// 设置键名
const SETTINGS_KEYS = {
    ENABLE_SOUND: 'enableSoundEffects',
    ENABLE_VOICE: 'enablePinyin',
    VOICE_VOLUME: 'pinyinVolume',
    VOICE_SPEED: 'voiceSpeed',
};

export default function SettingsScreen() {
    const [enableSound, setEnableSound] = useState(true);
    const [enableVoice, setEnableVoice] = useState(true);
    const [voiceVolume, setVoiceVolume] = useState(80); // 0-100
    const [voiceSpeed, setVoiceSpeed] = useState(3);    // 1-5

    // 加载设置
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getAllSettings();
            const sound = settings[SETTINGS_KEYS.ENABLE_SOUND] !== undefined
                ? settings[SETTINGS_KEYS.ENABLE_SOUND] === 'true' : true;
            const voice = settings[SETTINGS_KEYS.ENABLE_VOICE] !== undefined
                ? settings[SETTINGS_KEYS.ENABLE_VOICE] === 'true' : true;
            const volume = settings[SETTINGS_KEYS.VOICE_VOLUME] !== undefined
                ? parseInt(settings[SETTINGS_KEYS.VOICE_VOLUME]) : 80;
            const speed = settings[SETTINGS_KEYS.VOICE_SPEED] !== undefined
                ? parseInt(settings[SETTINGS_KEYS.VOICE_SPEED]) : 3;

            setEnableSound(sound);
            setEnableVoice(voice);
            setVoiceVolume(volume);
            setVoiceSpeed(speed);

            // 立即应用加载的设置
            applyConfig(sound, voice, volume, speed);
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    };

    // 应用配置到 AudioService（直接传值，不依赖 state）
    const applyConfig = (sound: boolean, voice: boolean, volume: number, speed: number) => {
        const audio = getAudioService();
        audio.updateConfig({
            enableSoundEffects: sound,
            enablePinyin: voice,
            pinyinVolume: volume / 100,
            voiceSpeed: speed,
        });
    };

    // 切换音效开关
    const toggleSound = async (value: boolean) => {
        setEnableSound(value);
        applyConfig(value, enableVoice, voiceVolume, voiceSpeed);
        await saveSetting(SETTINGS_KEYS.ENABLE_SOUND, value.toString());
    };

    // 切换语音开关
    const toggleVoice = async (value: boolean) => {
        setEnableVoice(value);
        applyConfig(enableSound, value, voiceVolume, voiceSpeed);
        await saveSetting(SETTINGS_KEYS.ENABLE_VOICE, value.toString());
    };

    // 调整音量
    const adjustVolume = async (delta: number) => {
        const newVolume = Math.max(0, Math.min(100, voiceVolume + delta));
        setVoiceVolume(newVolume);
        applyConfig(enableSound, enableVoice, newVolume, voiceSpeed);
        await saveSetting(SETTINGS_KEYS.VOICE_VOLUME, newVolume.toString());
    };

    // 调整语速
    const adjustSpeed = async (delta: number) => {
        const newSpeed = Math.max(1, Math.min(5, voiceSpeed + delta));
        setVoiceSpeed(newSpeed);
        applyConfig(enableSound, enableVoice, voiceVolume, newSpeed);
        await saveSetting(SETTINGS_KEYS.VOICE_SPEED, newSpeed.toString());
    };

    // 测试语音
    const testVoice = () => {
        const audio = getAudioService();
        audio.speakText('你好').catch(console.error);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>设置</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* 音效设置 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>音效</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>游戏音效</Text>
                        <Switch
                            value={enableSound}
                            onValueChange={toggleSound}
                            trackColor={{ false: '#333', true: '#27ae60' }}
                            thumbColor={enableSound ? '#fff' : '#888'}
                        />
                    </View>
                </View>

                {/* 语音设置 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>语音</Text>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>语音朗读</Text>
                        <Switch
                            value={enableVoice}
                            onValueChange={toggleVoice}
                            trackColor={{ false: '#333', true: '#27ae60' }}
                            thumbColor={enableVoice ? '#fff' : '#888'}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>音量</Text>
                        <View style={styles.adjustRow}>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => adjustVolume(-10)}
                            >
                                <Text style={styles.adjustButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.valueText}>{voiceVolume}%</Text>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => adjustVolume(10)}
                            >
                                <Text style={styles.adjustButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>语速</Text>
                        <View style={styles.adjustRow}>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => adjustSpeed(-1)}
                            >
                                <Text style={styles.adjustButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.valueText}>
                                {['很慢', '较慢', '正常', '较快', '很快'][voiceSpeed - 1]}
                            </Text>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => adjustSpeed(1)}
                            >
                                <Text style={styles.adjustButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 测试按钮 */}
                    <TouchableOpacity style={styles.testButton} onPress={testVoice}>
                        <Text style={styles.testButtonText}>测试语音</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        justifyContent: 'space-between',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#eee',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    settingLabel: {
        fontSize: 16,
        color: '#eee',
    },
    adjustRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adjustButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adjustButtonText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    valueText: {
        fontSize: 16,
        color: '#f39c12',
        minWidth: 60,
        textAlign: 'center',
    },
    testButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
