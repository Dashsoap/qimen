/**
 * 时间处理工具
 * 提供各种时间相关的辅助函数
 */

/**
 * 获取当前时间信息（中国农历相关）
 * @returns {object} 时间信息对象
 */
export function getCurrentTimeInfo() {
  const now = new Date();
  
  // 中国时区（UTC+8）
  const chinaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  
  const year = chinaTime.getFullYear();
  const month = chinaTime.getMonth() + 1;
  const date = chinaTime.getDate();
  const hour = chinaTime.getHours();
  const minute = chinaTime.getMinutes();
  
  // 获取天干地支时辰
  const timeInfo = {
    公历: `${year}年${month}月${date}日`,
    时间: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    时辰: getChineseHour(hour),
    星期: getWeekdayName(chinaTime.getDay()),
    年份: year,
    月份: month,
    日期: date,
    小时: hour,
    分钟: minute,
    timestamp: chinaTime.getTime()
  };
  
  return timeInfo;
}

/**
 * 获取中国传统时辰
 * @param {number} hour - 小时（0-23）
 * @returns {string} 时辰名称
 */
export function getChineseHour(hour) {
  const hours = [
    '子时', '丑时', '丑时', '寅时', '寅时', '卯时',
    '卯时', '辰时', '辰时', '巳时', '巳时', '午时',
    '午时', '未时', '未时', '申时', '申时', '酉时',
    '酉时', '戌时', '戌时', '亥时', '亥时', '子时'
  ];
  return hours[hour] || '未知';
}

/**
 * 获取星期名称
 * @param {number} day - 星期几（0-6）
 * @returns {string} 星期名称
 */
export function getWeekdayName(day) {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[day] || '未知';
}

/**
 * 格式化时间戳为可读字符串
 * @param {number|Date} timestamp - 时间戳或Date对象
 * @param {string} format - 格式（default/full/date/time）
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimestamp(timestamp, format = 'default') {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'full':
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hour}:${minute}:${second}`;
    case 'iso':
      return date.toISOString();
    case 'default':
    default:
      return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}

/**
 * 计算时间差（人类可读格式）
 * @param {number|Date} startTime - 开始时间
 * @param {number|Date} endTime - 结束时间（默认为当前时间）
 * @returns {string} 时间差描述
 */
export function getTimeDifference(startTime, endTime = Date.now()) {
  const start = startTime instanceof Date ? startTime.getTime() : startTime;
  const end = endTime instanceof Date ? endTime.getTime() : endTime;
  const diff = Math.abs(end - start);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  if (seconds > 0) return `${seconds}秒前`;
  return '刚刚';
}

/**
 * 计算执行时间（毫秒）
 * @param {number} startTime - 开始时间戳
 * @param {number} endTime - 结束时间戳（默认为当前时间）
 * @returns {number} 执行时间（毫秒）
 */
export function calculateExecutionTime(startTime, endTime = Date.now()) {
  return endTime - startTime;
}

/**
 * 生成时间范围
 * @param {string} range - 范围类型（today/week/month/year）
 * @returns {object} 开始和结束时间
 */
export function getTimeRange(range) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      };
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        start: startOfMonth,
        end: endOfMonth
      };
    case 'year':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        start: startOfYear,
        end: endOfYear
      };
    default:
      return {
        start: startOfDay,
        end: now
      };
  }
}

/**
 * 检查时间是否在范围内
 * @param {Date|number} time - 要检查的时间
 * @param {Date|number} start - 开始时间
 * @param {Date|number} end - 结束时间
 * @returns {boolean} 是否在范围内
 */
export function isTimeInRange(time, start, end) {
  const t = time instanceof Date ? time.getTime() : time;
  const s = start instanceof Date ? start.getTime() : start;
  const e = end instanceof Date ? end.getTime() : end;
  
  return t >= s && t <= e;
}

/**
 * 获取友好的时间描述
 * @param {Date|number|string} time - 时间
 * @returns {string} 友好的时间描述
 */
export function getFriendlyTime(time) {
  const date = time instanceof Date ? time : new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 未来时间
  if (diff < 0) {
    return formatTimestamp(date, 'default');
  }
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatTimestamp(date, 'date');
}

