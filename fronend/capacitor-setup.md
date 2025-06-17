# 📱 鬼谷奇门 移动应用打包指南

## 🔧 方案1：Capacitor（推荐）

### 1. 环境准备
```bash
# 1. 升级Node.js到20+版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 2. 安装Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 3. 初始化Capacitor
npx cap init "鬼谷奇门" "com.yunque.qimen"
```

### 2. 配置应用信息
在`capacitor.config.ts`中：
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yunque.qimen',
  appName: '鬼谷奇门',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
```

### 3. 添加移动平台
```bash
# 添加Android平台
npx cap add android

# 添加iOS平台（需要macOS）
npx cap add ios
```

### 4. 构建和同步
```bash
# 构建Vue项目
npm run build

# 同步到移动平台
npx cap sync

# 在Android Studio中打开
npx cap open android

# 在Xcode中打开（macOS）
npx cap open ios
```

### 5. 生成APK/IPA
- **Android APK**: 在Android Studio中 Build → Generate Signed Bundle/APK
- **iOS IPA**: 在Xcode中 Product → Archive → Distribute App

---

## 🔧 方案2：Cordova（当前Node版本可用）

### 1. 安装Cordova
```bash
npm install -g cordova

# 创建Cordova项目
cordova create qimen-mobile com.yunque.qimen "鬼谷奇门"
cd qimen-mobile
```

### 2. 添加平台
```bash
cordova platform add android
cordova platform add ios
```

### 3. 复制构建文件
```bash
# 先构建Vue项目
cd ../fronend
npm run build

# 复制dist文件到Cordova的www目录
cp -r dist/* ../qimen-mobile/www/
```

### 4. 构建应用
```bash
cd ../qimen-mobile

# 构建Android
cordova build android --release

# 构建iOS
cordova build ios --release
```

---

## 🔧 方案3：Quasar CLI（全功能解决方案）

### 1. 安装Quasar
```bash
npm install -g @quasar/cli
```

### 2. 迁移现有项目
```bash
# 创建新的Quasar项目
quasar create qimen-quasar

# 将现有代码迁移到Quasar项目中
# 需要适配Quasar的组件和结构
```

### 3. 添加移动平台
```bash
cd qimen-quasar
quasar mode add capacitor
quasar mode add cordova
```

### 4. 构建移动应用
```bash
# 使用Capacitor构建
quasar build -m capacitor -T android
quasar build -m capacitor -T ios

# 使用Cordova构建
quasar build -m cordova -T android
quasar build -m cordova -T ios
```

---

## 📋 移动应用配置建议

### 应用图标和启动画面
创建以下尺寸的图标：
- Android: 72x72, 96x96, 144x144, 192x192
- iOS: 57x57, 72x72, 114x114, 144x144

### 应用权限配置
在`config.xml`（Cordova）或相关配置中添加：
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 性能优化
1. **启用PWA功能**
2. **压缩资源文件**
3. **使用CDN加速**
4. **添加离线缓存**

---

## 🚀 快速开始（推荐）

如果您想立即开始，建议使用Cordova方案：

1. **安装Cordova**: `npm install -g cordova`
2. **创建项目**: `cordova create qimen-mobile com.yunque.qimen "鬼谷奇门"`
3. **添加平台**: `cordova platform add android`
4. **构建Vue**: `npm run build`
5. **复制文件**: 将dist目录内容复制到Cordova的www目录
6. **构建APK**: `cordova build android --release`

## 📚 相关资源

- [Capacitor官方文档](https://capacitorjs.com/docs)
- [Cordova官方文档](https://cordova.apache.org/docs/en/latest/)
- [Quasar官方文档](https://quasar.dev/)
- [Android打包指南](https://developer.android.com/studio/publish/preparing)
- [iOS打包指南](https://developer.apple.com/distribution/) 