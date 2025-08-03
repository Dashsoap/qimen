#!/bin/bash

# 丁未奇门遁甲 - 优化部署脚本
# 目标服务器: 101.201.148.8
# 快速上线版本，专注稳定性

set -e

SERVER_IP="101.201.148.8"
SERVER_USER="root"
BACKEND_PATH="/home/qimen-backend"
FRONTEND_PATH="/home/qimen-frontend"

echo "🚀 开始部署丁未奇门遁甲系统..."
echo "========================================"

# 1. 清理本地垃圾文件
echo "🧹 清理本地垃圾文件..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
rm -rf backend/node_modules backend/logs 2>/dev/null || true
rm -rf frontend/node_modules frontend/dist 2>/dev/null || true

# 2. 预检查
echo "🔍 预检查本地环境..."
if [ ! -d "backend" ]; then
    echo "❌ 错误: backend目录不存在"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ 错误: frontend目录不存在"
    exit 1
fi

if [ ! -f "backend/app.js" ]; then
    echo "❌ 错误: backend/app.js不存在"
    exit 1
fi

echo "✅ 预检查通过"

# 3. 构建前端
echo "🎨 构建前端..."
cd frontend

# 创建生产环境配置
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://101.201.148.8:3001
VITE_APP_TITLE=丁未奇门遁甲
VITE_APP_VERSION=2.0.0
EOF

# 安装依赖并构建
npm install
npm run build

cd ..

# 4. 上传并部署
echo "📤 上传文件到服务器..."
rsync -avz --exclude='node_modules' --exclude='logs' --exclude='*.log' \
    ./backend/ ${SERVER_USER}@${SERVER_IP}:${BACKEND_PATH}/

rsync -avz ./frontend/dist/ ${SERVER_USER}@${SERVER_IP}:${FRONTEND_PATH}/

# 5. 服务器端部署
echo "🔧 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止现有服务
    echo "⏹️ 停止现有服务..."
    pkill -f "node.*app.js" || true
    pm2 stop qimen-backend || true
    pm2 delete qimen-backend || true
    
    # 进入后端目录
    cd /home/qimen-backend
    
    # 配置npm镜像
    npm config set registry https://registry.npmmirror.com/
    
    # 安装依赖
    echo "📦 安装后端依赖..."
    rm -rf node_modules package-lock.json
    
    # 确保目录存在并有正确权限
    pwd
    ls -la
    
    # 使用更稳定的安装方式
    npm cache clean --force
    npm install --omit=dev --no-audit --no-optional --unsafe-perm
    
    # 初始化数据库
    echo "🗄️ 初始化数据库..."
    export NODE_ENV=production
    export DATABASE_URL="file:./prisma/prod.db"
    mkdir -p prisma logs
    npx prisma generate
    npx prisma db push --force-reset
    
    # 启动服务
    echo "🚀 启动后端服务..."
    pm2 start ecosystem.config.js --env production
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
    }
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_EOF
    
    # 启用nginx配置
    ln -sf /etc/nginx/sites-available/qimen /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    systemctl enable nginx
    
    # 等待服务启动
    sleep 10
    
    # 健康检查
    echo "🧪 执行健康检查..."
    if pm2 status | grep -q "online"; then
        echo "✅ PM2服务运行正常"
    else
        echo "❌ PM2服务异常"
    fi
    
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 后端API健康检查通过"
    else
        echo "❌ 后端API健康检查失败"
    fi
    
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
    
    echo ""
    echo "📝 如需查看日志:"
    echo "   PM2日志: pm2 logs qimen-backend"
    echo "   Nginx日志: tail -f /var/log/nginx/error.log"
EOF

echo ""
echo "🎉 丁未奇门遁甲部署完成！"
echo "========================================"
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
echo ""
echo "📊 系统监控:"
echo "   查看系统资源: ssh ${SERVER_USER}@${SERVER_IP} 'htop'"
echo "   查看端口占用: ssh ${SERVER_USER}@${SERVER_IP} 'netstat -tuln | grep -E \":80|:3001\"'"
echo "   查看进程状态: ssh ${SERVER_USER}@${SERVER_IP} 'ps aux | grep -E \"node|nginx\"'"
echo ""
echo "🚀 部署成功！现在可以访问您的丁未奇门遁甲应用了！"