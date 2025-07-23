# SSL证书配置指南

## 🔒 HTTPS部署说明

恭喜您备案成功！现在可以为您的奇门遁甲AI应用配置HTTPS了。

## 📋 自动SSL证书配置

部署脚本已更新为支持HTTPS，包含以下特性：

### ✅ 自动证书获取
- **Let's Encrypt免费证书**（推荐）
- **自签名证书**（备用方案）
- **自动续期**（Let's Encrypt证书）

### ✅ 安全配置
- HTTP自动重定向到HTTPS
- 强化的SSL配置（TLS 1.2+）
- 安全响应头（HSTS、CSP等）
- 现代加密算法支持

## 🚀 部署步骤

### 1. 运行HTTPS部署
```bash
./deploy.sh
```

### 2. 证书自动配置
部署脚本会自动：
1. 尝试获取Let's Encrypt免费证书
2. 如果失败，生成自签名证书
3. 配置nginx使用SSL证书
4. 设置HTTP到HTTPS重定向

### 3. 访问应用
- **前端应用**: https://101.201.148.8
- **后端API**: https://101.201.148.8/api
- **健康检查**: https://101.201.148.8/health

## 🔧 手动证书配置（可选）

如果您有自己的SSL证书，可以手动配置：

### 1. 上传证书文件
```bash
# 上传到服务器
scp your-cert.crt root@101.201.148.8:/etc/nginx/ssl/101.201.148.8.crt
scp your-cert.key root@101.201.148.8:/etc/nginx/ssl/101.201.148.8.key
```

### 2. 设置正确权限
```bash
ssh root@101.201.148.8
chmod 600 /etc/nginx/ssl/101.201.148.8.key
chmod 644 /etc/nginx/ssl/101.201.148.8.crt
chown root:root /etc/nginx/ssl/*
```

### 3. 重启nginx
```bash
systemctl restart nginx
```

## 🧪 测试SSL配置

### 1. 检查证书状态
```bash
# 在服务器上运行
openssl s_client -connect 101.201.148.8:443 -servername 101.201.148.8
```

### 2. 验证重定向
```bash
# 应该自动重定向到HTTPS
curl -I http://101.201.148.8
```

### 3. 在线SSL测试
- 访问 https://www.ssllabs.com/ssltest/
- 输入您的域名进行完整测试

## 📱 移动端配置

如果您在构建移动应用，需要更新Capacitor配置：

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qimen.app',
  appName: '鬼谷奇门遁甲',
  webDir: 'dist',
  server: {
    url: 'https://101.201.148.8',
    cleartext: false // 强制HTTPS
  }
};

export default config;
```

## 🔄 证书续期

### Let's Encrypt证书
- 自动续期已配置（每天中午12点检查）
- 手动续期：`certbot renew --force-renewal`

### 自有证书
- 需要在过期前手动更新
- 建议设置日历提醒

## 🚨 故障排除

### 1. 证书获取失败
```bash
# 检查域名解析
nslookup 101.201.148.8

# 检查80端口是否开放
telnet 101.201.148.8 80
```

### 2. SSL配置错误
```bash
# 测试nginx配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 3. 证书过期
```bash
# 检查证书有效期
openssl x509 -in /etc/nginx/ssl/101.201.148.8.crt -noout -dates
```

## 📞 支持

如果遇到SSL配置问题，请：
1. 检查服务器日志
2. 确认防火墙设置
3. 验证域名解析正确
4. 联系技术支持

## 🎉 恭喜

您的奇门遁甲AI应用现在已经支持HTTPS访问，享受更安全的体验！ 