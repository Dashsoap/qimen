#!/bin/bash

# 🚀 丁未奇门遁甲项目 - 开发环境快速启动脚本

echo "🔮 丁未奇门遁甲项目 - 开发环境启动"
echo "======================================"

# 检查依赖
check_dependencies() {
    echo "📋 检查系统依赖..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    echo "✅ 系统依赖检查通过"
}

# 安装项目依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    
    # 后端依赖
    if [ -f "apps/backend/package.json" ]; then
        echo "  🔧 安装后端依赖..."
        cd apps/backend && npm install && cd ../..
    fi
    
    # Vue前端依赖
    if [ -f "apps/frontend-vue/package.json" ]; then
        echo "  🎨 安装Vue前端依赖..."
        cd apps/frontend-vue && npm install && cd ../..
    fi
    
    # React前端依赖
    if [ -f "apps/frontend-react/package.json" ]; then
        echo "  ⚛️ 安装React前端依赖..."
        cd apps/frontend-react && npm install && cd ../..
    fi
    
    echo "✅ 依赖安装完成"
}

# 启动开发服务
start_services() {
    echo "🚀 启动开发服务..."
    
    # 选择启动模式
    echo "请选择启动模式:"
    echo "1) 只启动后端 (端口3001)"
    echo "2) 后端 + Vue前端 (端口3001 + 5173)"
    echo "3) 后端 + React前端 (端口3001 + 5174)"
    echo "4) 完整启动 (后端 + 两个前端)"
    echo "5) 只启动Vue前端"
    echo "6) 只启动React前端"
    
    read -p "输入选择 (1-6): " choice
    
    case $choice in
        1)
            echo "🔧 启动后端服务..."
            cd apps/backend && node app.js
            ;;
        2)
            echo "🔧 启动后端服务..."
            cd apps/backend && node app.js &
            BACKEND_PID=$!
            
            sleep 3
            echo "🎨 启动Vue前端..."
            cd apps/frontend-vue && npm run dev &
            VUE_PID=$!
            
            echo "✅ 服务启动完成！"
            echo "📍 后端: http://localhost:3001"
            echo "📍 Vue前端: http://localhost:5173"
            
            wait $BACKEND_PID $VUE_PID
            ;;
        3)
            echo "🔧 启动后端服务..."
            cd apps/backend && node app.js &
            BACKEND_PID=$!
            
            sleep 3
            echo "⚛️ 启动React前端..."
            cd apps/frontend-react && npm run dev &
            REACT_PID=$!
            
            echo "✅ 服务启动完成！"
            echo "📍 后端: http://localhost:3001"
            echo "📍 React前端: http://localhost:5174"
            
            wait $BACKEND_PID $REACT_PID
            ;;
        4)
            echo "🔧 启动后端服务..."
            cd apps/backend && node app.js &
            BACKEND_PID=$!
            
            sleep 3
            echo "🎨 启动Vue前端..."
            cd apps/frontend-vue && npm run dev &
            VUE_PID=$!
            
            echo "⚛️ 启动React前端..."
            cd apps/frontend-react && npm run dev &
            REACT_PID=$!
            
            echo "✅ 所有服务启动完成！"
            echo "📍 后端: http://localhost:3001"
            echo "📍 Vue前端: http://localhost:5173"
            echo "📍 React前端: http://localhost:5174"
            
            wait $BACKEND_PID $VUE_PID $REACT_PID
            ;;
        5)
            echo "🎨 启动Vue前端..."
            cd apps/frontend-vue && npm run dev
            ;;
        6)
            echo "⚛️ 启动React前端..."
            cd apps/frontend-react && npm run dev
            ;;
        *)
            echo "❌ 无效选择，退出"
            exit 1
            ;;
    esac
}

# 清理函数
cleanup() {
    echo -e "\n🛑 正在停止服务..."
    jobs -p | xargs -r kill
    echo "👋 再见!"
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    case "${1:-help}" in
        "install"|"i")
            check_dependencies
            install_dependencies
            ;;
        "start"|"s")
            check_dependencies
            start_services
            ;;
        "help"|"h")
            echo "用法: $0 [命令]"
            echo ""
            echo "命令:"
            echo "  install, i    安装所有依赖"
            echo "  start, s      启动开发服务"
            echo "  help, h       显示帮助"
            echo ""
            echo "快速开始:"
            echo "  $0 install    # 首次运行，安装依赖"
            echo "  $0 start      # 启动开发环境"
            ;;
        *)
            echo "❌ 未知命令: $1"
            echo "运行 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 