<template>
  <div class="favorites-view">
    <!-- 头部 -->
    <div class="favorites-header">
      <h1 class="page-title">
        <span class="title-icon">⭐</span>
        我的收藏
      </h1>
      <p class="subtitle">珍藏的奇门遁甲智慧</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载收藏记录...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadFavorites" class="retry-button">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="favorites.length === 0 && !loading" class="empty-container">
      <div class="empty-icon">💫</div>
      <h3>暂无收藏记录</h3>
      <p>收藏重要的分析结果，方便日后查阅</p>
      <router-link to="/history" class="browse-button">浏览历史记录</router-link>
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorites-container">
      <div class="favorites-grid">
        <div 
          v-for="favorite in favorites" 
          :key="favorite.id"
          class="favorite-card"
          @click="viewRecord(favorite.record)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="question-preview">
              {{ truncateText(favorite.record.question, 60) }}
            </div>
            <div class="card-actions">
              <button 
                @click.stop="editNote(favorite)"
                class="edit-btn"
                title="编辑备注"
              >
                📝
              </button>
              <button 
                @click.stop="removeFavorite(favorite)"
                class="remove-btn"
                title="取消收藏"
              >
                💔
              </button>
            </div>
          </div>

          <!-- 收藏备注 -->
          <div v-if="favorite.note" class="favorite-note">
            <span class="note-icon">💡</span>
            <span class="note-text">{{ favorite.note }}</span>
          </div>

          <!-- 卡片内容 -->
          <div class="card-content">
            <div class="analysis-preview">
              {{ truncateText(favorite.record.analysis, 120) }}
            </div>
            
            <!-- 排盘信息预览 -->
            <div class="paipan-info">
              <span class="info-item">{{ favorite.record.paipanData?.时间信息?.排局 || '未知排局' }}</span>
              <span class="info-item">{{ favorite.record.paipanData?.时间信息?.干支 || '未知时辰' }}</span>
            </div>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="time-info">
              <span class="created-time">分析时间：{{ formatTime(favorite.record.createdAt) }}</span>
              <span class="favorited-time">收藏时间：{{ formatTime(favorite.createdAt) }}</span>
            </div>
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
          <h3>收藏详情</h3>
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
              <p>分析时间：{{ formatTime(selectedRecord.createdAt) }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="close-btn-large">关闭</button>
        </div>
      </div>
    </div>

    <!-- 备注编辑弹窗 -->
    <div v-if="editingFavorite" class="modal-overlay" @click="closeNoteModal">
      <div class="note-modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑收藏备注</h3>
          <button @click="closeNoteModal" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="note-form">
            <label for="note-input">备注内容</label>
            <textarea 
              id="note-input"
              v-model="noteText"
              placeholder="添加您的收藏备注..."
              rows="4"
              class="note-textarea"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="saveNote" class="save-btn" :disabled="savingNote">
            {{ savingNote ? '保存中...' : '保存' }}
          </button>
          <button @click="closeNoteModal" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getQimenFavorites, 
  removeQimenFavorite, 
  updateQimenFavoriteNote,
  formatTime,
  truncateText 
} from '@/utils/qimenApi.js';

export default {
  name: 'FavoritesView',
  data() {
    return {
      favorites: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      loading: true,
      error: null,
      selectedRecord: null,
      editingFavorite: null,
      noteText: '',
      savingNote: false
    };
  },
  mounted() {
    this.loadFavorites();
  },
  methods: {
    async loadFavorites(page = 1) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await getQimenFavorites({
          page,
          limit: this.pagination.limit
        });
        
        this.favorites = response.data.favorites;
        this.pagination = response.data.pagination;
        
      } catch (error) {
        console.error('加载收藏记录失败:', error);
        this.error = error.message || '加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },
    
    async loadPage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        await this.loadFavorites(page);
      }
    },
    
    async removeFavorite(favorite) {
      if (!confirm('确定要取消收藏吗？')) {
        return;
      }
      
      try {
        await removeQimenFavorite(favorite.recordId);
        this.favorites = this.favorites.filter(f => f.id !== favorite.id);
        this.pagination.total--;
      } catch (error) {
        console.error('取消收藏失败:', error);
        alert(error.message || '操作失败');
      }
    },
    
    editNote(favorite) {
      this.editingFavorite = favorite;
      this.noteText = favorite.note || '';
    },
    
    async saveNote() {
      if (this.savingNote) return;
      
      try {
        this.savingNote = true;
        
        await updateQimenFavoriteNote(this.editingFavorite.recordId, this.noteText);
        
        // 更新本地数据
        const favoriteIndex = this.favorites.findIndex(f => f.id === this.editingFavorite.id);
        if (favoriteIndex !== -1) {
          this.favorites[favoriteIndex].note = this.noteText;
        }
        
        this.closeNoteModal();
        
      } catch (error) {
        console.error('保存备注失败:', error);
        alert(error.message || '保存失败');
      } finally {
        this.savingNote = false;
      }
    },
    
    closeNoteModal() {
      this.editingFavorite = null;
      this.noteText = '';
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
.favorites-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  padding: 20px;
}

.favorites-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  margin-right: 10px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
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

.retry-button, .browse-button {
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

.retry-button:hover, .browse-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.favorite-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.favorite-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
  transition: left 0.5s ease;
}

.favorite-card:hover::before {
  left: 100%;
}

.favorite-card:hover {
  transform: translateY(-8px);
  border-color: #ffd700;
  box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
}

.question-preview {
  font-weight: bold;
  color: #ffd700;
  flex: 1;
  margin-right: 10px;
  font-size: 1.1rem;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .remove-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  transform: scale(1.1);
}

.remove-btn:hover {
  background: rgba(255, 100, 100, 0.2);
  transform: scale(1.1);
}

.favorite-note {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.note-icon {
  font-size: 16px;
  margin-top: 2px;
}

.note-text {
  color: #ffffff;
  line-height: 1.4;
  font-style: italic;
}

.card-content {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.analysis-preview {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 15px;
}

.paipan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  background: rgba(255, 215, 0, 0.25);
  border: 1px solid rgba(255, 215, 0, 0.4);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-footer {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  position: relative;
  z-index: 1;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.created-time, .favorited-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.favorited-time {
  color: rgba(255, 215, 0, 0.8);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.page-btn {
  padding: 12px 25px;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  color: #1a1a1a;
  border: none;
  border-radius: 25px;
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
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content, .note-modal-content {
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border: 2px solid #ffd700;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.2);
}

.note-modal-content {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.modal-header h3 {
  color: #ffd700;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #ffffff;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  color: #ffd700;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.question-detail {
  background: rgba(255, 215, 0, 0.1);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #ffd700;
  font-weight: 500;
}

.analysis-detail {
  background: rgba(255, 255, 255, 0.05);
  padding: 25px;
  border-radius: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.paipan-detail {
  background: rgba(255, 215, 0, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.note-form label {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
}

.note-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 16px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.note-textarea:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.save-btn, .cancel-btn, .close-btn-large {
  padding: 12px 25px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  color: #1a1a1a;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn, .close-btn-large {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.save-btn:not(:disabled):hover, .cancel-btn:hover, .close-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .modal-content, .note-modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .favorite-card {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style> 