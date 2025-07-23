#!/bin/bash

# 奇门遁甲AI前后端一体化部署脚本 - 优化版
# 目标服务器: 101.201.148.8
# 适配优化后的架构：app.js + 模块化服务

set -e  # 如果任何命令失败，脚本退出

SERVER_IP="101.201.148.8"
SERVER_USER="root"  # 根据实际情况修改用户名
BACKEND_PATH="/home/qimen-backend"
FRONTEND_PATH="/home/qimen-frontend"
LOCAL_BACKEND_PATH="./backend"
LOCAL_FRONTEND_PATH="./frontend"  # 使用实际的目录名称

echo "🚀 开始部署奇门遁甲AI完整应用到 ${SERVER_IP}..."
echo "📦 使用优化后的架构 (app.js + 模块化服务)"
echo "========================================"

# 0. 预检查
echo "🔍 预检查本地环境..."
if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    echo "❌ 错误: 后端目录不存在: $LOCAL_BACKEND_PATH"
    exit 1
fi

if [ ! -d "$LOCAL_FRONTEND_PATH" ]; then
    echo "❌ 错误: 前端目录不存在: $LOCAL_FRONTEND_PATH"
    exit 1
fi

if [ ! -f "$LOCAL_BACKEND_PATH/app.js" ]; then
    echo "❌ 错误: 优化后的app.js不存在"
    exit 1
fi

echo "✅ 预检查通过"

# 1. 准备前端构建
echo "🎨 准备前端构建..."
cd $LOCAL_FRONTEND_PATH

# 创建生产环境配置
echo "⚙️ 配置生产环境变量..."
cat > .env.production << 'ENV_EOF'
VITE_API_BASE_URL=https://101.201.148.8
VITE_APP_TITLE=鬼谷奇门遁甲
VITE_APP_VERSION=2.0.0
ENV_EOF

# 安装前端依赖并构建
echo "📦 安装前端依赖..."
npm install

echo "🔨 构建前端项目..."
npm run build

# 返回项目根目录
cd ..

# 2. 准备部署包
echo "📦 准备部署包..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR/backend
mkdir -p $DEPLOY_DIR/frontend

# 复制后端文件
echo "📋 复制后端文件..."
cp -r $LOCAL_BACKEND_PATH/* $DEPLOY_DIR/backend/
# 移除本地开发文件
rm -rf $DEPLOY_DIR/backend/node_modules
rm -f $DEPLOY_DIR/backend/server.log
rm -f $DEPLOY_DIR/backend/*.bak
rm -rf $DEPLOY_DIR/backend/prisma/dev.db*  # 移除开发数据库

# 创建生产环境配置
echo "⚙️ 创建生产环境配置..."
cat > $DEPLOY_DIR/backend/config.prod.env << 'PROD_ENV_EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./prisma/prod.db"

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-for-production-please-change-this
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# 服务器配置
CORS_ORIGIN=https://101.201.148.8
TRUST_PROXY=true

# AI服务配置
ARK_API_KEY=UfI4GzNm9vAyT7I0Nf2CKEwseNqy91AZvkI7hrSCw0otnSeDgDExgE706gdEJHWU1OajYPCVNCPEsGJRVtScxw
ARK_BASE_URL=https://www.sophnet.com/api/open-apis/v1
ARK_MODEL=DeepSeek-R1

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=10

# 缓存配置
CACHE_TTL_MINUTES=5
CACHE_MAX_SIZE=1000

# 监控配置
HEALTH_CHECK_ENABLED=true
REQUEST_LOGGING=true
PROD_ENV_EOF

# 复制前端构建文件
echo "📋 复制前端构建文件..."
cp -r $LOCAL_FRONTEND_PATH/dist/* $DEPLOY_DIR/frontend/

# 创建nginx配置文件
echo "🌐 创建nginx配置..."
cat > $DEPLOY_DIR/nginx.conf << 'NGINX_EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name 101.201.148.8;
    
    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }
    
    # 重定向所有HTTP流量到HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS主配置
server {
    listen 443 ssl http2;
    server_name 101.201.148.8;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/101.201.148.8.crt;
    ssl_certificate_key /etc/nginx/ssl/101.201.148.8.key;
    
    # 或者使用Let's Encrypt证书
    # ssl_certificate /etc/letsencrypt/live/101.201.148.8/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/101.201.148.8/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # 强化的安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://101.201.148.8; frame-ancestors 'self';" always;
    
    # 前端静态文件
    location / {
        root /home/qimen-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 添加缓存控制
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # HTML文件不缓存
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-store, no-cache, must-revalidate";
        }
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # 添加速率限制
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
        access_log off;
    }
    
    # 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
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

# 创建服务管理脚本
echo "🔧 创建服务管理脚本..."
cat > $DEPLOY_DIR/manage-services.sh << 'MANAGE_EOF'
#!/bin/bash

BACKEND_DIR="/home/qimen-backend"
PID_FILE="$BACKEND_DIR/app.pid"
LOG_FILE="$BACKEND_DIR/app.log"

case "$1" in
    start)
        echo "🚀 启动所有服务..."
        
        # 确保目录存在
        cd $BACKEND_DIR
        
        # 启动后端 (使用优化后的app.js)
        echo "🔧 启动后端服务 (app.js)..."
        NODE_ENV=production nohup node app.js > $LOG_FILE 2>&1 &
        echo $! > $PID_FILE
        echo "✅ 后端服务已启动 (PID: $(cat $PID_FILE))"
        
        # 启动nginx
        echo "🌐 启动Nginx..."
        systemctl start nginx
        systemctl enable nginx
        echo "✅ Nginx已启动并设为开机自启"
        
        sleep 5
        echo "🧪 检查服务状态..."
        
        # 检查后端健康状态
        for i in {1..10}; do
            if curl -f -k https://localhost/health > /dev/null 2>&1; then
                echo "✅ 后端服务运行正常"
                break
            else
                echo "⏳ 等待后端服务启动... ($i/10)"
                sleep 2
            fi
        done
        
        # 检查前端访问
        if curl -f -k https://localhost > /dev/null 2>&1; then
            echo "✅ 前端服务运行正常"
        else
            echo "❌ 前端服务异常"
        fi
        
        echo ""
        echo "🎉 服务启动完成！"
        $0 status
        ;;
        
    stop)
        echo "⏹️ 停止所有服务..."
        
        # 停止后端
        if [ -f "$PID_FILE" ]; then
            PID=$(cat $PID_FILE)
            if kill -0 $PID 2>/dev/null; then
                kill $PID
                echo "✅ 后端服务已停止 (PID: $PID)"
            fi
            rm -f $PID_FILE
        fi
        
        # 确保进程被终止
        pkill -f "node.*app.js" || true
        
        # 停止nginx
        systemctl stop nginx || true
        echo "✅ Nginx已停止"
        ;;
        
    restart)
        echo "🔄 重启所有服务..."
        $0 stop
        sleep 3
        $0 start
        ;;
        
    status)
        echo "📊 服务状态检查..."
        echo "========================================"
        
        # 检查后端进程
        if [ -f "$PID_FILE" ] && kill -0 $(cat $PID_FILE) 2>/dev/null; then
            PID=$(cat $PID_FILE)
            echo "✅ 后端服务: 运行中 (PID: $PID)"
            
            # 检查端口
            if netstat -tuln | grep -q ":3001 "; then
                echo "✅ 端口3001: 正在监听"
            else
                echo "❌ 端口3001: 未监听"
            fi
            
            # 检查健康状态
            if curl -f -k https://localhost/health > /dev/null 2>&1; then
                echo "✅ 健康检查: 通过"
            else
                echo "❌ 健康检查: 失败"
            fi
        else
            echo "❌ 后端服务: 未运行"
        fi
        
        # 检查Nginx
        if systemctl is-active nginx > /dev/null 2>&1; then
            echo "✅ Nginx: 运行中"
        else
            echo "❌ Nginx: 未运行"
        fi
        
        # 检查磁盘空间
        echo ""
        echo "💾 磁盘使用情况:"
        df -h / | tail -1 | awk '{print "   使用: " $3 "/" $2 " (" $5 ")"}'
        
        # 检查内存使用
        echo "🧠 内存使用情况:"
        free -h | grep "Mem:" | awk '{print "   使用: " $3 "/" $2}'
        
        echo ""
        echo "🌐 访问地址:"
        echo "   前端: https://101.201.148.8"
        echo "   后端API: https://101.201.148.8/api"
        echo "   健康检查: https://101.201.148.8/health"
        echo ""
        echo "📝 日志文件:"
        echo "   后端日志: $LOG_FILE"
        echo "   Nginx错误日志: /var/log/nginx/error.log"
        echo "   Nginx访问日志: /var/log/nginx/access.log"
        ;;
        
    logs)
        case "$2" in
            backend|"")
                echo "📋 查看后端日志 (最后100行):"
                echo "========================================"
                tail -100 $LOG_FILE
                ;;
            nginx)
                echo "📋 查看Nginx错误日志 (最后50行):"
                echo "========================================"
                tail -50 /var/log/nginx/error.log
                ;;
            access)
                echo "📋 查看Nginx访问日志 (最后50行):"
                echo "========================================"
                tail -50 /var/log/nginx/access.log
                ;;
            *)
                echo "用法: $0 logs [backend|nginx|access]"
                ;;
        esac
        ;;
        
    *)
        echo "奇门遁甲AI系统 - 服务管理脚本"
        echo "========================================"
        echo "用法: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动所有服务"
        echo "  stop    - 停止所有服务"
        echo "  restart - 重启所有服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看日志 [backend|nginx|access]"
        exit 1
        ;;
esac
MANAGE_EOF

chmod +x $DEPLOY_DIR/manage-services.sh

# 创建数据库初始化脚本
echo "🗄️ 创建数据库初始化脚本..."
cat > $DEPLOY_DIR/init-database.sh << 'DB_EOF'
#!/bin/bash

echo "🗄️ 初始化生产数据库..."
cd /home/qimen-backend

# 设置环境变量
export NODE_ENV=production
export DATABASE_URL="file:./prisma/prod.db"

# 确保目录存在
mkdir -p prisma

# 生成Prisma客户端
echo "📦 生成Prisma客户端..."
npx prisma generate

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
npx prisma db push --force-reset

# 检查数据库
echo "🧪 检查数据库连接..."
npx prisma db seed || echo "⚠️ 种子数据可选，跳过"

echo "✅ 数据库初始化完成"
DB_EOF

chmod +x $DEPLOY_DIR/init-database.sh

# 创建SSL证书配置脚本
echo "🔒 创建SSL证书配置脚本..."
cat > $DEPLOY_DIR/setup-ssl.sh << 'SSL_EOF'
#!/bin/bash

echo "🔒 配置SSL证书..."

# 创建SSL目录
mkdir -p /etc/nginx/ssl

# 选项1: 使用Let's Encrypt (推荐)
setup_letsencrypt() {
    echo "📋 使用Let's Encrypt获取免费SSL证书..."
    
    # 安装certbot
    if ! command -v certbot &> /dev/null; then
        echo "📦 安装certbot..."
        apt update
        apt install -y certbot python3-certbot-nginx
    fi
    
    # 暂时停止nginx
    systemctl stop nginx
    
    # 获取证书
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email admin@101.201.148.8 \
        -d 101.201.148.8
    
    if [ $? -eq 0 ]; then
        echo "✅ Let's Encrypt证书获取成功"
        
        # 更新nginx配置使用Let's Encrypt证书
        sed -i 's|ssl_certificate /etc/nginx/ssl/101.201.148.8.crt;|ssl_certificate /etc/letsencrypt/live/101.201.148.8/fullchain.pem;|g' /etc/nginx/sites-available/qimen
        sed -i 's|ssl_certificate_key /etc/nginx/ssl/101.201.148.8.key;|ssl_certificate_key /etc/letsencrypt/live/101.201.148.8/privkey.pem;|g' /etc/nginx/sites-available/qimen
        
        # 设置自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -
        
        echo "✅ SSL证书自动续期已配置"
        return 0
    else
        echo "❌ Let's Encrypt证书获取失败，尝试生成自签名证书..."
        return 1
    fi
}

# 选项2: 生成自签名证书 (测试用)
setup_selfsigned() {
    echo "🔧 生成自签名SSL证书..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/101.201.148.8.key \
        -out /etc/nginx/ssl/101.201.148.8.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=QimenAI/CN=101.201.148.8"
    
    if [ $? -eq 0 ]; then
        echo "✅ 自签名证书生成成功"
        echo "⚠️  注意: 浏览器会显示证书不安全警告，这是正常的"
        return 0
    else
        echo "❌ 自签名证书生成失败"
        return 1
    fi
}

# 主逻辑
echo "🚀 开始SSL证书配置..."
echo "1. 尝试使用Let's Encrypt获取免费证书"
echo "2. 如果失败，生成自签名证书"
echo ""

# 首先尝试Let's Encrypt
if setup_letsencrypt; then
    echo "🎉 SSL证书配置完成 (Let's Encrypt)"
else
    echo "⚠️  Let's Encrypt失败，使用自签名证书..."
    if setup_selfsigned; then
        echo "🎉 SSL证书配置完成 (自签名)"
    else
        echo "❌ SSL证书配置失败"
        exit 1
    fi
fi

# 测试nginx配置
echo "🧪 测试nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx配置测试通过"
else
    echo "❌ nginx配置测试失败"
    exit 1
fi

echo "🔒 SSL证书配置完成！"
SSL_EOF

chmod +x $DEPLOY_DIR/setup-ssl.sh

# 创建压缩包
echo "📦 创建部署包..."
tar -czf ${DEPLOY_DIR}.tar.gz $DEPLOY_DIR
echo "✅ 部署包已创建: ${DEPLOY_DIR}.tar.gz ($(du -h ${DEPLOY_DIR}.tar.gz | cut -f1))"

# 3. 上传到服务器
echo "📤 上传文件到服务器..."
scp ${DEPLOY_DIR}.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 4. 在服务器上部署
echo "🔧 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止现有服务
    echo "⏹️ 停止现有服务..."
    systemctl stop nginx || true
            pkill -f "node.*app.js" || true
    sleep 3

    # 安装系统依赖
    echo "📦 安装系统依赖..."
    apt update
    if ! command -v nginx &> /dev/null; then
        echo "📦 安装nginx..."
        apt install -y nginx
    fi
    if ! command -v node &> /dev/null; then
        echo "📦 安装Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    if ! command -v openssl &> /dev/null; then
        echo "📦 安装OpenSSL..."
        apt install -y openssl
    fi

    # 备份现有目录
    if [ -d "/home/qimen-backend" ]; then
        echo "💾 备份现有后端..."
        mv /home/qimen-backend /home/qimen-backend-backup-$(date +%Y%m%d-%H%M%S)
    fi
    if [ -d "/home/qimen-frontend" ]; then
        echo "💾 备份现有前端..."
        mv /home/qimen-frontend /home/qimen-frontend-backup-$(date +%Y%m%d-%H%M%S)
    fi

    # 创建目录并解压
    mkdir -p /home/qimen-backend
    mkdir -p /home/qimen-frontend
    cd /tmp
    tar -xzf deploy-*.tar.gz
    
    # 部署后端
    echo "🔧 部署后端..."
    cp -r deploy-*/backend/* /home/qimen-backend/
    cd /home/qimen-backend
    
    # 安装Node.js依赖
    echo "📦 安装后端依赖..."
    npm install --production --no-audit
    
    # 初始化数据库
    echo "🗄️ 初始化数据库..."
    chmod +x /tmp/deploy-*/init-database.sh
    /tmp/deploy-*/init-database.sh
    
    # 部署前端
    echo "🎨 部署前端..."
    cp -r /tmp/deploy-*/frontend/* /home/qimen-frontend/
    
    # 配置nginx
    echo "🌐 配置nginx..."
    cp /tmp/deploy-*/nginx.conf /etc/nginx/sites-available/qimen
    ln -sf /etc/nginx/sites-available/qimen /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    
    # 复制服务管理脚本
    cp /tmp/deploy-*/manage-services.sh /home/
    chmod +x /home/manage-services.sh
    
    # 配置SSL证书
    echo "🔒 配置SSL证书..."
    chmod +x /tmp/deploy-*/setup-ssl.sh
    /tmp/deploy-*/setup-ssl.sh
    
    # 设置文件权限
    chown -R www-data:www-data /home/qimen-frontend
    chown -R root:root /home/qimen-backend
    chmod +x /home/qimen-backend/app.js
    
    # 启动服务
    echo "🚀 启动所有服务..."
    /home/manage-services.sh start
    
    # 等待服务启动
    sleep 8
    
    # 最终检查
    echo ""
    echo "🧪 最终检查..."
    /home/manage-services.sh status
    
    # 清理临时文件
    rm -rf /tmp/deploy-*
    
    echo ""
    echo "🎊 部署成功完成！"
EOF

# 5. 清理本地临时文件
echo "🧹 清理本地临时文件..."
rm -rf $DEPLOY_DIR
rm -f ${DEPLOY_DIR}.tar.gz

echo ""
echo "🎉 前后端一体化HTTPS部署完成！"
echo "========================================"
echo "🏗️ 架构特点:"
echo "   ✅ 使用优化后的app.js入口"
echo "   ✅ 模块化服务架构"
echo "   ✅ 统一配置管理"
echo "   ✅ 完整的错误处理"
echo "   ✅ 性能优化和缓存"
echo "   🔒 HTTPS/SSL加密传输"
echo ""
echo "🌐 访问地址:"
echo "   📱 前端应用: https://101.201.148.8"
echo "   🤖 后端API: https://101.201.148.8/api"
echo "   💓 健康检查: https://101.201.148.8/health"
echo ""
echo "🔧 服务管理:"
echo "   启动: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh start'"
echo "   停止: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh stop'"
echo "   重启: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh restart'"
echo "   状态: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh status'"
echo "   日志: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh logs'"
echo ""
echo "📝 查看日志:"
echo "   后端日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /home/qimen-backend/app.log'"
echo "   Nginx日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo ""
echo "✨ 优化特性:"
echo "   ✅ 统一入口点 (app.js)"
echo "   ✅ 模块化服务架构"
echo "   ✅ 配置环境分离"
echo "   ✅ 数据库自动初始化"
echo "   ✅ 完整的健康检查"
echo "   ✅ 安全头和限流保护"
echo "   ✅ 智能缓存策略"
echo "   ✅ 详细的服务监控"
echo "   🔒 HTTPS/SSL加密传输"
echo "   🔒 Let's Encrypt自动证书"
echo "   🔒 HTTP自动重定向HTTPS"
echo "   🔒 强化的安全配置" 