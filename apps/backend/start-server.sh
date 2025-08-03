#!/bin/bash

echo "🚀 启动丁未奇门遁甲后端服务 (守护进程模式)..."

# 停止现有进程
pkill -f app.js

sleep 2

echo "📦 检查依赖..."
npm install --production

echo "🔮 启动丁未奇门遁甲服务..."
nohup node app.js > server.log 2>&1 &

echo "✅ 服务已在后台启动"
echo "📋 查看日志: tail -f server.log"
echo "⏹️ 停止服务: pkill -f app.js"

# 等待一下确保服务启动
sleep 3

# 检查服务状态
if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ 服务运行正常"
    echo "🌐 访问地址: http://localhost:3001"
else
    echo "❌ 服务启动失败，请检查日志"
    tail -20 server.log
fi
