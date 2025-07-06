#!/bin/bash

# 奇门遁甲APK自动化构建脚本
# 使用方法: ./build-apk.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_step() {
    echo -e "${BLUE}[步骤] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[成功] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[警告] $1${NC}"
}

print_error() {
    echo -e "${RED}[错误] $1${NC}"
}

# 检查必要的命令是否存在
check_requirements() {
    print_step "检查构建环境..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v cordova &> /dev/null; then
        print_error "cordova 未安装，请运行: npm install -g cordova"
        exit 1
    fi
    
    print_success "构建环境检查通过"
}

# 设置Java环境
setup_java() {
    print_step "设置Java环境..."
    export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home
    export PATH=$JAVA_HOME/bin:$PATH
    
    if ! command -v java &> /dev/null; then
        print_error "Java 未正确设置，请检查Java安装"
        exit 1
    fi
    
    print_success "Java环境设置完成: $(java -version 2>&1 | head -n 1)"
}

# 构建前端项目
build_frontend() {
    print_step "构建前端项目..."
    
    cd frontend
    
    # 检查package.json是否存在
    if [ ! -f package.json ]; then
        print_error "frontend/package.json 不存在"
        exit 1
    fi
    
    # 安装依赖（如果需要）
    if [ ! -d node_modules ]; then
        print_step "安装前端依赖..."
        npm install
    fi
    
    # 构建项目
    npm run build
    
    # 检查构建是否成功
    if [ ! -d dist ]; then
        print_error "前端构建失败，dist目录不存在"
        exit 1
    fi
    
    print_success "前端项目构建完成"
    cd ..
}

# 复制构建文件到Cordova项目
copy_to_cordova() {
    print_step "复制构建文件到Cordova项目..."
    
    cd qimen-apk
    
    # 清空www目录
    if [ -d www ]; then
        rm -rf www/*
    else
        mkdir -p www
    fi
    
    # 复制构建文件
    cp -r ../frontend/dist/* www/
    
    # 验证复制是否成功
    if [ ! -f www/index.html ]; then
        print_error "文件复制失败，www/index.html 不存在"
        exit 1
    fi
    
    print_success "构建文件复制完成"
    cd ..
}

# 构建Android APK
build_apk() {
    print_step "构建Android APK..."
    
    cd qimen-apk
    
    # 检查Android平台是否存在
    if [ ! -d platforms/android ]; then
        print_warning "Android平台不存在，正在添加..."
        cordova platform add android
    fi
    
    # 构建APK
    cordova build android
    
    # 检查APK是否生成成功
    APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
    if [ ! -f "$APK_PATH" ]; then
        print_error "APK构建失败，文件不存在: $APK_PATH"
        exit 1
    fi
    
    print_success "Android APK构建完成"
    cd ..
}

# 复制APK到桌面
copy_apk_to_desktop() {
    print_step "复制APK到桌面..."
    
    # 生成带时间戳的文件名
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="奇门遁甲APK_${TIMESTAMP}.apk"
    
    cp qimen-apk/platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/"$APK_NAME"
    
    # 获取文件大小
    APK_SIZE=$(ls -lh ~/Desktop/"$APK_NAME" | awk '{print $5}')
    
    print_success "APK已复制到桌面: $APK_NAME (大小: $APK_SIZE)"
}

# 清理函数
cleanup() {
    print_step "清理临时文件..."
    # 这里可以添加清理逻辑，如果需要的话
    print_success "清理完成"
}

# 主函数
main() {
    echo "=========================================="
    echo "      奇门遁甲APK自动化构建脚本"
    echo "=========================================="
    echo ""
    
    # 记录开始时间
    START_TIME=$(date +%s)
    
    # 执行构建步骤
    check_requirements
    setup_java
    build_frontend
    copy_to_cordova
    build_apk
    copy_apk_to_desktop
    
    # 计算耗时
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo "=========================================="
    print_success "🎉 APK构建完成！"
    print_success "⏱️  总耗时: ${DURATION}秒"
    echo "=========================================="
    echo ""
    echo "📱 您可以在桌面找到新生成的APK文件"
    echo "🚀 现在可以安装到Android设备进行测试"
    echo ""
}

# 错误处理
trap 'print_error "构建过程中出现错误，脚本已终止"; exit 1' ERR

# 运行主函数
main "$@" 