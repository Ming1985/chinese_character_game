// 音效类型枚举
export enum SoundEffect {
  CORRECT = 'correct',           // 书写正确
  WRONG = 'wrong',               // 书写错误
  HIT = 'hit',                   // 命中怪物（未击败）
  MONSTER_DEFEAT = 'defeat',     // 击败小怪物
  BOSS_HURT = 'boss_hurt',       // Boss受伤
  VICTORY = 'victory',           // 关卡胜利
}

// 背景音乐枚举（预留）
export enum BackgroundMusic {
  BATTLE = 'battle',
  MENU = 'menu',
}

// 音频配置接口
export interface AudioConfig {
  enableSoundEffects: boolean;  // 音效开关
  enableMusic: boolean;          // 背景音乐开关
  enablePinyin: boolean;         // 语音朗读开关
  soundVolume: number;           // 音效音量 (0.0 - 1.0)
  musicVolume: number;           // 音乐音量 (0.0 - 1.0)
  pinyinVolume: number;          // 语音朗读音量 (0.0 - 1.0)
  voiceSpeed: number;            // 语音语速 (1-5, 映射到 TTS 0-15)
}

// TTS 朗读选项
export interface TTSOptions {
  speed?: number;   // 0-15, 默认根据 config.voiceSpeed
  pitch?: number;   // 0-15, 默认 5
}

// 音频资源定义
export interface SoundAsset {
  key: SoundEffect | BackgroundMusic;
  path: any;  // require() 返回值
  type: 'effect' | 'music';
}
