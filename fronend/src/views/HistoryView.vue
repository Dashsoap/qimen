<template>
  <div class="history-view">
    <!-- 头部 -->
    <div class="history-header">
      <h1 class="page-title">
        <span class="title-icon">📜</span>
        历史记录
      </h1>
      
      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-input-wrapper">
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text" 
            placeholder="搜索问题或标签..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载历史记录...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadHistory" class="retry-button">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="records.length === 0 && !loading" class="empty-container">
      <div class="empty-icon">📝</div>
      <h3>暂无历史记录</h3>
      <p>开始您的第一次奇门遁甲分析吧</p>
      <router-link to="/qimen" class="start-button">开始分析</router-link>
    </div>

    <!-- 记录列表 -->
    <div v-else class="records-container">
      <div class="records-grid">
        <div 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
          @click="viewRecord(record)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="question-preview">
              {{ truncateText(record.question, 60) }}
            </div>
            <div class="card-actions">
              <button 
                @click.stop="toggleFavorite(record)"
                :class="['favorite-btn', { active: record.isFavorited }]"
                :title="record.isFavorited ? '取消收藏' : '添加收藏'"
              >
                {{ record.isFavorited ? '❤️' : '🤍' }}
              </button>
              <button 
                @click.stop="deleteRecord(record)"
                class="delete-btn"
                title="删除记录"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- 卡片内容 -->
          <div class="card-content">
            <div class="analysis-preview">
              {{ truncateText(record.analysis, 120) }}
            </div>
            
            <!-- 排盘信息预览 -->
            <div class="paipan-info">
              <span class="info-item">{{ record.paipanData?.时间信息?.排局 || '未知排局' }}</span>
              <span class="info-item">{{ record.paipanData?.时间信息?.干支 || '未知时辰' }}</span>
            </div>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <span class="time-stamp">{{ formatTime(record.createdAt) }}</span>
            <span v-if="record.tags" class="tags">
              <span 
                v-for="tag in record.tags.split(',')" 
                :key="tag"
                class="tag"
              >
                {{ tag.trim() }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="loadPage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          上一页
        </button>
        
        <span class="page-info">
          第 {{ pagination.page }} 页，共 {{ pagination.pages }} 页
        </span>
        
        <button 
          @click="loadPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedRecord" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>分析详情</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h4>问题</h4>
            <p class="question-detail">{{ selectedRecord.question }}</p>
          </div>
          
          <div class="detail-section">
            <h4>AI分析结果</h4>
            <div class="analysis-detail" v-html="formatAnalysis(selectedRecord.analysis)"></div>
          </div>
          
          <div class="detail-section">
            <h4>排盘信息</h4>
            <div class="paipan-detail">
              <p>排局：{{ selectedRecord.paipanData?.时间信息?.排局 || '未知' }}</p>
              <p>干支：{{ selectedRecord.paipanData?.时间信息?.干支 || '未知' }}</p>
              <p>时间：{{ formatTime(selectedRecord.createdAt) }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="toggleFavorite(selectedRecord)"
            :class="['favorite-btn-large', { active: selectedRecord.isFavorited }]"
          >
            {{ selectedRecord.isFavorited ? '❤️ 已收藏' : '🤍 添加收藏' }}
          </button>
          <button @click="closeModal" class="close-btn-large">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getQimenHistory, 
  deleteQimenHistory, 
  addQimenFavorite, 
  removeQimenFavorite,
  formatTime,
  truncateText 
} from '@/utils/qimenApi.js';

export default {
  name: 'HistoryView',
  data() {
    return {
      records: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      searchQuery: '',
      loading: true,
      error: null,
      selectedRecord: null,
      searchTimeout: null
    };
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    async loadHistory(page = 1) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await getQimenHistory({
          page,
          limit: this.pagination.limit,
          search: this.searchQuery
        });
        
        this.records = response.data.records;
        this.pagination = response.data.pagination;
        
      } catch (error) {
        console.error('加载历史记录失败:', error);
        this.error = error.message || '加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },
    
    async loadPage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        await this.loadHistory(page);
      }
    },
    
    debouncedSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.loadHistory(1);
      }, 500);
    },
    
    async toggleFavorite(record) {
      try {
        if (record.isFavorited) {
          await removeQimenFavorite(record.id);
          record.isFavorited = false;
        } else {
          await addQimenFavorite(record.id);
          record.isFavorited = true;
        }
      } catch (error) {
        console.error('收藏操作失败:', error);
        alert(error.message || '操作失败');
      }
    },
    
    async deleteRecord(record) {
      if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) {
        return;
      }
      
      try {
        await deleteQimenHistory(record.id);
        this.records = this.records.filter(r => r.id !== record.id);
        this.pagination.total--;
      } catch (error) {
        console.error('删除记录失败:', error);
        alert(error.message || '删除失败');
      }
    },
    
    viewRecord(record) {
      this.selectedRecord = record;
    },
    
    closeModal() {
      this.selectedRecord = null;
    },
    
    formatAnalysis(analysis) {
      if (!analysis) return '';
      return analysis.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    },
    
    formatTime,
    truncateText
  }
};
</script>

<style scoped>
.history-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  padding: 20px;
}

.history-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  margin-right: 10px;
}

.search-section {
  max-width: 500px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 15px;
  border: 2px solid #ffd700;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 16px;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.loading-container, .error-container, .empty-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top: 3px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.retry-button, .start-button {
  padding: 12px 30px;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  color: #1a1a1a;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.retry-button:hover, .start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.record-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.record-card:hover {
  transform: translateY(-5px);
  border-color: #ffd700;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.question-preview {
  font-weight: bold;
  color: #ffd700;
  flex: 1;
  margin-right: 10px;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.favorite-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.favorite-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.favorite-btn.active {
  animation: heartbeat 1s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.card-content {
  margin-bottom: 15px;
}

.analysis-preview {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 10px;
}

.paipan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-item {
  background: rgba(255, 215, 0, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
}

.time-stamp {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.tags {
  display: flex;
  gap: 5px;
}

.tag {
  background: rgba(255, 215, 0, 0.3);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-btn {
  padding: 10px 20px;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  color: #1a1a1a;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border: 2px solid #ffd700;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.modal-header h3 {
  color: #ffd700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  color: #ffd700;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.question-detail {
  background: rgba(255, 215, 0, 0.1);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #ffd700;
}

.analysis-detail {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.paipan-detail {
  background: rgba(255, 215, 0, 0.05);
  padding: 15px;
  border-radius: 10px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.favorite-btn-large, .close-btn-large {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn-large {
  background: linear-gradient(45deg, #ff6b6b, #ee5a5a);
  color: #ffffff;
}

.favorite-btn-large.active {
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  color: #1a1a1a;
}

.close-btn-large {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.favorite-btn-large:hover, .close-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .records-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 