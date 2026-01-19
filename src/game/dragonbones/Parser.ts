/**
 * DragonBones 数据解析器
 * 负责加载和解析 _ske.json、_tex.json 和纹理图片
 */

import { Skia } from '@shopify/react-native-skia';
import { Image } from 'react-native';
import type {
    DragonBonesData,
    TextureAtlasData,
    DragonBonesAsset,
} from './types';

/**
 * 加载 DragonBones 资源
 * @param skeletonUrl _ske.json 文件路径（require 返回的资源 ID）
 * @param textureJsonUrl _tex.json 文件路径
 * @param textureImageUrl _tex.png 文件路径
 */
export async function loadDragonBonesAsset(
    skeletonUrl: number,
    textureJsonUrl: number,
    textureImageUrl: number
): Promise<DragonBonesAsset> {
    try {
        // 1. 加载骨架 JSON
        const skeletonData: DragonBonesData = skeletonUrl as any;

        // 2. 加载纹理图集 JSON
        const atlasData: TextureAtlasData = textureJsonUrl as any;

        // 3. 加载纹理图片
        const imageSource = Image.resolveAssetSource(textureImageUrl);
        if (!imageSource || !imageSource.uri) {
            throw new Error('Failed to resolve texture image');
        }

        const textureImage = await Skia.Data.fromURI(imageSource.uri).then(
            (data) => {
                if (!data) {
                    throw new Error(`Failed to load texture image: ${imageSource.uri}`);
                }
                return Skia.Image.MakeImageFromEncoded(data);
            }
        );

        if (!textureImage) {
            throw new Error('Failed to decode texture image');
        }

        return {
            data: skeletonData,
            textureAtlas: atlasData,
            textureImage,
        };
    } catch (error) {
        throw new Error(
            `Failed to load DragonBones asset: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * 验证 DragonBones 数据格式
 */
export function validateDragonBonesData(data: any): data is DragonBonesData {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.name === 'string' &&
        typeof data.frameRate === 'number' &&
        Array.isArray(data.armature) &&
        data.armature.length > 0
    );
}

/**
 * 验证纹理图集数据格式
 */
export function validateTextureAtlasData(data: any): data is TextureAtlasData {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.name === 'string' &&
        typeof data.imagePath === 'string' &&
        Array.isArray(data.SubTexture)
    );
}
