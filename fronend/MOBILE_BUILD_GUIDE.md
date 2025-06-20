# 🚀 云雀奇门移动APP构建指南

## 📋 目录
- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [Android构建](#android构建)
- [iOS构建](#ios构建)
- [调试和测试](#调试和测试)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## 🛠 环境准备

### 基础要求
- Node.js 20+ (使用 `nvm use 20`)
- Git
- 您的Vue + Three.js项目

### Android构建环境
1. **安装Android Studio**
   ```bash
   # 下载Android Studio: https://developer.android.com/studio
   # 安装Android SDK (API Level 33+)
   ```

2. **配置环境变量**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### iOS构建环境 (仅macOS)
1. **安装Xcode**
   ```bash
   # 从App Store安装Xcode
   # 安装Command Line Tools
   xcode-select --install
   ```

2. **安装CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## 🚀 快速开始

### 1. 项目初始化
```bash
# 确保使用Node.js 20+
nvm use 20

# 进入前端目录
cd fronend

# 安装依赖
npm install

# 构建Web应用
npm run build
```

### 2. 添加移动平台
```bash
# 添加Android平台
npx cap add android

# 添加iOS平台 (仅macOS)
npx cap add ios

# 同步资源
npx cap sync
```

### 3. 使用构建脚本
```bash
# 运行自动化构建脚本
./build-mobile.sh
```

## 📱 Android构建

### 方法一：使用Android Studio (推荐)
1. **打开项目**
   ```bash
   npx cap open android
   ```

2. **在Android Studio中:**
   - 等待Gradle同步完成
   - 选择 `Build > Build Bundle(s)/APK(s) > Build APK(s)`
   - APK文件生成在: `android/app/build/outputs/apk/debug/`

### 方法二：命令行构建
```bash
# 进入android目录
cd android

# 构建APK
./gradlew assembleDebug

# 构建Release版本 (需要签名)
./gradlew assembleRelease
```

### 签名APK (生产环境)
1. **生成密钥库**
   ```bash
   keytool -genkey -v -keystore yunque-qimen-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias yunque-qimen
   ```

2. **配置签名** (在 `android/app/build.gradle` 中)
   ```gradle
   android {
       signingConfigs {
           release {
               keyAlias 'yunque-qimen'
               keyPassword 'your-password'
               storeFile file('../yunque-qimen-key.keystore')
               storePassword 'your-password'
           }
       }
   }
   ```

## 🍎 iOS构建

### 方法一：使用Xcode (推荐)
1. **打开项目**
   ```bash
   npx cap open ios
   ```

2. **在Xcode中:**
   - 选择开发团队 (需要Apple Developer账号)
   - 选择目标设备或模拟器
   - 点击 `Product > Archive`
   - 通过Organizer分发APP

### 模拟器测试
```bash
# 在iOS模拟器中运行
npx cap run ios

# 在设备上运行
npx cap run ios --target="Your iPhone"
```

## 🐛 调试和测试

### 实时调试
```bash
# Android实时调试
npx cap run android --livereload --external

# iOS实时调试
npx cap run ios --livereload --external
```

### Chrome DevTools调试
1. 在Android设备上启用USB调试
2. 打开Chrome，访问 `chrome://inspect`
3. 选择您的设备和应用进行调试

### 性能监控
- 使用内置的FPS监控器
- Chrome DevTools Performance面板
- 设备资源监控

## ⚡ 性能优化

### 已集成的优化
- **自动设备检测**: 根据设备性能调整渲染质量
- **动态粒子数量**: 根据GPU性能调整粒子数量
- **自适应像素比**: 优化移动设备显示
- **材质优化**: 低性能设备使用简化材质
- **帧率监控**: 自动降级性能以保持流畅

### 手动优化建议
```javascript
// 在HomeView.vue中可以进一步调整
const mobileSettings = {
  // 减少文字几何体复杂度
  textCurveSegments: mobileOptimizer.isMobile ? 8 : 16,
  
  // 简化环形结构
  ringSegments: mobileOptimizer.isMobile ? 32 : 64,
  
  // 调整光源数量
  enableMultipleLights: !mobileOptimizer.isMobile
};
```

## 📋 常见问题

### Q: APK安装失败
**A**: 检查设备是否允许安装未知来源应用，或者签名APK。

### Q: Three.js性能问题
**A**: 项目已集成移动端优化，会自动根据设备性能调整渲染质量。

### Q: iOS构建失败
**A**: 确保：
- 使用macOS系统
- 安装了最新版Xcode
- 有有效的开发者证书

### Q: 热重载不工作
**A**: 确保设备和电脑在同一网络，并且防火墙允许连接。

## 🎯 部署流程

### Android应用商店
1. 构建签名的Release APK
2. 创建Google Play Console账号
3. 上传APK并填写应用信息
4. 提交审核

### iOS App Store
1. 在Xcode中Archive项目
2. 通过Organizer上传到App Store Connect
3. 填写应用信息和元数据
4. 提交审核

## 🔧 命令参考

```bash
# Web开发
npm run dev          # 开发服务器
npm run build        # 构建Web版本
npm run preview      # 预览构建结果

# Capacitor
npx cap sync         # 同步Web资源到原生平台
npx cap open android # 打开Android Studio
npx cap open ios     # 打开Xcode
npx cap run android  # 在Android设备运行
npx cap run ios      # 在iOS设备运行

# 构建
./build-mobile.sh    # 自动化构建脚本
```

## 📞 支持

如果遇到问题，可以：
1. 查看Capacitor官方文档: https://capacitorjs.com
2. 检查控制台错误信息
3. 使用Chrome DevTools调试
4. 查看设备日志

---

🎉 **恭喜！您现在可以将Three.js应用打包为原生移动APP了！** 