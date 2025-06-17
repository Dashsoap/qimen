#!/bin/bash

echo "🎉 启动奇门遁甲AI完整应用"
echo "========================================"

# 检查依赖
echo "📦 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

echo "📦 检查前端依赖..."
cd ../fronend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动后端服务
echo ""
echo "🚀 启动后端AI服务..."
cd ../backend
node simple-server.js &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 测试后端服务
echo "🧪 测试后端服务..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
    echo "📡 后端地址: http://localhost:3001"
else
    echo "❌ 后端服务启动失败"
    exit 1
fi

# 启动前端服务
echo ""
echo "🎨 启动前端服务..."
cd ../fronend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 应用启动完成！"
echo "========================================"
echo "🔮 前端地址: http://localhost:5173"
echo "🤖 后端地址: http://localhost:3001"
echo "📱 在浏览器中打开前端地址开始使用"
echo ""
echo "💡 使用说明:"
echo "1. 在前端页面输入占卜问题"
echo "2. 点击'AI智能分析'按钮"
echo "3. 查看AI分析结果"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"

# 等待用户中断
wait 