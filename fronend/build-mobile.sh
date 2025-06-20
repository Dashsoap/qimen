#!/bin/bash

# 云雀奇门移动APP构建脚本
echo "🚀 开始构建云雀奇门移动APP..."

# 检查Node.js版本
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $node_version -lt 20 ]; then
    echo "❌ 需要Node.js 20+版本，当前版本: $(node -v)"
    echo "请运行: nvm use 20"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建Web应用
echo "🔨 构建Web应用..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ Web应用构建失败"
    exit 1
fi

echo "✅ Web应用构建成功"

# 同步到原生平台
echo "🔄 同步到原生平台..."
npx cap sync

# 构建Android APK
build_android() {
    echo "🤖 构建Android APK..."
    
    # 检查Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        echo "⚠️  ANDROID_HOME未设置，请先安装Android Studio"
        echo "或设置ANDROID_HOME环境变量"
        return 1
    fi
    
    # 打开Android Studio项目
    echo "📱 打开Android项目..."
    npx cap open android
    
    echo "📋 Android构建说明："
    echo "1. Android Studio会自动打开"
    echo "2. 点击 Build > Build Bundle(s)/APK(s) > Build APK(s)"
    echo "3. APK文件将生成在: android/app/build/outputs/apk/"
}

# 构建iOS APP
build_ios() {
    echo "🍎 构建iOS APP..."
    
    # 检查是否在macOS上
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "⚠️  iOS构建需要在macOS上进行"
        return 1
    fi
    
    # 检查Xcode
    if ! command -v xcodebuild &> /dev/null; then
        echo "⚠️  请先安装Xcode"
        return 1
    fi
    
    # 打开Xcode项目
    echo "📱 打开iOS项目..."
    npx cap open ios
    
    echo "📋 iOS构建说明："
    echo "1. Xcode会自动打开"
    echo "2. 选择目标设备或模拟器"
    echo "3. 点击Product > Archive进行打包"
    echo "4. 通过Organizer分发APP"
}

# 选择构建平台
echo "🔧 选择构建平台:"
echo "1) Android"
echo "2) iOS"
echo "3) 两个平台都构建"
echo "4) 仅同步，手动构建"

read -p "请选择 (1-4): " choice

case $choice in
    1)
        build_android
        ;;
    2)
        build_ios  
        ;;
    3)
        build_android
        build_ios
        ;;
    4)
        echo "✅ 项目已同步，请手动打开对应IDE进行构建"
        echo "Android: npx cap open android"
        echo "iOS: npx cap open ios"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 构建脚本执行完成！"
echo ""
echo "📋 快速命令参考："
echo "构建Web: npm run build"
echo "同步平台: npx cap sync"  
echo "打开Android: npx cap open android"
echo "打开iOS: npx cap open ios"
echo "实时调试: npx cap run android --livereload" 