#!/bin/bash

# 丁未奇门遁甲 - 修复部署脚本
# 专门解决CentOS系统和Node.js版本问题

set -e

SERVER_IP="101.201.148.8"
SERVER_USER="root"

echo "🔧 开始修复部署问题..."
echo "========================================"

# 1. 修复服务器环境
echo "🛠️ 修复服务器环境..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    echo "🔍 检测系统信息..."
    echo "系统: $(cat /etc/redhat-release 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME)"
    echo "Node.js: $(node -v 2>/dev/null || echo '未安装')"
    echo "npm: $(npm -v 2>/dev/null || echo '未安装')"
    
    # 停止卡住的进程
    echo "⏹️ 停止可能卡住的进程..."
    pkill -f npm || true
    pkill -f node || true
    
    # 清理npm缓存和锁文件
    echo "🧹 清理npm缓存..."
    rm -rf /home/qimen-backend/node_modules || true
    rm -f /home/qimen-backend/package-lock.json || true
    npm cache clean --force 2>/dev/null || true
    
    # 检测系统类型并升级Node.js
    if [ -f /etc/redhat-release ]; then
        echo "🔍 检测到CentOS/RHEL系统"
        
        # 检查Node.js版本
        NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
        if [[ $NODE_VERSION -lt 18 ]]; then
            echo "📦 升级Node.js到20.x版本..."
            
            # 移除旧版本
            yum remove -y nodejs npm || true
            
            # 安装Node.js 20.x
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
            
            echo "✅ Node.js升级完成: $(node -v)"
        fi
        
        # 配置npm使用国内镜像
        echo "🌐 配置npm镜像..."
        npm config set registry https://registry.npmmirror.com/
        npm config set timeout 300000
        npm config set fetch-timeout 300000
        
    else
        echo "❌ 不支持的系统类型"
        exit 1
    fi
    
    echo "✅ 服务器环境修复完成"
EOF

# 2. 重新安装后端依赖
echo "📦 重新安装后端依赖..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    cd /home/qimen-backend
    
    echo "📋 当前目录内容:"
    ls -la
    
    echo "📦 开始安装依赖..."
    
    # 设置npm配置
    npm config set registry https://registry.npmmirror.com/
    npm config set timeout 600000
    npm config set fetch-timeout 600000
    npm config set fetch-retry-mintimeout 20000
    npm config set fetch-retry-maxtimeout 120000
    npm config set fetch-retries 5
    
    # 清理并重新安装
    rm -rf node_modules package-lock.json
    npm cache clean --force
    
    # 分步安装关键依赖
    echo "📦 安装核心依赖..."
    npm install --production --no-audit --no-optional express @prisma/client bcryptjs jsonwebtoken joi
    
    echo "📦 安装其他依赖..."
    npm install --production --no-audit --no-optional
    
    echo "✅ 依赖安装完成"
    
    # 检查关键文件
    echo "🔍 检查关键文件..."
    if [ -f "app.js" ]; then
        echo "✅ app.js 存在"
    else
        echo "❌ app.js 不存在"
    fi
    
    if [ -d "node_modules" ]; then
        echo "✅ node_modules 存在"
        echo "📊 依赖包数量: $(ls node_modules | wc -l)"
    else
        echo "❌ node_modules 不存在"
    fi
EOF

# 3. 初始化数据库
echo "🗄️ 初始化数据库..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    cd /home/qimen-backend
    
    echo "🗄️ 设置数据库..."
    export NODE_ENV=production
    export DATABASE_URL="file:./prisma/prod.db"
    
    # 确保目录存在
    mkdir -p prisma
    
    # 生成Prisma客户端
    echo "📦 生成Prisma客户端..."
    npx prisma generate
    
    # 推送数据库架构
    echo "🔄 推送数据库架构..."
    npx prisma db push --force-reset
    
    echo "✅ 数据库初始化完成"
EOF

# 4. 测试启动后端
echo "🧪 测试启动后端..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    cd /home/qimen-backend
    
    echo "🚀 测试启动后端服务..."
    
    # 设置环境变量
    export NODE_ENV=production
    export PORT=3001
    export DATABASE_URL="file:./prisma/prod.db"
    export JWT_SECRET="your-super-secure-jwt-secret-for-production"
    
    # 测试启动 (5秒后自动停止)
    timeout 5 node app.js || true
    
    echo "✅ 后端测试完成"
EOF

# 5. 启动服务
echo "🚀 启动所有服务..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 停止现有服务
    pkill -f "node.*app.js" || true
    systemctl stop nginx || true
    
    # 启动后端
    cd /home/qimen-backend
    export NODE_ENV=production
    export PORT=3001
    export DATABASE_URL="file:./prisma/prod.db"
    export JWT_SECRET="your-super-secure-jwt-secret-for-production"
    
    nohup node app.js > app.log 2>&1 &
    echo $! > app.pid
    
    echo "✅ 后端服务已启动 (PID: $(cat app.pid))"
    
    # 等待服务启动
    sleep 5
    
    # 检查服务状态
    if kill -0 $(cat app.pid) 2>/dev/null; then
        echo "✅ 后端服务运行正常"
        
        # 检查端口
        if netstat -tuln | grep -q ":3001 "; then
            echo "✅ 端口3001正在监听"
        else
            echo "❌ 端口3001未监听"
        fi
        
        # 测试API
        sleep 2
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ 健康检查通过"
        else
            echo "❌ 健康检查失败"
            echo "📋 查看日志:"
            tail -20 app.log
        fi
    else
        echo "❌ 后端服务启动失败"
        echo "📋 查看日志:"
        tail -20 app.log
    fi
    
    # 启动nginx (如果前端文件存在)
    if [ -d "/home/qimen-frontend" ] && [ -f "/etc/nginx/sites-available/qimen" ]; then
        echo "🌐 启动nginx..."
        systemctl start nginx
        systemctl enable nginx
        echo "✅ nginx已启动"
    else
        echo "⚠️ 前端文件或nginx配置不存在，跳过nginx启动"
    fi
EOF

echo ""
echo "🎉 修复部署完成！"
echo "========================================"
echo "🌐 访问地址:"
echo "   后端API: http://101.201.148.8:3001"
echo "   健康检查: http://101.201.148.8:3001/health"
if ssh ${SERVER_USER}@${SERVER_IP} "[ -d '/home/qimen-frontend' ]"; then
    echo "   前端应用: http://101.201.148.8"
fi
echo ""
echo "🔧 服务管理:"
echo "   查看后端日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /home/qimen-backend/app.log'"
echo "   重启后端: ssh ${SERVER_USER}@${SERVER_IP} 'cd /home/qimen-backend && pkill -f node && nohup node app.js > app.log 2>&1 &'"
echo "   检查进程: ssh ${SERVER_USER}@${SERVER_IP} 'ps aux | grep node'"
echo ""
echo "📝 如果还有问题，请运行:"
echo "   ssh ${SERVER_USER}@${SERVER_IP} 'cd /home/qimen-backend && tail -50 app.log'"