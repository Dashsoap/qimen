#!/bin/bash

# 奇门遁甲AI后端启动脚本

echo "🎉 启动奇门遁甲AI后端服务..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装依赖中..."
    npm install
fi

# 启动服务
echo "🚀 启动服务器..."
echo "📡 服务地址: http://localhost:3001"
echo "🔮 健康检查: http://localhost:3001/health"
echo ""

# 运行服务器
node simple-server.js 