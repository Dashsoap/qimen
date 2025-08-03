import React from 'react';
import PageHeader from '../components/layout/PageHeader';

/**
 * 设置详情页面 - 示例二级页面
 */
const SettingsDetailPage = () => {
  return (
    <div className="min-h-screen bg-[#fefdf7]">
      {/* 页面头部 */}
      <PageHeader 
        title="通知设置"
        subtitle="管理您的消息推送偏好"
      />
      
      {/* 页面内容 */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {/* 设置项示例 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#753c14] font-medium">推送通知</h3>
                <p className="text-[#999999] text-sm mt-1">接收重要消息和更新</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f3c165] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d3844e]"></div>
              </label>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#753c14] font-medium">邮件通知</h3>
                <p className="text-[#999999] text-sm mt-1">接收邮件提醒</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f3c165] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d3844e]"></div>
              </label>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#753c14] font-medium">声音提示</h3>
                <p className="text-[#999999] text-sm mt-1">播放通知声音</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f3c165] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d3844e]"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="mt-8">
          <button className="w-full bg-[#d3844e] hover:bg-[#f3c165] text-white py-3 px-4 rounded-lg font-medium transition-colors">
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDetailPage; 