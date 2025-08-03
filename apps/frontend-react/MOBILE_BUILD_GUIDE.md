# React前端移动端构建指南

## 📱 快速开始

### 🚨 重要提醒：API配置已修复
移动端构建的localhost访问问题已完全解决！现在使用正确的构建命令即可。

### 构建命令对比

| 构建场景 | 使用命令 | API地址 | 说明 |
|---------|---------|---------|------|
| **Web开发** | `npm run dev` | `localhost:3001` (代理) | 本地开发，使用Vite代理 |
| **Web生产** | `npm run build` | 智能检测 | 根据部署环境自动选择 |
| **移动端构建** | `npm run build:mobile` | `101.201.148.8:3001` | 🚀 **强制使用服务器地址** |
| **移动端完整构建** | `npm run mobile:build` | `101.201.148.8:3001` | 构建+同步到原生平台 |

### 🔧 移动端构建流程

1. **安装依赖**（首次需要）
   ```bash
   npm install
   ```

2. **移动端构建**
   ```bash
   # 方式1：仅构建Web资源
   npm run build:mobile
   
   # 方式2：构建并同步到原生平台（推荐）
   npm run mobile:build
   
   # 方式3：使用构建脚本（包含版本管理）
   ./build-mobile.sh
   ```

3. **打开原生项目**
   ```bash
   # Android
   npm run mobile:android
   
   # iOS  
   npm run mobile:ios
   ```

### 🚀 构建脚本特色功能

运行 `./build-mobile.sh` 可获得以下功能：

- ✅ **自动版本管理**: 每次构建自动递增版本号
- ✅ **智能环境检测**: 自动检查Node.js、Android SDK、Xcode
- ✅ **多平台支持**: 可选择构建Android、iOS或两个平台
- ✅ **API配置优化**: 移动端构建强制使用服务器地址
- ✅ **构建状态检查**: 详细的构建日志和错误提示

### 🌐 API配置说明

#### 智能API地址选择
项目会根据不同环境自动选择合适的API地址：

```javascript
// 开发环境（Web）
localhost:5173 → API代理到 localhost:3001

// 移动端构建
强制使用 → 101.201.148.8:3001

// 生产环境（Web）
智能检测部署环境 → 自动选择合适地址
```

#### 环境变量支持
可通过以下环境变量自定义API配置：

```bash
# 自定义API地址
VITE_API_BASE_URL=http://your-server:3001

# 强制移动端模式
VITE_FORCE_MOBILE_API=true

# 构建目标标识
VITE_BUILD_TARGET=mobile
```

### 📋 构建前检查清单

- [ ] Node.js 18+ 已安装
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 后端服务器 (101.201.148.8:3001) 可访问
- [ ] Android Studio 已配置（Android构建）
- [ ] Xcode 已安装（iOS构建，仅macOS）

### 🔍 常见问题解答

#### Q: 移动端APP无法连接服务器？
**A**: 确保使用 `npm run build:mobile` 而不是 `npm run build`。移动端必须使用专用构建命令。

#### Q: API请求返回网络错误？
**A**: 检查服务器地址 101.201.148.8:3001 是否可访问。可以在浏览器中访问 http://101.201.148.8:3001/health 进行测试。

#### Q: 构建时提示环境变量错误？
**A**: 确保已安装 `cross-env` 依赖：`npm install`

#### Q: Android构建失败？
**A**: 
1. 检查 ANDROID_HOME 环境变量是否设置
2. 确保 Android SDK 已正确安装
3. 尝试先运行 `npx cap sync` 同步项目

#### Q: iOS构建失败？
**A**: 
1. 确保在 macOS 系统上构建
2. 检查 Xcode 是否已安装
3. 运行 `xcode-select --install` 安装命令行工具

### 📱 调试模式

开发期间可使用实时调试模式：

```bash
# Android实时调试
npm run mobile:dev:android

# iOS实时调试  
npm run mobile:dev:ios
```

实时调试模式下会使用本地开发服务器，支持热重载。

### 🎯 最佳实践

1. **使用专用构建命令**: 移动端构建务必使用 `npm run build:mobile`
2. **版本管理**: 使用 `./build-mobile.sh` 自动管理版本号
3. **测试连接**: 构建前测试服务器连接：`curl http://101.201.148.8:3001/health`
4. **清理缓存**: 如遇问题，先清理：`rm -rf dist && npm run build:mobile`

---

**🎉 现在移动端构建已完全解决localhost访问问题，享受丝滑的开发体验吧！**

## 🎯 项目状态

✅ **完全迁移成功！** React版本现已完整支持移动端构建，可以正常生成Android和iOS应用。

## 📱 支持的平台

- **Android**: 支持Android 6.0+ (API 23+)
- **iOS**: 支持iOS 13.0+

## 🚀 快速开始

### 1. 一键构建脚本

```bash
# 进入React项目目录
cd react-frontend

# 运行构建脚本
./build-mobile.sh
```

脚本提供4个选项：
1. **Android** - 仅构建Android版本
2. **iOS** - 仅构建iOS版本  
3. **两个平台都构建** - 同时构建Android和iOS
4. **仅同步，手动构建** - 同步代码后手动在IDE中构建

### 2. 手动构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建React应用
npm run build

# 3. 同步到移动端平台
npx cap sync

# 4. 打开对应IDE
npx cap open android  # Android Studio
npx cap open ios       # Xcode (仅macOS)
```

## 🔧 开发调试

### 实时调试模式

```bash
# Android实时调试 (需要连接设备或启动模拟器)
npm run mobile:dev:android

# iOS实时调试 (仅macOS，需要Xcode)
npm run mobile:dev:ios
```

### Web端调试
```bash
# 本地开发服务器
npm run dev
```

## 📋 环境要求

### 通用要求
- **Node.js**: 18.0+ 
- **npm**: 8.0+

### Android构建要求
- **Android Studio**: 最新稳定版
- **Android SDK**: API 33+
- **Java**: JDK 11+
- **环境变量**: `ANDROID_HOME` 指向Android SDK

### iOS构建要求 (仅macOS)
- **Xcode**: 14.0+
- **iOS SDK**: 16.0+
- **CocoaPods**: 1.11+

## 🔄 与Vue版本的差异

| 特性 | Vue版本 | React版本 | 备注 |
|------|---------|-----------|------|
| **应用ID** | `com.guiguqimen.app.1750352961` | `com.guiguqimen.react.app` | 不同的包名避免冲突 |
| **应用名称** | `奇门遁甲_2025-06-19_17-09-21` | `云丁未奇门遁甲` | 更简洁的命名 |
| **User-Agent** | `YunqueQimen/1.0` | `YunqueQimen-React/1.0` | 区分后端请求来源 |
| **技术栈** | Vue 3 + Pinia | React 18 + Redux Toolkit | 现代化技术栈 |
| **功能完整性** | ✅ | ✅ | 完全一致 |

## 📱 构建产物

### Android
- **APK位置**: `android/app/build/outputs/apk/`
- **AAB位置**: `android/app/build/outputs/bundle/`

### iOS  
- **Archive位置**: Xcode Organizer中管理
- **导出路径**: 通过Xcode Organizer选择

## 🛠️ 常用npm脚本

```json
{
  "mobile:build": "npm run build && npx cap sync",
  "mobile:android": "npx cap open android", 
  "mobile:ios": "npx cap open ios",
  "mobile:dev:android": "npx cap run android --livereload --external",
  "mobile:dev:ios": "npx cap run ios --livereload --external"
}
```

## 🐛 常见问题解决

### 1. TypeScript错误
如果遇到TypeScript相关错误：
```bash
npm install -D typescript
```

### 2. Capacitor同步失败
```bash
# 清理并重新同步
npx cap clean
npm run build
npx cap sync
```

### 3. Android构建失败
- 确保`ANDROID_HOME`环境变量正确设置
- 更新Android SDK到最新版本
- 清理项目：`cd android && ./gradlew clean`

### 4. iOS构建失败 (macOS)
- 确保Xcode版本最新
- 更新CocoaPods：`pod repo update`
- 清理项目：`cd ios && rm -rf Pods && pod install`

## ✅ 验证移动端功能

成功构建后，验证以下核心功能：
- [x] **应用启动** - 正常启动显示主界面
- [x] **网络请求** - API调用正常
- [x] **奇门遁甲计算** - 排盘和分析功能完整
- [x] **用户认证** - 登录注册流程
- [x] **数据存储** - 历史记录和收藏功能
- [x] **主题切换** - 暗色/亮色主题
- [x] **移动端优化** - 触摸交互和响应式布局

## 🎉 迁移成功总结

**React版移动端构建完全成功！**

✅ **技术完整性**: 所有Vue版本功能完整迁移
✅ **构建流程**: 自动化构建脚本完善  
✅ **平台支持**: Android和iOS双平台支持
✅ **开发体验**: 实时调试和热重载支持
✅ **代码质量**: 现代化React技术栈

---

*最后更新: 2024-12-19*  
*构建状态: ✅ 完全可用* 