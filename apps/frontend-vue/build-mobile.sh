#!/bin/bash

# 丁未奇门遁甲移动APP构建脚本
echo "🚀 开始构建云丁未奇门遁甲移动APP..."

# 版本自动更新函数
update_ios_version() {
    echo "📱 更新iOS版本号..."
    PLIST_FILE="ios/App/App/Info.plist"
    
    if [ ! -f "$PLIST_FILE" ]; then
        echo "⚠️  找不到iOS Info.plist文件，跳过iOS版本更新"
        return 1
    fi
    
    # 获取当前显示名称
    current_name=$(plutil -extract CFBundleDisplayName xml1 -o - "$PLIST_FILE" 2>/dev/null | sed -n '/<string>/p' | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
    
    if [ -z "$current_name" ]; then
        echo "⚠️  无法读取iOS应用名称，跳过iOS版本更新"
        return 1
    fi
    
    # 检查是否已有版本号
    if [[ $current_name =~ (.+)\ V([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        # 提取基础名称和当前版本号
        base_name="${BASH_REMATCH[1]}"
        major=${BASH_REMATCH[2]}
        minor=${BASH_REMATCH[3]}
        patch=${BASH_REMATCH[4]}
        
        # 递增补丁版本号
        patch=$((patch + 1))
        
        # 构建新的显示名称
        new_name="$base_name V$major.$minor.$patch"
        
        echo "  iOS版本号递增: V$major.$minor.$((patch-1)) -> V$major.$minor.$patch"
    else
        # 没有版本号，添加初始版本号
        base_name=$(echo "$current_name" | sed 's/ V[0-9]*\..*$//' | sed 's/ V[0-9]*$//' | sed 's/ V$//')
        new_name="$base_name V0.0.1"
        echo "  iOS添加初始版本号: V0.0.1"
    fi
    
    # 更新Info.plist文件
    plutil -replace CFBundleDisplayName -string "$new_name" "$PLIST_FILE"
    
    # 同时更新CFBundleShortVersionString和CFBundleVersion
    if [[ $new_name =~ V([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        version_string="${BASH_REMATCH[1]}.${BASH_REMATCH[2]}.${BASH_REMATCH[3]}"
        build_number=$(date +%Y%m%d%H%M%S)
        
        plutil -replace CFBundleShortVersionString -string "$version_string" "$PLIST_FILE" 2>/dev/null
        plutil -replace CFBundleVersion -string "$build_number" "$PLIST_FILE" 2>/dev/null
        
        echo "  iOS版本信息: $version_string (构建号: $build_number)"
    fi
    
    echo "✅ iOS版本更新完成: $new_name"
}

update_android_version() {
    echo "🤖 更新Android版本号..."
    BUILD_GRADLE="android/app/build.gradle"
    STRINGS_XML="android/app/src/main/res/values/strings.xml"
    
    if [ ! -f "$BUILD_GRADLE" ] || [ ! -f "$STRINGS_XML" ]; then
        echo "⚠️  找不到Android配置文件，跳过Android版本更新"
        return 1
    fi
    
    # 更新versionCode
    current_version_code=$(grep "versionCode" "$BUILD_GRADLE" | head -1 | sed 's/.*versionCode \([0-9]*\).*/\1/')
    new_version_code=$((current_version_code + 1))
    
    # 更新versionName
    current_version_name=$(grep "versionName" "$BUILD_GRADLE" | head -1 | sed 's/.*versionName "\([^"]*\)".*/\1/')
    
    # 解析版本号
    if [[ $current_version_name =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        major=${BASH_REMATCH[1]}
        minor=${BASH_REMATCH[2]}
        patch=${BASH_REMATCH[3]}
        patch=$((patch + 1))
        new_version_name="$major.$minor.$patch"
    elif [[ $current_version_name =~ ^([0-9]+)\.([0-9]+)$ ]]; then
        major=${BASH_REMATCH[1]}
        minor=${BASH_REMATCH[2]}
        new_version_name="$major.$minor.1"
    else
        new_version_name="1.0.1"
    fi
    
    # 更新应用显示名称
    current_app_name=$(grep '<string name="app_name">' "$STRINGS_XML" | sed 's/.*<string name="app_name">\([^<]*\)<\/string>.*/\1/')
    
    if [[ $current_app_name =~ (.+)\ V([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        base_name="${BASH_REMATCH[1]}"
        new_app_name="$base_name V$new_version_name"
    else
        base_name=$(echo "$current_app_name" | sed 's/ V[0-9]*\..*$//' | sed 's/ V[0-9]*$//' | sed 's/ V$//')
        new_app_name="$base_name V$new_version_name"
    fi
    
    # 执行更新
    sed -i.bak "s/versionCode $current_version_code/versionCode $new_version_code/" "$BUILD_GRADLE"
    sed -i.bak "s/versionName \"$current_version_name\"/versionName \"$new_version_name\"/" "$BUILD_GRADLE"
    sed -i.bak "s|<string name=\"app_name\">$current_app_name</string>|<string name=\"app_name\">$new_app_name</string>|" "$STRINGS_XML"
    sed -i.bak "s|<string name=\"title_activity_main\">.*</string>|<string name=\"title_activity_main\">$new_app_name</string>|" "$STRINGS_XML"
    
    # 清理备份文件
    rm -f "$BUILD_GRADLE.bak" "$STRINGS_XML.bak"
    
    echo "  Android版本更新: versionCode=$new_version_code, versionName=$new_version_name"
    echo "✅ Android版本更新完成: $new_app_name"
}

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
        echo "🔄 更新Android版本..."
        update_android_version
        build_android
        ;;
    2)
        echo "🔄 更新iOS版本..."
        update_ios_version
        build_ios  
        ;;
    3)
        echo "🔄 更新所有平台版本..."
        update_android_version
        update_ios_version
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
echo ""
echo "📱 版本管理信息："
echo "• 每次构建时会自动递增版本号"
echo "• iOS版本从 V0.0.1 开始递增"
echo "• Android版本从 V1.0.1 开始递增"
echo "• 版本号会显示在应用名称中" 