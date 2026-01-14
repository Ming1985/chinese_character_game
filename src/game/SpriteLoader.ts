/**
 * SpriteLoader - 精灵图集加载器
 *
 * 加载 TexturePacker 导出的精灵图集 (JSON + PNG)。
 * 支持 Hash 格式的 JSON 数据。
 */

import { Skia } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import type { SpriteAtlas, SpriteFrame, TexturePackerJson } from './types';

/** 图集缓存 */
const atlasCache = new Map<string, SpriteAtlas>();

/**
 * 从 URL 或 base64 加载图片为 SkImage
 */
async function loadSkImageFromUrl(url: string): Promise<SkImage> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const data = Skia.Data.fromBytes(new Uint8Array(arrayBuffer));
    const image = Skia.Image.MakeImageFromEncoded(data);

    if (!image) {
        throw new Error('Failed to decode image');
    }

    return image;
}

/**
 * 从 require() 资源解析图片 URI
 * React Native 的 require() 返回一个数字 ID，需要通过 Image.resolveAssetSource 解析
 */
function resolveAssetUri(source: number): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Image } = require('react-native');
    const resolved = Image.resolveAssetSource(source);
    return resolved?.uri || '';
}

/**
 * 解析 TexturePacker JSON 为 SpriteFrame Map
 */
function parseTexturePackerJson(json: TexturePackerJson): Map<string, SpriteFrame> {
    const frames = new Map<string, SpriteFrame>();

    for (const [name, data] of Object.entries(json.frames)) {
        frames.set(name, {
            name,
            x: data.frame.x,
            y: data.frame.y,
            width: data.frame.w,
            height: data.frame.h,
            rotated: data.rotated,
            trimmed: data.trimmed,
            sourceSize: data.sourceSize
                ? { w: data.sourceSize.w, h: data.sourceSize.h }
                : undefined,
            spriteSourceSize: data.spriteSourceSize,
        });
    }

    return frames;
}

/**
 * 加载精灵图集
 *
 * @param jsonData - JSON 数据对象 (直接 import 的 JSON)
 * @param imageSource - PNG 文件的 require() 结果
 * @param cacheKey - 可选的缓存键，用于复用已加载的图集
 * @returns 加载后的 SpriteAtlas
 *
 * @example
 * ```ts
 * import spritesJson from './sprites.json';
 * const atlas = await loadSpriteAtlas(
 *   spritesJson,
 *   require('./sprites.png'),
 *   'main-sprites'
 * );
 * ```
 */
export async function loadSpriteAtlas(
    jsonData: TexturePackerJson,
    imageSource: number,
    cacheKey?: string
): Promise<SpriteAtlas> {
    // 检查缓存
    if (cacheKey && atlasCache.has(cacheKey)) {
        return atlasCache.get(cacheKey)!;
    }

    try {
        // 解析图片 URI 并加载
        const imageUri = resolveAssetUri(imageSource);
        if (!imageUri) {
            throw new Error('Failed to resolve image asset URI');
        }

        const image = await loadSkImageFromUrl(imageUri);

        // 解析帧数据
        const frames = parseTexturePackerJson(jsonData);

        const atlas: SpriteAtlas = {
            image,
            frames,
            size: {
                width: jsonData.meta.size.w,
                height: jsonData.meta.size.h,
            },
        };

        // 存入缓存
        if (cacheKey) {
            atlasCache.set(cacheKey, atlas);
        }

        return atlas;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load sprite atlas (cacheKey: ${cacheKey}): ${message}`);
    }
}

/**
 * 从图集中获取指定名称的帧
 */
export function getFrame(atlas: SpriteAtlas, frameName: string): SpriteFrame | undefined {
    return atlas.frames.get(frameName);
}

/**
 * 从图集中获取匹配前缀的所有帧（按名称排序）
 *
 * @example
 * ```ts
 * // 获取 "explosion_0", "explosion_1", ... 等帧
 * const frames = getFramesByPrefix(atlas, 'explosion_');
 * ```
 */
export function getFramesByPrefix(atlas: SpriteAtlas, prefix: string): SpriteFrame[] {
    const frames: SpriteFrame[] = [];

    for (const [name, frame] of atlas.frames) {
        if (name.startsWith(prefix)) {
            frames.push(frame);
        }
    }

    // 按名称排序（假设名称以数字结尾）
    frames.sort((a, b) => {
        const numA = parseInt(a.name.replace(prefix, ''), 10) || 0;
        const numB = parseInt(b.name.replace(prefix, ''), 10) || 0;
        return numA - numB;
    });

    return frames;
}

/**
 * 清除图集缓存
 */
export function clearAtlasCache(cacheKey?: string): void {
    if (cacheKey) {
        atlasCache.delete(cacheKey);
    } else {
        atlasCache.clear();
    }
}

/**
 * 预加载多个图集
 */
export async function preloadAtlases(
    atlases: Array<{
        jsonData: TexturePackerJson;
        imageSource: number;
        cacheKey: string;
    }>
): Promise<void> {
    await Promise.all(
        atlases.map(({ jsonData, imageSource, cacheKey }) =>
            loadSpriteAtlas(jsonData, imageSource, cacheKey)
        )
    );
}
