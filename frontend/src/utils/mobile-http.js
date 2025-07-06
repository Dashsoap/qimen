import { CapacitorHttp } from '@capacitor/core';

// 检测是否为移动端
const isMobile = () => {
  return window.location.protocol === 'file:' || 
         window.location.protocol === 'capacitor:' || 
         window.location.protocol === 'ionic:' ||
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 移动端HTTP请求工具
export class MobileHttp {
  static async request(options) {
    const { url, method = 'GET', data, headers = {} } = options;
    
    console.log('🌐 移动端HTTP请求:', { url, method, data, headers });
    
    if (isMobile()) {
      // 🔧 移动端多重请求策略
      return await this.tryMultipleRequestMethods(url, method, data, headers);
    } else {
      // Web端使用fetch
      return await this.webFetchRequest(url, method, data, headers);
    }
  }
  
  // 🔧 新增：多重请求方法尝试
  static async tryMultipleRequestMethods(url, method, data, headers) {
    const methods = [
      () => this.capacitorHttpRequest(url, method, data, headers),
      () => this.nativeFetchRequest(url, method, data, headers),
      () => this.xmlHttpRequest(url, method, data, headers)
    ];
    
    let lastError = null;
    
    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`🔄 尝试请求方法 ${i + 1}/${methods.length}`);
        const result = await methods[i]();
        console.log(`✅ 请求方法 ${i + 1} 成功`);
        return result;
      } catch (error) {
        console.log(`❌ 请求方法 ${i + 1} 失败:`, error.message);
        lastError = error;
        
        // 如果不是最后一个方法，继续尝试
        if (i < methods.length - 1) {
          console.log(`🔄 尝试下一个请求方法...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        }
      }
    }
    
    // 所有方法都失败了
    throw new Error(`所有请求方法都失败: ${lastError?.message || '未知错误'}`);
  }
  
  // 🔧 优化的Capacitor HTTP请求
  static async capacitorHttpRequest(url, method, data, headers) {
    const requestOptions = {
      url,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'YunqueQimen/1.0 Android',
        ...headers
      },
      connectTimeout: 60000,    // 🔧 减少到60秒
      readTimeout: 300000,      // 5分钟读取超时
      // 🔧 Android特殊配置优化
      ...(navigator.userAgent.includes('Android') && {
        responseType: 'text',  // 🔧 改为text，避免JSON解析问题
        shouldEncodeUrlParams: false,
        disableRedirects: false
      })
    };
    
    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
      requestOptions.data = typeof data === 'string' ? data : JSON.stringify(data);
    }
    
    console.log('📱 使用Capacitor内置HTTP:', requestOptions);
    const response = await CapacitorHttp.request(requestOptions);
    
    console.log('✅ Capacitor HTTP响应:', response);
    
    // 🔧 改进响应数据处理
    let responseData = response.data;
    if (typeof responseData === 'string' && responseData.trim()) {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        console.log('📄 响应不是JSON格式，保持原样');
      }
    }
    
    return {
      data: responseData,
      status: response.status,
      statusText: response.status < 400 ? 'OK' : 'Error',
      headers: response.headers || {}
    };
  }
  
  // 🔧 新增：原生fetch请求（移动端）
  static async nativeFetchRequest(url, method, data, headers) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分钟超时
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'YunqueQimen/1.0 Android Native',
        ...headers
      },
      signal: controller.signal
    };
    
    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
      fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }
    
    console.log('📱 使用原生fetch:', { url, ...fetchOptions });
    const response = await fetch(url, fetchOptions);
    
    clearTimeout(timeoutId);
    
    // 🔧 修复：检查response是否存在
    if (!response) {
      throw new Error('网络连接失败，请检查网络状态');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
  }
  
  // 🔧 改进的XMLHttpRequest
  static async xmlHttpRequest(url, method, data, headers) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 300000; // 5分钟超时
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              resolve({
                data: responseData,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: {}
              });
            } catch (e) {
              reject(new Error('响应JSON解析失败'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('网络连接失败，请检查网络状态'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('请求超时'));
      };
      
      xhr.open(method.toUpperCase(), url, true);
      
      // 🔧 设置请求头
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('User-Agent', 'YunqueQimen/1.0 Android XHR');
      
      // 设置自定义请求头
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
      
      if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        const requestData = typeof data === 'string' ? data : JSON.stringify(data);
        console.log('📤 发送XMLHttpRequest，数据长度:', requestData.length);
        xhr.send(requestData);
      } else {
        xhr.send();
      }
    });
  }
  
  // Web端fetch请求
  static async webFetchRequest(url, method, data, headers) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3分钟超时
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      signal: controller.signal
    };
    
    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
      fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }
    
    console.log('🌐 使用Web fetch:', { url, ...fetchOptions });
    const response = await fetch(url, fetchOptions);
    
    clearTimeout(timeoutId);
    
    // 🔧 修复：检查response是否存在
    if (!response) {
      throw new Error('网络连接失败，请检查网络状态');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
  }
  
  static async get(url, headers = {}) {
    return this.request({ url, method: 'GET', headers });
  }
  
  static async post(url, data, headers = {}) {
    return this.request({ url, method: 'POST', data, headers });
  }
  
  static async put(url, data, headers = {}) {
    return this.request({ url, method: 'PUT', data, headers });
  }
  
  static async delete(url, headers = {}) {
    return this.request({ url, method: 'DELETE', headers });
  }
}

export default MobileHttp; 