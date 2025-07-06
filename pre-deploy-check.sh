#!/bin/bash

# 奇门遁甲AI系统 - 部署前检查脚本
# 验证所有必要文件和配置

echo "🔍 奇门遁甲AI系统 - 部署前检查"
echo "========================================"

ERRORS=0
WARNINGS=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        return 0
    else
        echo "❌ $1 (缺失)"
        ((ERRORS++))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
        return 0
    else
        echo "❌ $1/ (目录缺失)"
        ((ERRORS++))
        return 1
    fi
}

check_optional() {
    if [ -f "$1" ]; then
        echo "✅ $1 (可选)"
        return 0
    else
        echo "⚠️ $1 (可选文件缺失)"
        ((WARNINGS++))
        return 1
    fi
}

echo "🔧 检查核心后端文件..."
echo "----------------------------------------"
check_file "backend/app.js"
check_file "backend/package.json"
check_file "backend/prisma/schema.prisma"

echo ""
echo "🏗️ 检查优化后的服务模块..."
echo "----------------------------------------"
check_file "backend/src/config/AppConfig.js"
check_file "backend/src/services/PointsService.js"
check_file "backend/src/services/AIService.js"
check_file "backend/src/middleware/index.js"
check_file "backend/src/validation/schemas.js"

echo ""
echo "📁 检查目录结构..."
echo "----------------------------------------"
check_dir "backend/src/config"
check_dir "backend/src/services"
check_dir "backend/src/middleware"
check_dir "backend/src/validation"
check_dir "fronend"

echo ""
echo "📄 检查配置文件..."
echo "----------------------------------------"
check_optional "backend/config.env"
check_optional "backend/.env"

echo ""
echo "📋 检查前端文件..."
echo "----------------------------------------"
if [ -d "fronend" ]; then
    check_file "fronend/package.json"
    if [ -f "fronend/package.json" ]; then
        echo "✅ 前端项目结构检查通过"
    fi
else
    echo "❌ 前端目录不存在"
    ((ERRORS++))
fi

echo ""
echo "🔐 检查部署脚本..."
echo "----------------------------------------"
check_file "deploy.sh"
if [ -f "deploy.sh" ]; then
    if grep -q "app.js" deploy.sh; then
        echo "✅ 部署脚本已更新为使用app.js"
    else
        echo "⚠️ 部署脚本可能需要更新"
        ((WARNINGS++))
    fi
fi

echo ""
echo "🧪 验证后端依赖..."
echo "----------------------------------------"
if [ -f "backend/package.json" ]; then
    cd backend
    echo "📦 检查Node.js依赖..."
    
    # 检查关键依赖
    REQUIRED_DEPS=("express" "prisma" "jsonwebtoken" "bcryptjs" "joi" "openai")
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo "✅ $dep"
        else
            echo "❌ $dep (缺失关键依赖)"
            ((ERRORS++))
        fi
    done
    
    cd ..
else
    echo "❌ 无法检查依赖，package.json不存在"
    ((ERRORS++))
fi

echo ""
echo "🌐 检查网络连接..."
echo "----------------------------------------"
if ping -c 1 101.201.148.8 > /dev/null 2>&1; then
    echo "✅ 服务器连接正常 (101.201.148.8)"
else
    echo "⚠️ 无法连接到目标服务器 (101.201.148.8)"
    ((WARNINGS++))
fi

echo ""
echo "📊 检查结果摘要"
echo "========================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 检查完美通过！"
    echo "✅ 所有必要文件都存在"
    echo "✅ 架构结构正确"
    echo "✅ 依赖配置完整"
    echo ""
    echo "🚀 可以执行部署："
    echo "   ./deploy.sh"
    
elif [ $ERRORS -eq 0 ]; then
    echo "✅ 基本检查通过，有 $WARNINGS 个警告"
    echo "⚠️ 警告不会阻止部署，但建议修复"
    echo ""
    echo "🚀 可以执行部署："
    echo "   ./deploy.sh"
    
else
    echo "❌ 检查失败：$ERRORS 个错误，$WARNINGS 个警告"
    echo "🛠️ 请修复所有错误后再尝试部署"
    
    echo ""
    echo "🔧 常见解决方案："
    echo "   1. 确保已运行所有优化步骤"
    echo "   2. 检查文件路径是否正确"
    echo "   3. 确保 backend/app.js 存在"
    echo "   4. 运行 npm install 安装依赖"
    
    exit 1
fi

echo ""
echo "📋 部署前最后提醒："
echo "----------------------------------------"
echo "1. 确保目标服务器 SSH 连接正常"
echo "2. 确保服务器有足够的磁盘空间"
echo "3. 建议在低峰期进行部署"
echo "4. 部署过程中保持网络连接稳定"
echo ""
echo "🎯 部署命令："
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh" 