#!/bin/bash
# 旋转 iOS 模拟器到横屏模式
# 使用方法: ./rotate_simulator.sh [left|right]

DIRECTION="${1:-left}"

if [ "$DIRECTION" = "left" ]; then
    osascript -e 'tell application "Simulator" to activate' \
              -e 'delay 0.5' \
              -e 'tell application "System Events" to tell process "Simulator" to click menu item "Rotate Left" of menu "Device" of menu bar 1'
elif [ "$DIRECTION" = "right" ]; then
    osascript -e 'tell application "Simulator" to activate' \
              -e 'delay 0.5' \
              -e 'tell application "System Events" to tell process "Simulator" to click menu item "Rotate Right" of menu "Device" of menu bar 1'
else
    echo "Usage: $0 [left|right]"
    exit 1
fi

echo "Simulator rotated $DIRECTION"
