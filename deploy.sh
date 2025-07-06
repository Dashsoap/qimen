#!/bin/bash

# 奇门遁甲AI前后端一体化部署脚本
# 目标服务器: 101.201.148.8

set -e  # 如果任何命令失败，脚本退出

SERVER_IP="101.201.148.8"
SERVER_USER="root"  # 根据实际情况修改用户名
BACKEND_PATH="/home/qimen-backend"
FRONTEND_PATH="/home/qimen-frontend"
LOCAL_BACKEND_PATH="./backend"
LOCAL_FRONTEND_PATH="./fronend"

echo "🚀 开始部署奇门遁甲AI完整应用到 ${SERVER_IP}..."
echo "========================================"

# 1. 准备前端构建
echo "🎨 准备前端构建..."
cd $LOCAL_FRONTEND_PATH

# 创建生产环境配置
echo "⚙️ 配置生产环境变量..."
cat > .env.production << 'ENV_EOF'
VITE_API_BASE_URL=http://101.201.148.8:3001
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

# 复制前端构建文件
echo "📋 复制前端构建文件..."
cp -r $LOCAL_FRONTEND_PATH/dist/* $DEPLOY_DIR/frontend/

# 创建nginx配置文件
echo "🌐 创建nginx配置..."
cat > $DEPLOY_DIR/nginx.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name 101.201.148.8;
    
    # 前端静态文件
    location / {
        root /home/qimen-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 添加缓存控制
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
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
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_EOF

# 创建服务管理脚本
echo "🔧 创建服务管理脚本..."
cat > $DEPLOY_DIR/manage-services.sh << 'MANAGE_EOF'
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
MANAGE_EOF

chmod +x $DEPLOY_DIR/manage-services.sh

# 创建压缩包
echo "📦 创建部署包..."
tar -czf ${DEPLOY_DIR}.tar.gz $DEPLOY_DIR
echo "✅ 部署包已创建: ${DEPLOY_DIR}.tar.gz"

# 3. 上传到服务器
echo "📤 上传文件到服务器..."
scp ${DEPLOY_DIR}.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 4. 在服务器上部署
echo "🔧 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止现有服务
    echo "⏹️ 停止现有服务..."
    systemctl stop nginx || true
    pkill -f "node.*server.js" || true
    pkill -f "node.*simple-server.js" || true
    sleep 3

    # 安装nginx（如果未安装）
    if ! command -v nginx &> /dev/null; then
        echo "📦 安装nginx..."
        apt update
        apt install -y nginx
    fi

    # 备份现有目录
    if [ -d "/home/qimen-backend" ]; then
        mv /home/qimen-backend /home/qimen-backend-backup-$(date +%Y%m%d-%H%M%S)
    fi
    if [ -d "/home/qimen-frontend" ]; then
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
    npm install --production
    
    # 初始化数据库（如果需要）
    if [ -f "package.json" ] && grep -q "init-db" package.json; then
        npm run init-db || true
    fi
    
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
    
    # 启动服务
    echo "🚀 启动所有服务..."
    /home/manage-services.sh start
    
    # 检查服务状态
    sleep 5
    echo ""
    echo "🧪 最终检查..."
    /home/manage-services.sh status
    
    # 清理临时文件
    rm -rf /tmp/deploy-*
EOF

# 5. 清理本地临时文件
echo "🧹 清理本地临时文件..."
rm -rf $DEPLOY_DIR
rm -f ${DEPLOY_DIR}.tar.gz

echo ""
echo "🎉 前后端一体化部署完成！"
echo "========================================"
echo "🌐 访问地址:"
echo "   📱 前端应用: http://101.201.148.8"
echo "   🤖 后端API: http://101.201.148.8:3001"
echo "   💓 健康检查: http://101.201.148.8/health"
echo ""
echo "🔧 服务管理:"
echo "   启动: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh start'"
echo "   停止: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh stop'"
echo "   重启: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh restart'"
echo "   状态: ssh ${SERVER_USER}@${SERVER_IP} '/home/manage-services.sh status'"
echo ""
echo "📝 查看日志:"
echo "   后端日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /home/qimen-backend/server.log'"
echo "   Nginx日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo ""
echo "✨ 部署特性:"
echo "   ✅ 前后端分离架构"
echo "   ✅ Nginx反向代理"
echo "   ✅ 静态文件缓存优化"
echo "   ✅ 完整的用户认证系统"
echo "   ✅ 历史记录和收藏夹功能"
echo "   ✅ 服务自动管理脚本" 