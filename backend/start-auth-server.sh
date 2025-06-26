#!/bin/bash

# 云雀奇门遁甲 - 认证服务器启动脚本

echo "🔮 ======================================="
echo "   云雀奇门遁甲 - 认证服务器启动器"
echo "🔮 ======================================="
echo ""

# 检查Node.js版本
echo "🔍 检查Node.js版本..."
node_version=$(node -v)
echo "✅ Node.js版本: $node_version"

# 检查npm依赖
echo ""
echo "📦 检查依赖包..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖包未安装，正在安装..."
    npm install
else
    echo "✅ 依赖包已安装"
fi

# 检查数据库
echo ""
echo "🗄️  检查数据库..."
if [ ! -f "prisma/dev.db" ]; then
    echo "⚠️  数据库未初始化，正在初始化..."
    npm run init-db
else
    echo "✅ 数据库已就绪"
fi

# 显示功能列表
echo ""
echo "📋 服务器功能列表:"
echo "   ✅ 用户注册/登录"
echo "   ✅ JWT安全认证"
echo "   ✅ 积分系统"
echo "   ✅ 数据库集成"
echo "   ✅ AI智能解盘"
echo "   ✅ 安全防护"
echo "   ✅ 限流保护"
echo ""

# 显示API端点
echo "🌐 API端点:"
echo "   POST /api/auth/register   - 用户注册"
echo "   POST /api/auth/login      - 用户登录"
echo "   GET  /api/auth/profile    - 获取资料"
echo "   GET  /api/points          - 查看积分"
echo "   POST /api/points/transaction - 积分交易"
echo "   POST /api/qimen/paipan    - 奇门排盘"
echo "   POST /api/analysis/qimen  - AI分析"
echo ""

# 启动选项
echo "🚀 启动选项:"
echo "   1) 启动认证服务器 (推荐)"
echo "   2) 启动简单服务器 (旧版)"
echo "   3) 运行测试脚本"
echo "   4) 查看服务状态"
echo "   5) 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动认证服务器..."
        echo "🌐 服务地址: http://localhost:3001"
        echo "🔒 按 Ctrl+C 停止服务器"
        echo ""
        node server.js
        ;;
    2)
        echo ""
        echo "🚀 启动简单服务器..."
        echo "🌐 服务地址: http://localhost:3001"
        echo "🔒 按 Ctrl+C 停止服务器"
        echo ""
        node simple-server.js
        ;;
    3)
        echo ""
        echo "🧪 准备运行测试..."
        echo "请先在另一个终端启动服务器："
        echo "node server.js"
        echo ""
        read -p "服务器已启动？(y/n): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo "🧪 开始运行测试..."
            node test-auth.js run
        else
            echo "❌ 测试取消"
        fi
        ;;
    4)
        echo ""
        echo "🔍 检查服务状态..."
        if curl -s http://localhost:3001/health > /dev/null; then
            echo "✅ 服务器运行正常"
            curl -s http://localhost:3001/ | grep -o '"message":"[^"]*"' | sed 's/"message":"//g' | sed 's/"//g'
        else
            echo "❌ 服务器未运行"
            echo "请先启动服务器: node server.js"
        fi
        ;;
    5)
        echo ""
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ 无效选择"
        echo "请选择 1-5"
        ;;
esac

echo ""
echo "🔮 感谢使用云雀奇门遁甲系统！" 