# 汉字小勇士 - 项目说明

## 项目概述

iPad/iPhone 汉字书写学习应用，通过游戏化方式帮助小学生（1-2年级）练习汉字书写。

核心玩法：用户在田字格中书写汉字，正确书写可攻击怪物；写错则怪物回血。每关分怪物阶段和 Boss 阶段。

## 技术栈

- **框架**: React Native + Expo SDK 54
- **路由**: expo-router 4
- **书写**: react-native-svg + react-native-view-shot
- **OCR**: 百度 OCR API（手写识别）
- **语言**: TypeScript

## 项目结构

```
app/                    # 页面路由 (Expo Router)
  _layout.tsx          # 根布局
  index.tsx            # 首页
  textbooks.tsx        # 课本选择
  levels.tsx           # 关卡选择
  battle.tsx           # 战斗/书写主界面
  characters.tsx       # 生字预览
  review.tsx           # 复习模式
src/
  components/          # UI 组件
    WritingPad.tsx     # 田字格书写（核心，含 OCR）
    GameSprites.tsx    # 游戏精灵（怪物、Boss、英雄）
  data/                # 字库数据
    index.ts           # 数据导出和查询函数
    grade1-up.ts       # 一年级上册
    grade1-down.ts     # 一年级下册
    grade2-up.ts       # 二年级上册（写字表 250 字）
    grade2-down.ts     # 二年级下册
  types/               # TypeScript 类型
    index.ts           # Character, Level, Textbook 等
```

## 开发命令

```bash
npm start          # 启动 Expo (按 i 打开 iOS 模拟器)
npx tsc --noEmit   # 类型检查
```

## 核心类型

```typescript
interface Character {
  id: string;
  char: string;           // 汉字
  pinyin: string;         // 拼音
  word: string;           // 组词1
  wordPinyin: string;
  word2?: string;         // 组词2（第二次书写）
  word2Pinyin?: string;
  hint: string;           // 提示
  grade: number;          // 年级
  semester: 'up' | 'down'; // 学期
  lesson: number;         // 课次
  strokeCount: number;    // 笔画数
}

interface Textbook {
  id: string;             // 如 'g2-up'
  grade: number;
  semester: 'up' | 'down';
  name: string;           // 如 '二年级上册'
  totalLessons: number;
}
```

## 数据查询 API

```typescript
import { 
  TEXTBOOKS,
  getCharactersByTextbook,
  getCharactersByLesson,
  getLevelsByTextbook,
  getCharactersByLevelId 
} from './src/data';
```

## 游戏机制

1. **怪物阶段**: 每个生字对应一只怪物（2HP），写对扣血，写错回满血
2. **Boss 阶段**: 挑选 3 个错误率最高的字，连续答对 3 次击败 Boss
3. **生命**: 3 条命，连续错 3 次扣 1 命
4. **每字写两次**: 使用不同组词（word 和 word2）

## 字库来源

- 人教版语文教材**写字表**（需要会写的字）
- 二年级上册：29 课，250 字
- 关卡名称格式：`课文1 小蝌蚪找妈妈`、`识字2 树`

## OCR 配置

百度 OCR API 配置在 `WritingPad.tsx` 中：
```typescript
const BAIDU_API_KEY = '...';
const BAIDU_SECRET_KEY = '...';
```

## 响应式设计

支持 iPhone / iPad / iPad Pro，根据屏幕宽度动态调整：
- iPhone: PAD_SIZE = 260px
- iPad: PAD_SIZE = 340px
- iPad Pro: PAD_SIZE = 400px

## 当前状态

已完成：
- [x] 课本 → 关卡导航
- [x] 田字格书写 + OCR 识别
- [x] 战斗系统（怪物 + Boss）
- [x] 响应式布局
- [x] 二年级上册完整字库（写字表）

待实现：
- [ ] 其他年级写字表数据
- [ ] 数据持久化（学习进度）
- [ ] 语音提示
- [ ] 间隔重复复习

## npm 镜像

```bash
npm config set registry https://registry.npmmirror.com
```
