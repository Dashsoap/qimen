#!/bin/bash

# 丁未奇门遁甲后端服务统一启动脚本
# 支持开发模式、生产模式、后台模式

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示帮助信息
show_help() {
    echo "🔮 丁未奇门遁甲后端服务启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  dev         开发模式 (带自动重启)"
    echo "  start       生产模式"
    echo "  daemon      后台守护进程模式"
    echo "  stop        停止后台服务"
    echo "  status      检查服务状态"
    echo "  install     安装依赖并初始化"
    echo "  -h, --help  显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 install    # 首次安装"
    echo "  $0 dev        # 开发模式"
    echo "  $0 daemon     # 后台运行"
    echo "  $0 stop       # 停止服务"
}

# 检查环境
check_environment() {
    print_info "检查运行环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "未安装Node.js"
        print_info "请访问 https://nodejs.org 安装Node.js"
        exit 1
    fi
    print_success "Node.js版本: $(node --version)"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "未安装npm"
        exit 1
    fi
    print_success "npm版本: $(npm --version)"
    
    # 检查主文件
    if [ ! -f "app.js" ]; then
        print_error "app.js 文件不存在"
        print_info "请确保您在正确的目录中"
        exit 1
    fi
    print_success "主文件检查通过"
}

# 安装依赖
install_dependencies() {
    print_info "安装依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "依赖安装失败"
        exit 1
    fi
    print_success "依赖安装完成"
}

# 检查配置文件
check_config() {
    print_info "检查配置文件..."
    
    if [ ! -f "config.env" ] && [ ! -f ".env" ] && [ ! -f ".env.development" ]; then
        print_warning "未找到配置文件，正在创建默认配置..."
        
        cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./data/qimen.db"

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# AI服务配置 (请替换为您的真实配置)
ARK_API_KEY=your-api-key-here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=ep-20241230140417-ddrhs
EOF
        
        print_success "默认配置文件已创建: .env.development"
        print_warning "请编辑配置文件设置您的API密钥"
    fi
    print_success "配置文件检查通过"
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    
    # 确保数据目录存在
    mkdir -p data
    
    # 生成Prisma客户端
    npx prisma generate
    
    # 推送数据库架构
    npx prisma db push
    
    if [ $? -ne 0 ]; then
        print_error "数据库初始化失败"
        exit 1
    fi
    print_success "数据库初始化完成"
}

# 完整安装
full_install() {
    print_info "开始完整安装..."
    check_environment
    install_dependencies
    check_config
    init_database
    print_success "安装完成！"
    print_info "运行 '$0 dev' 启动开发模式"
    print_info "运行 '$0 daemon' 启动后台服务"
}

# 开发模式
start_dev() {
    print_info "启动开发模式..."
    check_environment
    
    if [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    print_success "🔮 启动丁未奇门遁甲服务 (开发模式)..."
    npm run dev
}

# 生产模式
start_production() {
    print_info "启动生产模式..."
    check_environment
    
    if [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    print_success "🔮 启动丁未奇门遁甲服务 (生产模式)..."
    npm start
}

# 后台守护进程模式
start_daemon() {
    print_info "启动后台守护进程模式..."
    check_environment
    
    # 停止现有进程
    stop_daemon
    
    if [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    # 确保日志目录存在
    mkdir -p logs
    
    print_info "🔮 启动丁未奇门遁甲服务 (守护进程模式)..."
    nohup node app.js > logs/server.log 2>&1 &
    
    # 获取进程ID
    PID=$!
    echo $PID > logs/server.pid
    
    print_success "服务已在后台启动 (PID: $PID)"
    print_info "查看日志: tail -f logs/server.log"
    print_info "停止服务: $0 stop"
    
    # 等待确保服务启动
    sleep 3
    
    # 检查服务状态
    if check_service_running; then
        print_success "✅ 服务运行正常"
        print_info "🌐 访问地址: http://localhost:3001"
    else
        print_error "服务启动失败，请检查日志"
        if [ -f "logs/server.log" ]; then
            print_info "最近日志:"
            tail -20 logs/server.log
        fi
    fi
}

# 停止守护进程
stop_daemon() {
    if [ -f "logs/server.pid" ]; then
        PID=$(cat logs/server.pid)
        if kill -0 $PID 2>/dev/null; then
            print_info "停止服务 (PID: $PID)..."
            kill $PID
            sleep 2
            if kill -0 $PID 2>/dev/null; then
                print_warning "强制终止服务..."
                kill -9 $PID
            fi
            rm -f logs/server.pid
            print_success "服务已停止"
        else
            print_info "服务未运行"
            rm -f logs/server.pid
        fi
    else
        # 尝试根据进程名停止
        pkill -f "node.*app.js" && print_success "服务已停止" || print_info "未找到运行的服务"
    fi
}

# 检查服务是否运行
check_service_running() {
    if [ -f "logs/server.pid" ]; then
        PID=$(cat logs/server.pid)
        if kill -0 $PID 2>/dev/null; then
            return 0
        fi
    fi
    pgrep -f "node.*app.js" > /dev/null
}

# 显示服务状态
show_status() {
    if check_service_running; then
        if [ -f "logs/server.pid" ]; then
            PID=$(cat logs/server.pid)
            print_success "服务运行中 (PID: $PID)"
        else
            PID=$(pgrep -f "node.*app.js")
            print_success "服务运行中 (PID: $PID)"
        fi
        print_info "🌐 访问地址: http://localhost:3001"
        
        if [ -f "logs/server.log" ]; then
            print_info "最近日志 (最后10行):"
            tail -10 logs/server.log
        fi
    else
        print_info "服务未运行"
    fi
}

# 主程序
case "${1:-start}" in
    "install")
        full_install
        ;;
    "dev")
        start_dev
        ;;
    "start" | "production")
        start_production
        ;;
    "daemon")
        start_daemon
        ;;
    "stop")
        stop_daemon
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_daemon
        sleep 2
        start_daemon
        ;;
    "-h" | "--help" | "help")
        show_help
        ;;
    *)
        print_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac