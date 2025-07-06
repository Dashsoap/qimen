#!/bin/bash

case "$1" in
    start)
        echo "🚀 启动所有服务..."
        
        # 启动后端
        cd /home/qimen-backend
        nohup node server.js > server.log 2>&1 &
        echo $! > backend.pid
        echo "✅ 后端服务已启动 (PID: $(cat backend.pid))"
        
        # 启动nginx
        systemctl start nginx
        echo "✅ Nginx已启动"
        
        sleep 3
        echo "🧪 检查服务状态..."
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ 后端服务运行正常"
        else
            echo "❌ 后端服务异常"
        fi
        
        if curl -f http://localhost > /dev/null 2>&1; then
            echo "✅ 前端服务运行正常"
        else
            echo "❌ 前端服务异常"
        fi
        ;;
        
    stop)
        echo "⏹️ 停止所有服务..."
        
        # 停止后端
        if [ -f "/home/qimen-backend/backend.pid" ]; then
            kill $(cat /home/qimen-backend/backend.pid) 2>/dev/null || true
            rm -f /home/qimen-backend/backend.pid
        fi
        pkill -f "node.*server.js" || true
        echo "✅ 后端服务已停止"
        
        # 停止nginx
        systemctl stop nginx || true
        echo "✅ Nginx已停止"
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo "📊 服务状态检查..."
        
        if pgrep -f "node.*server.js" > /dev/null; then
            echo "✅ 后端服务: 运行中"
        else
            echo "❌ 后端服务: 未运行"
        fi
        
        if systemctl is-active nginx > /dev/null 2>&1; then
            echo "✅ Nginx: 运行中"
        else
            echo "❌ Nginx: 未运行"
        fi
        
        echo ""
        echo "🌐 访问地址:"
        echo "   前端: http://101.201.148.8"
        echo "   后端API: http://101.201.148.8:3001"
        echo "   健康检查: http://101.201.148.8/health"
        ;;
        
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
