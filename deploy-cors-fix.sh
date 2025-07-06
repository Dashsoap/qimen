#!/bin/bash

# 部署CORS修复脚本
# 解决401 CORS错误问题

SERVER_IP="101.201.148.8"
SERVER_USER="root"
BACKEND_DIR="/home/qimen-backend"

echo "🔧 部署CORS修复"
echo "服务器: $SERVER_IP"
echo "========================================"

# 1. 上传修复后的配置文件
echo "📤 上传修复后的配置文件..."
scp backend/src/config/AppConfig.js $SERVER_USER@$SERVER_IP:$BACKEND_DIR/src/config/

# 2. 执行诊断和重启
echo "🔄 执行服务器诊断和重启..."
bash diagnose-server.sh

echo ""
echo "✅ CORS修复部署完成！"
echo "========================================"
echo "修复内容:"
echo "- ✅ 添加了 http://101.201.148.8 到CORS允许列表"
echo "- ✅ 添加了 http://101.201.148.8:80 到CORS允许列表"
echo "- ✅ 重启了后端服务"
echo ""
echo "现在请重新测试: http://101.201.148.8/login" 