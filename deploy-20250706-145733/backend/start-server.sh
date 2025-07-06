#!/bin/bash
echo "🚀 启动奇门遁甲后端服务..."

# 检查端口是否被占用
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3001已被占用，正在停止现有服务..."
    pkill -f simple-server.js
    sleep 2
fi

# 启动服务
echo "🔄 启动服务中..."
nohup node simple-server.js > server.log 2>&1 &
SERVER_PID=$!

# 等待服务启动
sleep 3

# 检查服务状态
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务启动成功!"
    echo "📊 服务PID: $SERVER_PID"
    echo "🌐 健康检查: curl http://localhost:3001/health"
    echo "📝 日志文件: tail -f server.log"
else
    echo "❌ 服务启动失败，请检查日志:"
    cat server.log
fi
