#!/bin/bash

# 奇门遁甲AI后端服务部署脚本
# 目标服务器: 101.201.148.8:3001

set -e  # 如果任何命令失败，脚本退出

SERVER_IP="101.201.148.8"
SERVER_USER="root"  # 根据实际情况修改用户名
REMOTE_PATH="/home/qimen-backend"
LOCAL_BACKEND_PATH="./backend"

echo "🚀 开始部署奇门遁甲AI后端服务到 ${SERVER_IP}..."

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
    pkill -f "node.*simple-server.js" || true
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
    
    # 设置权限
    chmod +x start-server.sh
    chmod +x start.sh
    
    # 启动服务
    echo "🚀 启动服务..."
    ./start-server.sh
    
    # 检查服务状态
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 服务部署成功！"
        echo "🌐 服务地址: http://101.201.148.8:3001"
        echo "💓 健康检查: http://101.201.148.8:3001/health"
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

echo "🎉 部署完成！"
echo "📊 服务状态检查: curl http://101.201.148.8:3001/health"
echo "📝 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /home/qimen-backend/server.log'" 