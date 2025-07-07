#!/bin/bash

# 服务器诊断和修复脚本
# 解决API 500错误问题

SERVER_IP="101.201.148.8"
SERVER_USER="root"
BACKEND_DIR="/home/qimen-backend"

echo "🔍 奇门遁甲服务器诊断"
echo "服务器: $SERVER_IP"
echo "========================================"

# 在服务器上执行诊断
ssh $SERVER_USER@$SERVER_IP << 'EOF'
echo "📊 当前服务状态:"

# 检查3001端口
echo ""
echo "🔍 检查3001端口:"
if netstat -tlnp | grep -q ":3001 "; then
    echo "✅ 3001端口有服务运行:"
    netstat -tlnp | grep ":3001 "
else
    echo "❌ 3001端口没有服务运行"
fi

# 检查Node.js进程
echo ""
echo "🔍 检查Node.js进程:"
NODE_PROCESSES=$(ps aux | grep -v grep | grep node)
if [ -n "$NODE_PROCESSES" ]; then
    echo "✅ 发现Node.js进程:"
    echo "$NODE_PROCESSES"
else
    echo "❌ 没有Node.js进程运行"
fi

# 检查后端目录
echo ""
echo "📁 检查后端目录:"
if [ -d "/home/qimen-backend" ]; then
    echo "✅ 后端目录存在"
    cd /home/qimen-backend
    
    # 检查主要文件
    if [ -f "app.js" ]; then
        echo "✅ app.js 存在"
    else
        echo "❌ app.js 不存在"
    fi
    
    if [ -f "package.json" ]; then
        echo "✅ package.json 存在"
    else
        echo "❌ package.json 不存在"
    fi
    
    # 检查日志文件
    if [ -f "app.log" ]; then
        echo "✅ 日志文件存在，最后10行:"
        tail -10 app.log
    else
        echo "❌ 没有日志文件"
    fi
    
else
    echo "❌ 后端目录不存在: /home/qimen-backend"
fi

echo ""
echo "�� 正在重启后端服务..."

# 停止可能运行的进程
echo "⏹️ 停止现有进程..."
pkill -f "node.*app.js" || true

# 进入后端目录
cd /home/qimen-backend

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动后端服务..."
nohup node app.js > app.log 2>&1 &
BACKEND_PID=$!

echo "⏳ 等待服务启动..."
sleep 5

# 检查服务是否启动成功
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务启动成功!"
    echo "🆔 进程ID: $BACKEND_PID"
    
    # 测试API端点
    echo ""
    echo "🧪 测试API端点:"
    
    # 测试健康检查
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
    echo "健康检查 (/health): $HEALTH_STATUS"
    
    # 测试根路径
    ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/)
    echo "根路径 (/): $ROOT_STATUS"
    
    # 测试CORS（OPTIONS请求）
    CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS -H "Origin: http://101.201.148.8" -H "Access-Control-Request-Method: POST" http://localhost:3001/api/auth/login)
    echo "CORS测试 (OPTIONS /api/auth/login): $CORS_STATUS"
    
else
    echo "❌ 后端服务启动失败!"
    echo "错误日志:"
    tail -20 app.log
fi

echo ""
echo "📊 最新服务状态:"
netstat -tlnp | grep ":3001 " || echo "❌ 3001端口没有服务"

EOF

echo ""
echo "🎯 诊断完成！"
echo "========================================"
echo "现在请尝试重新访问: http://101.201.148.8/login"
echo ""
echo "如果问题仍然存在，请检查:"
echo "1. 防火墙是否开放3001端口"
echo "2. 代理设置是否正确（远程地址显示127.0.0.1:7890可能是代理问题）"
echo "3. 服务器网络配置" 