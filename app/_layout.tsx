import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { initOCRService } from '../src/lib/ocrService';
import { OCR_CONFIG } from '../src/config/ocr';

export default function RootLayout() {
    useEffect(() => {
        initOCRService(OCR_CONFIG);
    }, []);
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#1a1a2e' },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="levels" />
                <Stack.Screen name="characters" />
                <Stack.Screen name="battle" />
                <Stack.Screen name="review" />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
