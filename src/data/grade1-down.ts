// 人教版一年级下册生字
import { Character } from '../types';

export const GRADE1_DOWN_CHARACTERS: Character[] = [
    // 识字1：春夏秋冬
    { id: 'g1d-1-1', char: '春', pinyin: 'chūn', word: '春天', wordPinyin: 'chūn tiān', word2: '春风', word2Pinyin: 'chūn fēng', hint: '万物复苏的季节', grade: 1, semester: 'down', lesson: 1, strokeCount: 9 },
    { id: 'g1d-1-2', char: '冬', pinyin: 'dōng', word: '冬天', wordPinyin: 'dōng tiān', word2: '冬雪', word2Pinyin: 'dōng xuě', hint: '最冷的季节', grade: 1, semester: 'down', lesson: 1, strokeCount: 5 },
    { id: 'g1d-1-3', char: '雪', pinyin: 'xuě', word: '下雪', wordPinyin: 'xià xuě', word2: '雪花', word2Pinyin: 'xuě huā', hint: '白白的从天上落下', grade: 1, semester: 'down', lesson: 1, strokeCount: 11 },
    { id: 'g1d-1-4', char: '飞', pinyin: 'fēi', word: '飞机', wordPinyin: 'fēi jī', word2: '飞鸟', word2Pinyin: 'fēi niǎo', hint: '鸟儿在天上', grade: 1, semester: 'down', lesson: 1, strokeCount: 3 },
    { id: 'g1d-1-5', char: '入', pinyin: 'rù', word: '进入', wordPinyin: 'jìn rù', word2: '入口', word2Pinyin: 'rù kǒu', hint: '走进去', grade: 1, semester: 'down', lesson: 1, strokeCount: 2 },

    // 识字2：姓氏歌
    { id: 'g1d-2-1', char: '姓', pinyin: 'xìng', word: '姓名', wordPinyin: 'xìng míng', word2: '百姓', word2Pinyin: 'bǎi xìng', hint: '你叫什么', grade: 1, semester: 'down', lesson: 2, strokeCount: 8 },
    { id: 'g1d-2-2', char: '什', pinyin: 'shén', word: '什么', wordPinyin: 'shén me', hint: '问问题用的', grade: 1, semester: 'down', lesson: 2, strokeCount: 4 },
    { id: 'g1d-2-3', char: '么', pinyin: 'me', word: '什么', wordPinyin: 'shén me', word2: '怎么', word2Pinyin: 'zěn me', hint: '问问题用的', grade: 1, semester: 'down', lesson: 2, strokeCount: 3 },
    { id: 'g1d-2-4', char: '双', pinyin: 'shuāng', word: '双手', wordPinyin: 'shuāng shǒu', word2: '双人', word2Pinyin: 'shuāng rén', hint: '两个', grade: 1, semester: 'down', lesson: 2, strokeCount: 4 },
    { id: 'g1d-2-5', char: '国', pinyin: 'guó', word: '中国', wordPinyin: 'zhōng guó', word2: '国家', word2Pinyin: 'guó jiā', hint: '我们的祖国', grade: 1, semester: 'down', lesson: 2, strokeCount: 8 },
    { id: 'g1d-2-6', char: '王', pinyin: 'wáng', word: '国王', wordPinyin: 'guó wáng', word2: '大王', word2Pinyin: 'dà wáng', hint: '最大的领导', grade: 1, semester: 'down', lesson: 2, strokeCount: 4 },

    // 识字3：小青蛙
    { id: 'g1d-3-1', char: '青', pinyin: 'qīng', word: '青草', wordPinyin: 'qīng cǎo', word2: '青蛙', word2Pinyin: 'qīng wā', hint: '绿色的意思', grade: 1, semester: 'down', lesson: 3, strokeCount: 8 },
    { id: 'g1d-3-2', char: '清', pinyin: 'qīng', word: '清水', wordPinyin: 'qīng shuǐ', word2: '清早', word2Pinyin: 'qīng zǎo', hint: '干净透明', grade: 1, semester: 'down', lesson: 3, strokeCount: 11 },
    { id: 'g1d-3-3', char: '晴', pinyin: 'qíng', word: '晴天', wordPinyin: 'qíng tiān', word2: '晴朗', word2Pinyin: 'qíng lǎng', hint: '没有云的天', grade: 1, semester: 'down', lesson: 3, strokeCount: 12 },
    { id: 'g1d-3-4', char: '眼', pinyin: 'yǎn', word: '眼睛', wordPinyin: 'yǎn jing', word2: '眼泪', word2Pinyin: 'yǎn lèi', hint: '看东西用的', grade: 1, semester: 'down', lesson: 3, strokeCount: 11 },
    { id: 'g1d-3-5', char: '睛', pinyin: 'jīng', word: '眼睛', wordPinyin: 'yǎn jing', hint: '和眼组成词', grade: 1, semester: 'down', lesson: 3, strokeCount: 13 },

    // 识字4：猜字谜
    { id: 'g1d-4-1', char: '字', pinyin: 'zì', word: '写字', wordPinyin: 'xiě zì', word2: '汉字', word2Pinyin: 'hàn zì', hint: '学习读写的', grade: 1, semester: 'down', lesson: 4, strokeCount: 6 },
    { id: 'g1d-4-2', char: '左', pinyin: 'zuǒ', word: '左边', wordPinyin: 'zuǒ biān', word2: '左手', word2Pinyin: 'zuǒ shǒu', hint: '和右相反', grade: 1, semester: 'down', lesson: 4, strokeCount: 5 },
    { id: 'g1d-4-3', char: '右', pinyin: 'yòu', word: '右边', wordPinyin: 'yòu biān', word2: '右手', word2Pinyin: 'yòu shǒu', hint: '和左相反', grade: 1, semester: 'down', lesson: 4, strokeCount: 5 },
    { id: 'g1d-4-4', char: '红', pinyin: 'hóng', word: '红色', wordPinyin: 'hóng sè', word2: '红花', word2Pinyin: 'hóng huā', hint: '太阳的颜色', grade: 1, semester: 'down', lesson: 4, strokeCount: 6 },
    { id: 'g1d-4-5', char: '时', pinyin: 'shí', word: '时间', wordPinyin: 'shí jiān', word2: '小时', word2Pinyin: 'xiǎo shí', hint: '钟表显示的', grade: 1, semester: 'down', lesson: 4, strokeCount: 7 },

    // 课文1：吃水不忘挖井人
    { id: 'g1d-5-1', char: '吃', pinyin: 'chī', word: '吃饭', wordPinyin: 'chī fàn', word2: '吃东西', word2Pinyin: 'chī dōng xi', hint: '用嘴巴', grade: 1, semester: 'down', lesson: 5, strokeCount: 6 },
    { id: 'g1d-5-2', char: '忘', pinyin: 'wàng', word: '忘记', wordPinyin: 'wàng jì', word2: '难忘', word2Pinyin: 'nán wàng', hint: '不记得了', grade: 1, semester: 'down', lesson: 5, strokeCount: 7 },
    { id: 'g1d-5-3', char: '井', pinyin: 'jǐng', word: '水井', wordPinyin: 'shuǐ jǐng', word2: '井水', word2Pinyin: 'jǐng shuǐ', hint: '打水的地方', grade: 1, semester: 'down', lesson: 5, strokeCount: 4 },
    { id: 'g1d-5-4', char: '村', pinyin: 'cūn', word: '村子', wordPinyin: 'cūn zi', word2: '农村', word2Pinyin: 'nóng cūn', hint: '很多人住的地方', grade: 1, semester: 'down', lesson: 5, strokeCount: 7 },
    { id: 'g1d-5-5', char: '叫', pinyin: 'jiào', word: '叫做', wordPinyin: 'jiào zuò', word2: '大叫', word2Pinyin: 'dà jiào', hint: '喊出声音', grade: 1, semester: 'down', lesson: 5, strokeCount: 5 },

    // 课文2：我多想去看看
    { id: 'g1d-6-1', char: '多', pinyin: 'duō', word: '很多', wordPinyin: 'hěn duō', word2: '多少', word2Pinyin: 'duō shǎo', hint: '和少相反', grade: 1, semester: 'down', lesson: 6, strokeCount: 6 },
    { id: 'g1d-6-2', char: '想', pinyin: 'xiǎng', word: '想念', wordPinyin: 'xiǎng niàn', word2: '思想', word2Pinyin: 'sī xiǎng', hint: '脑子里想', grade: 1, semester: 'down', lesson: 6, strokeCount: 13 },
    { id: 'g1d-6-3', char: '去', pinyin: 'qù', word: '去看', wordPinyin: 'qù kàn', word2: '出去', word2Pinyin: 'chū qù', hint: '和来相反', grade: 1, semester: 'down', lesson: 6, strokeCount: 5 },
    { id: 'g1d-6-4', char: '看', pinyin: 'kàn', word: '看见', wordPinyin: 'kàn jiàn', word2: '看书', word2Pinyin: 'kàn shū', hint: '用眼睛', grade: 1, semester: 'down', lesson: 6, strokeCount: 9 },
    { id: 'g1d-6-5', char: '北', pinyin: 'běi', word: '北方', wordPinyin: 'běi fāng', word2: '北京', word2Pinyin: 'běi jīng', hint: '和南相反', grade: 1, semester: 'down', lesson: 6, strokeCount: 5 },
    { id: 'g1d-6-6', char: '京', pinyin: 'jīng', word: '北京', wordPinyin: 'běi jīng', word2: '京城', word2Pinyin: 'jīng chéng', hint: '首都', grade: 1, semester: 'down', lesson: 6, strokeCount: 8 },
];
