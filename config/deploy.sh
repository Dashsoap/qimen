#!/bin/bash

# 丁未奇门遁甲 - React版本部署脚本
# 目标服务器: 101.201.148.8
# React + Vue + Taro(H5) 支持，优先部署 Taro(H5) 版本

set -euo pipefail

# 自动定位到项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔍 脚本位置: $SCRIPT_DIR"
echo "📁 项目根目录: $PROJECT_ROOT"

# 切换到项目根目录
cd "$PROJECT_ROOT"

SERVER_IP="101.201.148.8"
SERVER_USER="root"
BACKEND_PATH="/home/qimen-backend"
FRONTEND_PATH="/home/qimen-frontend"

echo "🚀 开始部署丁未奇门遁甲系统 (React版本)..."
echo "========================================"

# 1. 清理本地垃圾文件
echo "🧹 清理本地垃圾文件..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
rm -rf apps/backend/node_modules apps/backend/logs 2>/dev/null || true
rm -rf apps/frontend-react/node_modules apps/frontend-react/dist 2>/dev/null || true
rm -rf apps/frontend-vue/node_modules apps/frontend-vue/dist 2>/dev/null || true
# 兼容旧结构
rm -rf backend/node_modules backend/logs 2>/dev/null || true
rm -rf frontend/node_modules frontend/dist 2>/dev/null || true
rm -rf react-frontend/node_modules react-frontend/dist 2>/dev/null || true
# 新结构：Taro 项目
rm -rf qimen-taro/node_modules qimen-taro/dist 2>/dev/null || true

# 2. 预检查
echo "🔍 预检查本地环境..."
if [ ! -d "apps/backend" ]; then
    echo "❌ 错误: apps/backend目录不存在"
    exit 1
fi

# 优先检查 Taro(H5) 前端，其次 React，再次 Vue
FRONTEND_DIR=""
if [ -d "qimen-taro" ]; then
    FRONTEND_DIR="qimen-taro"
    echo "✅ 检测到 Taro 前端项目，将部署 Taro H5 版本"
elif [ -d "apps/frontend-react" ]; then
    FRONTEND_DIR="apps/frontend-react"
    echo "✅ 检测到React前端项目，将部署React版本"
elif [ -d "apps/frontend-vue" ]; then
    FRONTEND_DIR="apps/frontend-vue"
    echo "⚠️  未找到React前端，将部署Vue版本"
elif [ -d "react-frontend" ]; then
    FRONTEND_DIR="react-frontend"
    echo "✅ 检测到React前端项目(旧结构)，将部署React版本"
elif [ -d "frontend" ]; then
    FRONTEND_DIR="frontend"
    echo "⚠️  未找到React前端，将部署Vue版本(旧结构)"
else
    echo "❌ 错误: 前端目录不存在"
    echo "   查找路径: qimen-taro, apps/frontend-react, apps/frontend-vue, react-frontend, frontend"
    exit 1
fi

if [ ! -f "apps/backend/app.js" ]; then
    echo "❌ 错误: apps/backend/app.js不存在"
    exit 1
fi

echo "✅ 预检查通过，使用前端目录: $FRONTEND_DIR"

# 3. 构建前端
echo "🎨 构建前端 ($FRONTEND_DIR)..."
cd $FRONTEND_DIR

# 创建生产环境配置
if [ "$FRONTEND_DIR" = "qimen-taro" ]; then
    # Taro(H5) 版本环境配置 (Vite ENV)
    cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://101.201.148.8:3001
VITE_APP_TITLE=丁未奇门遁甲
VITE_APP_VERSION=2.0.0
VITE_BUILD_TARGET=web
NODE_ENV=production
EOF
    echo "✅ 创建Taro(H5)版本环境配置"
elif [ "$FRONTEND_DIR" = "apps/frontend-react" ] || [ "$FRONTEND_DIR" = "react-frontend" ]; then
    # React版本环境配置
    cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://101.201.148.8:3001
VITE_APP_TITLE=丁未奇门遁甲
VITE_APP_VERSION=2.0.0
NODE_ENV=production
EOF
    echo "✅ 创建React版本环境配置"
else
    # Vue版本环境配置
    cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://101.201.148.8:3001
VITE_APP_TITLE=丁未奇门遁甲
VITE_APP_VERSION=2.0.0
EOF
    echo "✅ 创建Vue版本环境配置"
fi

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误: $FRONTEND_DIR/package.json不存在"
    exit 1
fi

# 安装依赖并构建
echo "📦 安装前端依赖..."
npm install

echo "🔨 构建前端应用..."
if [ "$FRONTEND_DIR" = "qimen-taro" ]; then
    npm run build:h5
else
    npm run build
fi

# 检查构建输出
BUILD_DIR=""
if [ -d "dist" ]; then
    BUILD_DIR="dist"
elif [ -d "build" ]; then
    BUILD_DIR="build"
else
    echo "❌ 错误: 构建输出目录不存在 (dist 或 build)"
    exit 1
fi

echo "✅ 前端构建完成，输出目录: $BUILD_DIR"

# 确保回到项目根目录
cd "$PROJECT_ROOT"

# 4. 上传并部署
echo "📤 上传文件到服务器..."
echo "当前工作目录: $(pwd)"
echo "后端源目录: $PROJECT_ROOT/apps/backend/"
echo "前端源目录: $PROJECT_ROOT/$FRONTEND_DIR/$BUILD_DIR/"

rsync -avz --delete --exclude='node_modules' --exclude='logs' --exclude='*.log' \
    "$PROJECT_ROOT/apps/backend/" ${SERVER_USER}@${SERVER_IP}:${BACKEND_PATH}/

rsync -avz --delete "$PROJECT_ROOT/$FRONTEND_DIR/$BUILD_DIR/" ${SERVER_USER}@${SERVER_IP}:${FRONTEND_PATH}/

# 5. 服务器端部署
echo "🔧 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 确保 Node.js 20+（安装 nvm 并安装/切换到 Node 20 LTS）
    if command -v node >/dev/null 2>&1; then
        NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
    else
        NODE_MAJOR=0
    fi
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo "📦 安装/升级 Node.js 到 20 LTS..."
        export NVM_DIR="$HOME/.nvm"
        if [ ! -d "$NVM_DIR" ]; then
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        fi
        . "$NVM_DIR/nvm.sh"
        nvm install --lts=Hydrogen || nvm install 20
        nvm alias default 20
        nvm use default
    fi
    # 停止现有服务
    echo "⏹️ 停止现有服务..."
    pkill -f "node.*app.js" || true
    pm2 stop qimen-backend || true
    pm2 delete qimen-backend || true
    
    # 进入后端目录
    cd /home/qimen-backend
    
    # 配置npm镜像
    npm config set registry https://registry.npmmirror.com/
    npm config set fetch-retries 5
    npm config set fetch-retry-mintimeout 20000
    npm config set fetch-retry-maxtimeout 120000
    npm config set progress false
    npm config set fund false
    npm config set audit false
    export npm_config_loglevel=warn
    
    # 安装依赖
    echo "📦 安装后端依赖..."
    rm -rf node_modules
    
    # 确保目录存在并有正确权限
    pwd
    ls -la
    
    # 使用更稳定的安装方式（优先 ci，保留 lockfile）
    if [ -f package-lock.json ]; then
        npm ci --omit=dev --omit=optional --no-audit --no-optional --unsafe-perm || npm ci --omit=dev --no-audit --unsafe-perm
    else
        npm install --omit=dev --omit=optional --no-audit --no-optional --unsafe-perm
    fi
    
    # 初始化数据库
    echo "🗄️ 初始化数据库..."
    export NODE_ENV=production
    export DATABASE_URL="file:./prisma/prod.db"
    mkdir -p prisma logs
    npx prisma generate
    npx prisma db push --force-reset
    
    # 生成 PM2 配置（CommonJS）
    if [ ! -f ecosystem.config.cjs ]; then
      cat > ecosystem.config.cjs << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'qimen-backend',
      script: 'app.js',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./prisma/prod.db'
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true,
      watch: false
    }
  ]
}
PM2_EOF
    fi

    # 启动服务
    echo "🚀 启动后端服务..."
    pm2 start ecosystem.config.cjs --env production || pm2 restart qimen-backend || true
    pm2 save
    
    # 配置nginx
    echo "🌐 配置nginx..."
    cat > /etc/nginx/sites-available/qimen << 'NGINX_EOF'
server {
    listen 80;
    server_name 101.201.148.8;
    
    # 前端静态文件
    location / {
        root /home/qimen-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存优化
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理到后端
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
    }
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
NGINX_EOF
    
    # 启用nginx配置
    ln -sf /etc/nginx/sites-available/qimen /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    systemctl enable nginx
    
    # 等待服务启动（重试机制）
    echo "⏳ 等待后端 3001 端口就绪..."
    for i in $(seq 1 20); do
      if curl -fsS http://127.0.0.1:3001/health >/dev/null 2>&1; then
        echo "✅ 后端健康检查通过"
        break
      fi
      sleep 2
    done
    
    # 健康检查
    echo "🧪 执行健康检查..."
    if pm2 status | grep -q "online"; then
        echo "✅ PM2服务运行正常"
    else
        echo "❌ PM2服务异常"
    fi
    
    curl -f http://localhost:3001/health > /dev/null 2>&1 && echo "✅ 后端API健康检查通过" || echo "❌ 后端API健康检查失败"
    
    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ 前端服务访问正常"
    else
        echo "❌ 前端服务访问异常"
    fi
    
    echo "✅ 部署完成"
EOF

# 6. 最终状态检查
echo "🧪 最终状态检查..."
sleep 5

ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    echo "📊 服务状态报告:"
    echo "========================================"
    
    # 检查PM2状态
    echo "🔧 PM2服务状态:"
    pm2 status
    
    # 检查端口监听
    echo ""
    echo "🌐 端口监听状态:"
    netstat -tuln | grep -E ":80|:3001" || echo "未找到监听端口"
    
    # 检查进程
    echo ""
    echo "⚙️ 相关进程:"
    ps aux | grep -E "node|nginx" | grep -v grep || echo "未找到相关进程"
    
    # 检查磁盘空间
    echo ""
    echo "💾 磁盘使用情况:"
    df -h / | tail -1
    
    # 检查前端文件
    echo ""
    echo "📁 前端文件状态:"
    ls -la /home/qimen-frontend/ | head -10
    
    echo ""
    echo "📝 如需查看日志:"
    echo "   PM2日志: pm2 logs qimen-backend"
    echo "   Nginx日志: tail -f /var/log/nginx/error.log"
    echo "   Nginx访问日志: tail -f /var/log/nginx/access.log"
EOF

echo ""
echo "🎉 丁未奇门遁甲 (React版本) 部署完成！"
echo "========================================"
echo "📋 部署信息:"
echo "   前端版本: $FRONTEND_DIR"
echo "   构建输出: $BUILD_DIR"
echo ""
echo "🌐 访问地址:"
echo "   前端应用: http://101.201.148.8"
echo "   后端API: http://101.201.148.8/api"
echo "   健康检查: http://101.201.148.8/health"
echo ""
echo "🔧 服务管理命令:"
echo "   查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "   查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs qimen-backend'"
echo "   重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 restart qimen-backend'"
echo "   停止服务: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 stop qimen-backend'"
echo ""
echo "🌐 Nginx管理:"
echo "   重启Nginx: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl restart nginx'"
echo "   查看Nginx状态: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl status nginx'"
echo "   查看Nginx日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo "   查看访问日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/access.log'"
echo ""
echo "📊 系统监控:"
echo "   查看系统资源: ssh ${SERVER_USER}@${SERVER_IP} 'htop'"
echo "   查看端口占用: ssh ${SERVER_USER}@${SERVER_IP} 'netstat -tuln | grep -E \":80|:3001\"'"
echo "   查看进程状态: ssh ${SERVER_USER}@${SERVER_IP} 'ps aux | grep -E \"node|nginx\"'"
echo ""
echo "🚀 部署成功！现在可以访问您的丁未奇门遁甲 React 应用了！"