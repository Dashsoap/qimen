#!/bin/bash

# 丁未奇门遁甲用户认证系统启动脚本
# 现在使用统一的app.js架构

echo "🔐 启动丁未奇门遁甲用户认证系统"
echo "========================================"

# 检查环境
echo "📋 检查运行环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js"
    echo "请访问 https://nodejs.org 安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装npm"
    exit 1
fi

echo "✅ npm版本: $(npm --version)"

# 检查主文件
if [ ! -f "app.js" ]; then
    echo "❌ 错误: app.js 文件不存在"
    echo "请确保您在正确的目录中"
    exit 1
fi

echo "✅ 主文件检查通过"

# 检查配置文件
echo ""
echo "🔧 检查配置文件..."

if [ ! -f "config.env" ]; then
    echo "❌ 错误: config.env 配置文件不存在"
    echo "正在创建默认配置文件..."
    
    cat > config.env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./prisma/dev.db"

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# AI服务配置
ARK_API_KEY=UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw
ARK_BASE_URL=https://www.sophnet.com/api/open-apis/v1
ARK_MODEL=DeepSeek-R1
EOF

    echo "✅ 默认配置文件已创建"
fi

echo "✅ 配置文件检查通过"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 数据库初始化
echo ""
echo "🗄️ 初始化数据库..."
npx prisma generate
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

echo "✅ 数据库初始化完成"

# 启动服务
echo ""
echo "🚀 启动丁未奇门遁甲认证系统..."
echo "使用统一的app.js架构"

node app.js 