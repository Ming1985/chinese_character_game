import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { useEffect } from 'react';
import { initOCRService, initLocalOCRService, setOCRProvider } from '../src/lib/ocrService';
import { OCR_CONFIG, LOCAL_OCR_CONFIG, OCR_PROVIDER } from '../src/config/ocr';
import { initAudioService, getAudioService } from '../src/lib/audioService';

export default function RootLayout() {
    useEffect(() => {
        // 初始化 OCR 服务
        initOCRService(OCR_CONFIG);
        initLocalOCRService(LOCAL_OCR_CONFIG);
        setOCRProvider(OCR_PROVIDER);
        console.log(`OCR 服务: ${OCR_PROVIDER}`);

        // 初始化音频服务
        initAudioService();
        getAudioService().initialize().catch(console.error);

        // 清理音频资源
        return () => {
            getAudioService().cleanup().catch(console.error);
        };
    }, []);

    return (
        <View style={styles.container}>
            {Platform.OS !== 'web' && <StatusBar style="light" />}
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#1a1a2e' },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="textbooks" />
                <Stack.Screen name="levels" />
                <Stack.Screen name="characters" />
                <Stack.Screen name="battle" />
                <Stack.Screen name="battle-v2" />
                <Stack.Screen name="review" />
                <Stack.Screen name="report" />
                <Stack.Screen name="daily-detail" />
                <Stack.Screen name="mini-games" />
                <Stack.Screen name="similar-char-game" />
                <Stack.Screen name="word-builder-game" />
                <Stack.Screen name="learning" />
                <Stack.Screen name="shop" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="game-test" />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
});
