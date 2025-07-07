#!/bin/bash

# 奇门遁甲AI后端服务启动脚本
# 使用统一的app.js入口

echo "🚀 启动奇门遁甲AI后端服务..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js"
    echo "请访问 https://nodejs.org 安装Node.js"
    exit 1
fi

# 检查主文件
if [ ! -f "app.js" ]; then
    echo "❌ 错误: app.js 文件不存在"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🔮 启动奇门遁甲AI服务 (统一版)..."
node app.js 