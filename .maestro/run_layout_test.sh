#!/bin/bash
# 运行布局验证测试的完整脚本
# 1. 检查模拟器窗口尺寸
# 2. 如果是竖屏，自动旋转到横屏
# 3. 运行 Maestro 测试

cd "$(dirname "$0")/.."

echo "🔍 检查模拟器当前窗口尺寸..."

# 使用 AppleScript 获取 Simulator 窗口大小
# 返回格式: "width, height"
WINDOW_SIZE=$(osascript -e 'tell application "System Events" to tell process "Simulator" to get size of window 1' 2>/dev/null)

if [ -z "$WINDOW_SIZE" ]; then
    echo "⚠️ 无法获取模拟器窗口大小，请确保 Simulator 正在运行。"
    echo "默认为竖屏，尝试旋转..."
    IS_LANDSCAPE=false
else
    # 解析宽高
    WIDTH=$(echo "$WINDOW_SIZE" | awk -F', ' '{print $1}')
    HEIGHT=$(echo "$WINDOW_SIZE" | awk -F', ' '{print $2}')
    
    echo "📏 窗口尺寸: ${WIDTH}x${HEIGHT}"
    
    if [ "$WIDTH" -gt "$HEIGHT" ]; then
        IS_LANDSCAPE=true
    else
        IS_LANDSCAPE=false
    fi
fi

if [ "$IS_LANDSCAPE" = true ]; then
    echo "✅ 模拟器窗口已经是横向的，无需旋转。"
else
    echo "🔄 模拟器窗口是竖向的，正在旋转到横屏..."
    osascript -e 'tell application "Simulator" to activate' \
              -e 'delay 0.5' \
              -e 'tell application "System Events" to tell process "Simulator" to click menu item "Rotate Left" of menu "Device" of menu bar 1' 2>/dev/null || echo "⚠️ 旋转失败，请手动旋转"
    sleep 2
fi

echo "🧪 正在运行布局验证测试..."
~/.maestro/bin/maestro test .maestro/layout_validation_test.yaml

echo "✅ 测试完成"
