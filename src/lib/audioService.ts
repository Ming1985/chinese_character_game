import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { SoundEffect, BackgroundMusic, AudioConfig, SoundAsset } from './audioTypes';
import { OCR_CONFIG } from '../config/ocr';

// 音频资源映射（占位路径，等待音效文件下载后更新）
const SOUND_ASSETS: SoundAsset[] = [
  // { key: SoundEffect.CORRECT, path: require('../../assets/sounds/effects/correct.mp3'), type: 'effect' },
  // { key: SoundEffect.WRONG, path: require('../../assets/sounds/effects/wrong.mp3'), type: 'effect' },
  // { key: SoundEffect.HIT, path: require('../../assets/sounds/effects/hit.mp3'), type: 'effect' },
  // { key: SoundEffect.MONSTER_DEFEAT, path: require('../../assets/sounds/effects/defeat.mp3'), type: 'effect' },
  // { key: SoundEffect.BOSS_HURT, path: require('../../assets/sounds/effects/boss-hurt.mp3'), type: 'effect' },
  // { key: SoundEffect.VICTORY, path: require('../../assets/sounds/effects/victory.mp3'), type: 'effect' },
];

// 百度 TTS API 配置
const BAIDU_TTS_URL = 'https://tsn.baidu.com/text2audio';

class AudioService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private backgroundMusic: Audio.Sound | null = null;
  private config: AudioConfig = {
    enableSoundEffects: true,
    enableMusic: false,
    enablePinyin: true,  // 默认开启拼音朗读
    soundVolume: 0.7,
    musicVolume: 0.3,
    pinyinVolume: 0.8,
  };
  private isInitialized = false;
  private accessToken: string | null = null;  // 百度 TTS Access Token

  // 初始化音频系统
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // iOS/Android 音频模式设置
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,  // iOS 静音模式下也播放
          staysActiveInBackground: false,
          shouldDuckAndroid: true,      // Android 降低其他音频音量
        });
      }

      // 预加载所有音效
      await this.preloadSounds();

      // 获取百度 TTS Access Token
      await this.refreshAccessToken();

      this.isInitialized = true;
      console.log('✅ AudioService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioService:', error);
    }
  }

  // 预加载音效
  private async preloadSounds(): Promise<void> {
    if (SOUND_ASSETS.length === 0) {
      console.warn('⚠️  No sound assets to load (waiting for audio files)');
      return;
    }

    const loadPromises = SOUND_ASSETS.map(async (asset) => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          asset.path,
          {
            shouldPlay: false,
            volume: asset.type === 'effect' ? this.config.soundVolume : this.config.musicVolume,
          }
        );
        this.sounds.set(asset.key, sound);
        console.log(`✅ Loaded sound: ${asset.key}`);
      } catch (error) {
        console.warn(`❌ Failed to load sound: ${asset.key}`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  // 播放音效
  async playSoundEffect(effect: SoundEffect): Promise<void> {
    if (!this.config.enableSoundEffects) return;

    const sound = this.sounds.get(effect);
    if (!sound) {
      console.warn(`⚠️  Sound not loaded: ${effect}`);
      return;
    }

    try {
      // 重置到开头并播放
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error(`❌ Failed to play sound: ${effect}`, error);
    }
  }

  // 播放背景音乐
  async playBackgroundMusic(music: BackgroundMusic): Promise<void> {
    if (!this.config.enableMusic) return;

    // 停止当前音乐
    await this.stopBackgroundMusic();

    const sound = this.sounds.get(music);
    if (!sound) {
      console.warn(`⚠️  Music not loaded: ${music}`);
      return;
    }

    try {
      this.backgroundMusic = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (error) {
      console.error(`❌ Failed to play music: ${music}`, error);
    }
  }

  // 停止背景音乐
  async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.stopAsync();
        this.backgroundMusic = null;
      } catch (error) {
        console.error('❌ Failed to stop background music:', error);
      }
    }
  }

  // 获取百度 Access Token
  private async refreshAccessToken(): Promise<void> {
    try {
      const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${OCR_CONFIG.apiKey}&client_secret=${OCR_CONFIG.secretKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        console.log('✅ Baidu TTS Access Token obtained');
      } else {
        console.error('❌ Failed to get Baidu TTS token:', data);
      }
    } catch (error) {
      console.error('❌ Failed to refresh Baidu TTS token:', error);
    }
  }

  // 朗读拼音（百度 TTS）
  async speakPinyin(pinyin: string): Promise<void> {
    if (!this.config.enablePinyin || !pinyin) return;

    if (!this.accessToken) {
      console.warn('⚠️  Baidu TTS Access Token not available');
      return;
    }

    try {
      // 构建 TTS 请求 URL
      const text = encodeURIComponent(pinyin);
      const ttsUrl = `${BAIDU_TTS_URL}?tex=${text}&tok=${this.accessToken}&cuid=hanzi_game&ctp=1&lan=zh&spd=5&pit=5&vol=5&per=0&aue=3`;

      // 创建并播放音频
      const { sound } = await Audio.Sound.createAsync(
        { uri: ttsUrl },
        {
          shouldPlay: true,
          volume: this.config.pinyinVolume,
        }
      );

      // 播放完成后自动卸载
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(console.error);
        }
      });

      console.log(`🔊 Speaking pinyin: ${pinyin}`);
    } catch (error) {
      console.error(`❌ Failed to speak pinyin: ${pinyin}`, error);
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 更新所有已加载音效的音量
    this.sounds.forEach((sound, key) => {
      const asset = SOUND_ASSETS.find(a => a.key === key);
      if (asset?.type === 'effect') {
        sound.setVolumeAsync(this.config.soundVolume).catch(console.error);
      } else if (asset?.type === 'music') {
        sound.setVolumeAsync(this.config.musicVolume).catch(console.error);
      }
    });
  }

  // 清理资源
  async cleanup(): Promise<void> {
    await this.stopBackgroundMusic();

    const unloadPromises = Array.from(this.sounds.values()).map(sound =>
      sound.unloadAsync().catch(console.error)
    );

    await Promise.all(unloadPromises);
    this.sounds.clear();
    this.isInitialized = false;
    this.accessToken = null;
    console.log('🧹 AudioService cleanup complete');
  }

  // 获取当前配置
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // 检查是否已初始化
  isReady(): boolean {
    return this.isInitialized;
  }
}

// 单例实例
let audioServiceInstance: AudioService | null = null;

// 初始化音频服务
export function initAudioService(): void {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
}

// 获取音频服务实例
export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    throw new Error('AudioService not initialized. Call initAudioService() first.');
  }
  return audioServiceInstance;
}

export { AudioService };
