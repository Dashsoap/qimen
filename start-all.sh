#!/bin/bash

# 奇门遁甲AI前后端一体化启动脚本

echo "🚀 启动奇门遁甲AI完整应用..."

# 检查目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 缺少frontend或backend目录"
    exit 1
fi

# 启动后端
echo "🔧 启动后端服务..."
cd backend

# 检查app.js
if [ ! -f "app.js" ]; then
    echo "❌ 错误: backend/app.js 不存在"
    exit 1
fi

# 安装后端依赖
npm install

# 启动后端 (后台运行)
nohup node app.js > backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 返回根目录启动前端
cd ../frontend

# 检查前端文件
if [ ! -f "package.json" ]; then
    echo "❌ 错误: frontend/package.json 不存在"
    kill $BACKEND_PID
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install

# 启动前端开发服务器
echo "🎨 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

echo ""
echo "🎉 奇门遁甲AI应用已启动！"
echo "========================================"
echo "🔧 后端服务: http://localhost:3001"
echo "🎨 前端应用: http://localhost:5173"
echo "📋 后端日志: tail -f backend/backend.log"
echo ""
echo "⏹️ 停止服务:"
echo "   kill $BACKEND_PID  # 停止后端"
echo "   kill $FRONTEND_PID # 停止前端"
echo "   或按 Ctrl+C 停止前端，然后手动停止后端"

# 等待前端服务（Ctrl+C会停止）
wait $FRONTEND_PID

echo "🔄 前端服务已停止，正在停止后端..."
kill $BACKEND_PID 2>/dev/null

echo "👋 所有服务已停止" 