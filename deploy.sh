#!/bin/bash

# 奇门遁甲AI后端服务部署脚本（升级版 - 认证系统）
# 目标服务器: 101.201.148.8:3001

set -e  # 如果任何命令失败，脚本退出

SERVER_IP="101.201.148.8"
SERVER_USER="root"  # 根据实际情况修改用户名
REMOTE_PATH="/home/qimen-backend"
LOCAL_BACKEND_PATH="./backend"

echo "🔮 开始部署云雀奇门遁甲认证系统到 ${SERVER_IP}..."

# 1. 准备部署包
echo "📦 准备部署包..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# 复制必要文件
cp -r $LOCAL_BACKEND_PATH/* $DEPLOY_DIR/
# 移除本地开发文件
rm -rf $DEPLOY_DIR/node_modules
rm -f $DEPLOY_DIR/server.log
rm -f $DEPLOY_DIR/*.bak

# 创建压缩包
tar -czf ${DEPLOY_DIR}.tar.gz $DEPLOY_DIR
echo "✅ 部署包已创建: ${DEPLOY_DIR}.tar.gz"

# 2. 上传到服务器
echo "📤 上传文件到服务器..."
scp ${DEPLOY_DIR}.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 3. 在服务器上部署
echo "🔧 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止现有服务
    echo "⏹️  停止现有服务..."
    pkill -f simple-server.js || true
    pkill -f server.js || true
    pkill -f "node.*simple-server.js" || true
    pkill -f "node.*server.js" || true
    sleep 3

    # 备份现有目录
    if [ -d "/home/qimen-backend" ]; then
        mv /home/qimen-backend /home/qimen-backend-backup-$(date +%Y%m%d-%H%M%S)
    fi

    # 创建目录并解压
    mkdir -p /home/qimen-backend
    cd /home/qimen-backend
    tar -xzf /tmp/deploy-*.tar.gz --strip-components=1
    
    # 安装依赖
    echo "📦 安装依赖..."
    npm install --production
    
    # 初始化数据库
    echo "🗄️ 初始化数据库..."
    npm run init-db
    
    # 设置权限
    chmod +x start-auth-server.sh || true
    chmod +x start-server.sh || true
    chmod +x start.sh || true
    
    # 创建启动脚本（如果不存在）
    if [ ! -f "start-production.sh" ]; then
        cat > start-production.sh << 'SCRIPT_EOF'
#!/bin/bash
echo "🚀 启动云雀奇门遁甲认证服务器..."
nohup node server.js > server.log 2>&1 &
echo "✅ 服务器已在后台启动"
echo "📝 日志文件: server.log"
SCRIPT_EOF
        chmod +x start-production.sh
    fi
    
    # 启动服务
    echo "🚀 启动认证服务器..."
    ./start-production.sh
    
    # 检查服务状态
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 认证服务器部署成功！"
        echo "🌐 服务地址: http://101.201.148.8:3001"
        echo "💓 健康检查: http://101.201.148.8:3001/health"
        echo "🔐 认证端点: http://101.201.148.8:3001/api/auth/"
        echo "💰 积分系统: http://101.201.148.8:3001/api/points/"
        echo "🔮 奇门服务: http://101.201.148.8:3001/api/qimen/"
    else
        echo "❌ 服务启动失败，请检查日志"
        tail -20 server.log || echo "无法读取日志文件"
    fi
    
    # 清理临时文件
    rm -f /tmp/deploy-*.tar.gz
EOF

# 4. 清理本地临时文件
echo "🧹 清理本地临时文件..."
rm -rf $DEPLOY_DIR
rm -f ${DEPLOY_DIR}.tar.gz

echo "🎉 认证系统部署完成！"
echo ""
echo "📊 服务状态检查: curl http://101.201.148.8:3001/health"
echo "🔐 测试注册: curl -X POST http://101.201.148.8:3001/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"123456\"}'"
echo "📝 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /home/qimen-backend/server.log'" 
echo ""
echo "🚀 新功能:"
echo "   ✅ 用户注册/登录"
echo "   ✅ JWT安全认证"
echo "   ✅ 积分系统"
echo "   ✅ 安全防护" 