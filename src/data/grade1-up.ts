// 人教版一年级上册生字
import { Character } from '../types';

export const GRADE1_UP_CHARACTERS: Character[] = [
    // 识字1：天地人
    { id: 'g1u-1-1', char: '天', pinyin: 'tiān', word: '天空', wordPinyin: 'tiān kōng', word2: '今天', word2Pinyin: 'jīn tiān', hint: '头顶上蓝蓝的', grade: 1, semester: 'up', lesson: 1, strokeCount: 4 },
    { id: 'g1u-1-2', char: '地', pinyin: 'dì', word: '大地', wordPinyin: 'dà dì', word2: '地上', word2Pinyin: 'dì shàng', hint: '脚下踩的', grade: 1, semester: 'up', lesson: 1, strokeCount: 6 },
    { id: 'g1u-1-3', char: '人', pinyin: 'rén', word: '人们', wordPinyin: 'rén men', word2: '大人', word2Pinyin: 'dà rén', hint: '你我他都是', grade: 1, semester: 'up', lesson: 1, strokeCount: 2 },
    { id: 'g1u-1-4', char: '你', pinyin: 'nǐ', word: '你好', wordPinyin: 'nǐ hǎo', word2: '你们', word2Pinyin: 'nǐ men', hint: '打招呼用的字', grade: 1, semester: 'up', lesson: 1, strokeCount: 7 },
    { id: 'g1u-1-5', char: '我', pinyin: 'wǒ', word: '我们', wordPinyin: 'wǒ men', word2: '自我', word2Pinyin: 'zì wǒ', hint: '自己', grade: 1, semester: 'up', lesson: 1, strokeCount: 7 },
    { id: 'g1u-1-6', char: '他', pinyin: 'tā', word: '他们', wordPinyin: 'tā men', word2: '其他', word2Pinyin: 'qí tā', hint: '指男的那个人', grade: 1, semester: 'up', lesson: 1, strokeCount: 5 },

    // 识字2：金木水火土
    { id: 'g1u-2-1', char: '一', pinyin: 'yī', word: '一个', wordPinyin: 'yī gè', word2: '第一', word2Pinyin: 'dì yī', hint: '最小的数字', grade: 1, semester: 'up', lesson: 2, strokeCount: 1 },
    { id: 'g1u-2-2', char: '二', pinyin: 'èr', word: '二月', wordPinyin: 'èr yuè', word2: '第二', word2Pinyin: 'dì èr', hint: '一加一', grade: 1, semester: 'up', lesson: 2, strokeCount: 2 },
    { id: 'g1u-2-3', char: '三', pinyin: 'sān', word: '三个', wordPinyin: 'sān gè', word2: '第三', word2Pinyin: 'dì sān', hint: '二加一', grade: 1, semester: 'up', lesson: 2, strokeCount: 3 },
    { id: 'g1u-2-4', char: '上', pinyin: 'shàng', word: '上面', wordPinyin: 'shàng miàn', word2: '上学', word2Pinyin: 'shàng xué', hint: '和下相反', grade: 1, semester: 'up', lesson: 2, strokeCount: 3 },
    { id: 'g1u-2-5', char: '下', pinyin: 'xià', word: '下面', wordPinyin: 'xià miàn', word2: '下雨', word2Pinyin: 'xià yǔ', hint: '和上相反', grade: 1, semester: 'up', lesson: 2, strokeCount: 3 },

    // 识字3：口耳目
    { id: 'g1u-3-1', char: '口', pinyin: 'kǒu', word: '口水', wordPinyin: 'kǒu shuǐ', word2: '开口', word2Pinyin: 'kāi kǒu', hint: '吃饭说话用的', grade: 1, semester: 'up', lesson: 3, strokeCount: 3 },
    { id: 'g1u-3-2', char: '耳', pinyin: 'ěr', word: '耳朵', wordPinyin: 'ěr duo', word2: '木耳', word2Pinyin: 'mù ěr', hint: '听声音用的', grade: 1, semester: 'up', lesson: 3, strokeCount: 6 },
    { id: 'g1u-3-3', char: '目', pinyin: 'mù', word: '目光', wordPinyin: 'mù guāng', word2: '目的', word2Pinyin: 'mù dì', hint: '眼睛的意思', grade: 1, semester: 'up', lesson: 3, strokeCount: 5 },
    { id: 'g1u-3-4', char: '手', pinyin: 'shǒu', word: '小手', wordPinyin: 'xiǎo shǒu', word2: '手心', word2Pinyin: 'shǒu xīn', hint: '写字画画用的', grade: 1, semester: 'up', lesson: 3, strokeCount: 4 },
    { id: 'g1u-3-5', char: '足', pinyin: 'zú', word: '足球', wordPinyin: 'zú qiú', word2: '手足', word2Pinyin: 'shǒu zú', hint: '脚的意思', grade: 1, semester: 'up', lesson: 3, strokeCount: 7 },

    // 识字4：日月水火
    { id: 'g1u-4-1', char: '日', pinyin: 'rì', word: '日出', wordPinyin: 'rì chū', word2: '生日', word2Pinyin: 'shēng rì', hint: '太阳', grade: 1, semester: 'up', lesson: 4, strokeCount: 4 },
    { id: 'g1u-4-2', char: '月', pinyin: 'yuè', word: '月亮', wordPinyin: 'yuè liàng', word2: '一月', word2Pinyin: 'yī yuè', hint: '晚上会发光', grade: 1, semester: 'up', lesson: 4, strokeCount: 4 },
    { id: 'g1u-4-3', char: '水', pinyin: 'shuǐ', word: '水果', wordPinyin: 'shuǐ guǒ', word2: '开水', word2Pinyin: 'kāi shuǐ', hint: '喝的东西', grade: 1, semester: 'up', lesson: 4, strokeCount: 4 },
    { id: 'g1u-4-4', char: '火', pinyin: 'huǒ', word: '火车', wordPinyin: 'huǒ chē', word2: '大火', word2Pinyin: 'dà huǒ', hint: '很烫很热', grade: 1, semester: 'up', lesson: 4, strokeCount: 4 },
    { id: 'g1u-4-5', char: '山', pinyin: 'shān', word: '大山', wordPinyin: 'dà shān', word2: '山上', word2Pinyin: 'shān shàng', hint: '很高很大', grade: 1, semester: 'up', lesson: 4, strokeCount: 3 },
    { id: 'g1u-4-6', char: '石', pinyin: 'shí', word: '石头', wordPinyin: 'shí tou', word2: '石子', word2Pinyin: 'shí zi', hint: '硬硬的', grade: 1, semester: 'up', lesson: 4, strokeCount: 5 },

    // 识字5：对韵歌
    { id: 'g1u-5-1', char: '云', pinyin: 'yún', word: '白云', wordPinyin: 'bái yún', word2: '云朵', word2Pinyin: 'yún duǒ', hint: '天上飘的', grade: 1, semester: 'up', lesson: 5, strokeCount: 4 },
    { id: 'g1u-5-2', char: '雨', pinyin: 'yǔ', word: '下雨', wordPinyin: 'xià yǔ', word2: '雨水', word2Pinyin: 'yǔ shuǐ', hint: '从天上落下来', grade: 1, semester: 'up', lesson: 5, strokeCount: 8 },
    { id: 'g1u-5-3', char: '风', pinyin: 'fēng', word: '大风', wordPinyin: 'dà fēng', word2: '风车', word2Pinyin: 'fēng chē', hint: '看不见摸不着', grade: 1, semester: 'up', lesson: 5, strokeCount: 4 },
    { id: 'g1u-5-4', char: '花', pinyin: 'huā', word: '花朵', wordPinyin: 'huā duǒ', word2: '红花', word2Pinyin: 'hóng huā', hint: '很漂亮很香', grade: 1, semester: 'up', lesson: 5, strokeCount: 7 },
    { id: 'g1u-5-5', char: '鸟', pinyin: 'niǎo', word: '小鸟', wordPinyin: 'xiǎo niǎo', word2: '鸟儿', word2Pinyin: 'niǎo ér', hint: '会飞会叫', grade: 1, semester: 'up', lesson: 5, strokeCount: 5 },
    { id: 'g1u-5-6', char: '虫', pinyin: 'chóng', word: '虫子', wordPinyin: 'chóng zi', word2: '小虫', word2Pinyin: 'xiǎo chóng', hint: '小小的爬来爬去', grade: 1, semester: 'up', lesson: 5, strokeCount: 6 },

    // 课文1：秋天
    { id: 'g1u-6-1', char: '秋', pinyin: 'qiū', word: '秋天', wordPinyin: 'qiū tiān', word2: '秋风', word2Pinyin: 'qiū fēng', hint: '夏天后面的季节', grade: 1, semester: 'up', lesson: 6, strokeCount: 9 },
    { id: 'g1u-6-2', char: '气', pinyin: 'qì', word: '天气', wordPinyin: 'tiān qì', word2: '空气', word2Pinyin: 'kōng qì', hint: '呼吸用的', grade: 1, semester: 'up', lesson: 6, strokeCount: 4 },
    { id: 'g1u-6-3', char: '了', pinyin: 'le', word: '好了', wordPinyin: 'hǎo le', word2: '来了', word2Pinyin: 'lái le', hint: '表示完成', grade: 1, semester: 'up', lesson: 6, strokeCount: 2 },
    { id: 'g1u-6-4', char: '树', pinyin: 'shù', word: '大树', wordPinyin: 'dà shù', word2: '树叶', word2Pinyin: 'shù yè', hint: '有叶子有树干', grade: 1, semester: 'up', lesson: 6, strokeCount: 9 },
    { id: 'g1u-6-5', char: '叶', pinyin: 'yè', word: '树叶', wordPinyin: 'shù yè', word2: '叶子', word2Pinyin: 'yè zi', hint: '长在树上绿绿的', grade: 1, semester: 'up', lesson: 6, strokeCount: 5 },

    // 课文2：小小的船
    { id: 'g1u-7-1', char: '小', pinyin: 'xiǎo', word: '小小', wordPinyin: 'xiǎo xiǎo', word2: '大小', word2Pinyin: 'dà xiǎo', hint: '和大相反', grade: 1, semester: 'up', lesson: 7, strokeCount: 3 },
    { id: 'g1u-7-2', char: '船', pinyin: 'chuán', word: '小船', wordPinyin: 'xiǎo chuán', word2: '船只', word2Pinyin: 'chuán zhī', hint: '在水上走的', grade: 1, semester: 'up', lesson: 7, strokeCount: 11 },
    { id: 'g1u-7-3', char: '弯', pinyin: 'wān', word: '弯弯', wordPinyin: 'wān wān', word2: '弯曲', word2Pinyin: 'wān qū', hint: '不直', grade: 1, semester: 'up', lesson: 7, strokeCount: 9 },
    { id: 'g1u-7-4', char: '星', pinyin: 'xīng', word: '星星', wordPinyin: 'xīng xing', word2: '明星', word2Pinyin: 'míng xīng', hint: '晚上天上亮亮的', grade: 1, semester: 'up', lesson: 7, strokeCount: 9 },
    { id: 'g1u-7-5', char: '蓝', pinyin: 'lán', word: '蓝天', wordPinyin: 'lán tiān', word2: '蓝色', word2Pinyin: 'lán sè', hint: '天空的颜色', grade: 1, semester: 'up', lesson: 7, strokeCount: 13 },

    // 课文3：江南
    { id: 'g1u-8-1', char: '江', pinyin: 'jiāng', word: '江水', wordPinyin: 'jiāng shuǐ', word2: '长江', word2Pinyin: 'cháng jiāng', hint: '大大的河', grade: 1, semester: 'up', lesson: 8, strokeCount: 6 },
    { id: 'g1u-8-2', char: '南', pinyin: 'nán', word: '南方', wordPinyin: 'nán fāng', word2: '南边', word2Pinyin: 'nán biān', hint: '和北相反', grade: 1, semester: 'up', lesson: 8, strokeCount: 9 },
    { id: 'g1u-8-3', char: '可', pinyin: 'kě', word: '可以', wordPinyin: 'kě yǐ', word2: '可是', word2Pinyin: 'kě shì', hint: '表示同意', grade: 1, semester: 'up', lesson: 8, strokeCount: 5 },
    { id: 'g1u-8-4', char: '采', pinyin: 'cǎi', word: '采花', wordPinyin: 'cǎi huā', word2: '采集', word2Pinyin: 'cǎi jí', hint: '摘东西', grade: 1, semester: 'up', lesson: 8, strokeCount: 8 },
    { id: 'g1u-8-5', char: '莲', pinyin: 'lián', word: '莲花', wordPinyin: 'lián huā', word2: '莲子', word2Pinyin: 'lián zǐ', hint: '长在水里的花', grade: 1, semester: 'up', lesson: 8, strokeCount: 10 },
    { id: 'g1u-8-6', char: '鱼', pinyin: 'yú', word: '小鱼', wordPinyin: 'xiǎo yú', word2: '鱼儿', word2Pinyin: 'yú ér', hint: '在水里游', grade: 1, semester: 'up', lesson: 8, strokeCount: 8 },
];
