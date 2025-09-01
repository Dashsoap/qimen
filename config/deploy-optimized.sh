#!/bin/bash

# 丁未奇门遁甲 - 高性能版本部署脚本
# 支持PostgreSQL、Redis、PM2集群模式

set -euo pipefail

# ===== 配置部分 =====
SERVER_IP="${DEPLOY_SERVER:-101.201.148.8}"
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_PORT="${DEPLOY_PORT:-22}"
BACKEND_PATH="/home/qimen-backend"
FRONTEND_PATH="/home/qimen-frontend"
BACKUP_PATH="/home/backups/qimen"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 自动定位到项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_info "脚本位置: $SCRIPT_DIR"
log_info "项目根目录: $PROJECT_ROOT"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# ===== 函数定义 =====

# 检查依赖
check_dependencies() {
    log_info "检查本地依赖..."
    
    local deps=("node" "npm" "rsync" "ssh")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep 未安装"
            exit 1
        fi
    done
    
    # 检查Node版本
    local node_version=$(node -v | sed 's/v\([0-9]*\).*/\1/')
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 版本需要 >= 18，当前版本: $(node -v)"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 清理本地文件
clean_local() {
    log_info "清理本地垃圾文件..."
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    log_success "本地清理完成"
}

# 检测前端项目
detect_frontend() {
    local frontend_dir=""
    
    if [ -d "qimen-taro" ]; then
        frontend_dir="qimen-taro"
        log_info "检测到 Taro 前端项目"
    elif [ -d "apps/frontend-react" ]; then
        frontend_dir="apps/frontend-react"
        log_info "检测到 React 前端项目"
    elif [ -d "apps/frontend-vue" ]; then
        frontend_dir="apps/frontend-vue"
        log_info "检测到 Vue 前端项目"
    else
        log_error "未找到前端项目"
        exit 1
    fi
    
    echo "$frontend_dir"
}

# 构建前端
build_frontend() {
    local frontend_dir=$1
    log_info "构建前端项目: $frontend_dir"
    
    cd "$PROJECT_ROOT/$frontend_dir"
    
    # 创建生产环境配置
    cat > .env.production << EOF
VITE_API_BASE_URL=http://${SERVER_IP}:3001
VITE_APP_TITLE=丁未奇门遁甲
VITE_APP_VERSION=3.1.0
NODE_ENV=production
EOF
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm ci --prefer-offline --no-audit --no-fund 2>/dev/null || npm install
    
    # 构建
    log_info "构建前端应用..."
    if [ "$frontend_dir" = "qimen-taro" ]; then
        npm run build:h5
    else
        npm run build
    fi
    
    # 检查构建输出
    local build_dir=""
    if [ -d "dist" ]; then
        build_dir="dist"
    elif [ -d "build" ]; then
        build_dir="build"
    else
        log_error "构建输出目录不存在"
        exit 1
    fi
    
    log_success "前端构建完成: $build_dir"
    echo "$build_dir"
}

# 创建服务器备份
create_backup() {
    log_info "创建服务器备份..."
    
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'EOF'
        # 创建备份目录
        mkdir -p /home/backups/qimen
        
        # 备份时间戳
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        # 备份数据库
        if [ -f /home/qimen-backend/prisma/prod.db ]; then
            cp /home/qimen-backend/prisma/prod.db /home/backups/qimen/prod_${TIMESTAMP}.db
            echo "✅ 数据库已备份"
        fi
        
        # 备份配置文件
        if [ -f /home/qimen-backend/.env ]; then
            cp /home/qimen-backend/.env /home/backups/qimen/env_${TIMESTAMP}
            echo "✅ 配置文件已备份"
        fi
        
        # 清理旧备份（保留最近7天）
        find /home/backups/qimen -mtime +7 -delete
        
        echo "✅ 备份完成: /home/backups/qimen/"
EOF
    
    log_success "服务器备份完成"
}

# 部署后端
deploy_backend() {
    log_info "部署后端服务..."
    
    # 准备后端文件
    cd "$PROJECT_ROOT"
    
    # 复制生产环境配置
    if [ -f "apps/backend/.env.production" ]; then
        cp apps/backend/.env.production apps/backend/.env
    fi
    
    # 上传后端代码
    log_info "上传后端代码..."
    rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='logs' \
        --exclude='*.log' \
        --exclude='prisma/*.db' \
        --exclude='.env.development' \
        -e "ssh -p ${SERVER_PORT}" \
        "$PROJECT_ROOT/apps/backend/" \
        ${SERVER_USER}@${SERVER_IP}:${BACKEND_PATH}/
    
    log_success "后端代码上传完成"
}

# 部署前端
deploy_frontend() {
    local frontend_dir=$1
    local build_dir=$2
    
    log_info "部署前端应用..."
    
    rsync -avz --delete \
        -e "ssh -p ${SERVER_PORT}" \
        "$PROJECT_ROOT/$frontend_dir/$build_dir/" \
        ${SERVER_USER}@${SERVER_IP}:${FRONTEND_PATH}/
    
    log_success "前端部署完成"
}

# 服务器端设置
setup_server() {
    log_info "配置服务器环境..."
    
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'REMOTE_SCRIPT'
        set -e
        
        echo "📦 检查系统依赖..."
        
        # 安装必要的系统包
        if ! command -v postgresql &> /dev/null; then
            echo "安装 PostgreSQL..."
            apt-get update
            apt-get install -y postgresql postgresql-contrib
            systemctl enable postgresql
            systemctl start postgresql
        fi
        
        if ! command -v redis-server &> /dev/null; then
            echo "安装 Redis..."
            apt-get install -y redis-server
            systemctl enable redis-server
            systemctl start redis-server
        fi
        
        # 配置PostgreSQL
        echo "🐘 配置 PostgreSQL..."
        sudo -u postgres psql << SQL
            -- 创建数据库和用户（如果不存在）
            DO \$\$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'qimen_user') THEN
                    CREATE USER qimen_user WITH PASSWORD 'qimen_password_2024';
                END IF;
            END\$\$;
            
            -- 创建数据库
            SELECT 'CREATE DATABASE qimen_production OWNER qimen_user'
            WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'qimen_production')\gexec
            
            -- 授权
            GRANT ALL PRIVILEGES ON DATABASE qimen_production TO qimen_user;
SQL
        
        # 配置Redis
        echo "🔴 配置 Redis..."
        if ! grep -q "maxmemory 256mb" /etc/redis/redis.conf; then
            echo "maxmemory 256mb" >> /etc/redis/redis.conf
            echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
            systemctl restart redis-server
        fi
        
        # 安装Node.js (通过nvm)
        echo "📦 检查 Node.js..."
        export NVM_DIR="$HOME/.nvm"
        if [ ! -d "$NVM_DIR" ]; then
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        fi
        . "$NVM_DIR/nvm.sh"
        
        NODE_MAJOR=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/' || echo "0")
        if [ "$NODE_MAJOR" -lt 18 ]; then
            nvm install 18
            nvm alias default 18
            nvm use 18
        fi
        
        # 安装PM2
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        # 停止现有服务
        pm2 stop qimen-backend 2>/dev/null || true
        pm2 delete qimen-backend 2>/dev/null || true
        
        # 进入后端目录
        cd /home/qimen-backend
        
        # 设置生产环境变量
        cat > .env << 'ENV_FILE'
NODE_ENV=production
DATABASE_URL="postgresql://qimen_user:qimen_password_2024@localhost:5432/qimen_production?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3001
JWT_SECRET=production-jwt-secret-change-this-$(openssl rand -hex 32)
OPENAI_API_KEY=${OPENAI_API_KEY:-your-api-key}
ENV_FILE
        
        # 安装依赖
        echo "📦 安装后端依赖..."
        npm ci --omit=dev --no-audit || npm install --omit=dev
        
        # 初始化数据库
        echo "🗄️ 初始化数据库..."
        npx prisma generate
        npx prisma db push --accept-data-loss
        
        # 创建PM2配置
        cat > ecosystem.config.js << 'PM2_CONFIG'
module.exports = {
  apps: [{
    name: 'qimen-backend',
    script: 'app-refactored.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
PM2_CONFIG
        
        # 创建日志目录
        mkdir -p logs
        
        # 启动服务
        echo "🚀 启动后端服务..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup systemd -u root --hp /root || true
        
        # 配置Nginx
        echo "🌐 配置 Nginx..."
        cat > /etc/nginx/sites-available/qimen << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 10M;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # 前端静态文件
    location / {
        root /home/qimen-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001;
        access_log off;
    }
}
NGINX_CONFIG
        
        # 启用Nginx配置
        ln -sf /etc/nginx/sites-available/qimen /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx
        
        echo "✅ 服务器配置完成"
REMOTE_SCRIPT
    
    log_success "服务器环境配置完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 5
    
    # 检查后端API
    if curl -f "http://${SERVER_IP}:3001/health" &> /dev/null; then
        log_success "后端API健康检查通过"
    else
        log_error "后端API健康检查失败"
        exit 1
    fi
    
    # 检查前端
    if curl -f "http://${SERVER_IP}" &> /dev/null; then
        log_success "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        exit 1
    fi
    
    # 显示服务状态
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'EOF'
        echo ""
        echo "📊 服务状态:"
        echo "=============="
        pm2 status
        echo ""
        echo "📊 数据库状态:"
        systemctl status postgresql --no-pager | head -5
        echo ""
        echo "📊 Redis状态:"
        redis-cli ping
        echo ""
        echo "📊 端口监听:"
        netstat -tlnp | grep -E ":(80|3001|5432|6379)"
EOF
}

# ===== 主流程 =====
main() {
    echo "🚀 开始部署丁未奇门遁甲系统（高性能版）"
    echo "=========================================="
    
    # 1. 检查依赖
    check_dependencies
    
    # 2. 清理本地
    clean_local
    
    # 3. 检测前端
    FRONTEND_DIR=$(detect_frontend)
    
    # 4. 构建前端
    BUILD_DIR=$(build_frontend "$FRONTEND_DIR")
    
    # 5. 创建备份
    if [ "${SKIP_BACKUP:-false}" != "true" ]; then
        create_backup
    fi
    
    # 6. 部署后端
    deploy_backend
    
    # 7. 部署前端
    deploy_frontend "$FRONTEND_DIR" "$BUILD_DIR"
    
    # 8. 配置服务器
    setup_server
    
    # 9. 健康检查
    health_check
    
    # 完成
    echo ""
    echo "🎉 部署完成！"
    echo "=========================================="
    echo "📋 部署信息:"
    echo "   前端地址: http://${SERVER_IP}"
    echo "   后端API: http://${SERVER_IP}:3001/api"
    echo "   健康检查: http://${SERVER_IP}/health"
    echo ""
    echo "🔧 管理命令:"
    echo "   SSH连接: ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP}"
    echo "   查看日志: pm2 logs qimen-backend"
    echo "   重启服务: pm2 restart qimen-backend"
    echo "   监控状态: pm2 monit"
    echo ""
    echo "📊 数据库管理:"
    echo "   PostgreSQL: psql -U qimen_user -d qimen_production"
    echo "   Redis监控: redis-cli monitor"
    echo ""
    echo "🚀 系统已成功部署并运行！"
}

# 执行主流程
main "$@"