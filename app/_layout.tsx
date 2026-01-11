import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { useEffect } from 'react';
import { initOCRService } from '../src/lib/ocrService';
import { OCR_CONFIG } from '../src/config/ocr';
import { initAudioService, getAudioService } from '../src/lib/audioService';

export default function RootLayout() {
    useEffect(() => {
        // 初始化 OCR 服务
        initOCRService(OCR_CONFIG);

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
                <Stack.Screen name="settings" />
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
