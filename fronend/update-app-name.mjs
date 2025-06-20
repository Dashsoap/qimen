import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成时间戳
const now = new Date();
const timeStamp = now.toISOString()
  .replace(/T/, '_')
  .replace(/:/g, '-')
  .split('.')[0]; // 格式: 2024-06-20_01-30-45

const buildNumber = Math.floor(Date.now() / 1000); // Unix时间戳作为构建号

// 生成新的APP名称和ID
const appName = `奇门遁甲_${timeStamp}`;
const appId = `com.yunqueqimen.app.${buildNumber}`;

console.log(`🔄 更新APP信息:`);
console.log(`📱 应用名称: ${appName}`);
console.log(`🆔 应用ID: ${appId}`);
console.log(`⏰ 构建时间: ${now.toLocaleString('zh-CN')}`);

// 更新capacitor.config.ts文件
const configPath = path.join(__dirname, 'capacitor.config.ts');
let configContent = fs.readFileSync(configPath, 'utf8');

// 替换appId和appName
configContent = configContent.replace(
  /appId: '[^']*'/,
  `appId: '${appId}'`
);
configContent = configContent.replace(
  /appName: '[^']*'/,
  `appName: '${appName}'`
);

// 写回文件
fs.writeFileSync(configPath, configContent, 'utf8');

// 更新package.json的name字段
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.name = `yunque-qimen-${buildNumber}`;
packageJson.version = `1.0.${buildNumber}`;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('✅ APP信息更新完成!');
console.log('📦 可以使用 npm run build:mobile 进行构建'); 