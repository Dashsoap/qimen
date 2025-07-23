<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['submit-btn', { 'loading': loading }]"
    @click="$emit('click')"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-if="!loading"></slot>
    <span v-else>{{ loadingText }}</span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中...'
  }
})

defineEmits(['click'])
</script>

<style scoped>
.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #C4A876, #D4AF37);
  border: none;
  border-radius: 8px;
  color: #1A1611;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(196, 168, 118, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #D4AF37, #E6C547);
  box-shadow: 0 6px 16px rgba(196, 168, 118, 0.4);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 12px rgba(196, 168, 118, 0.2);
}

.submit-btn.loading {
  background: linear-gradient(135deg, rgba(196, 168, 118, 0.8), rgba(212, 175, 55, 0.8));
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 22, 17, 0.3);
  border-top: 2px solid #1A1611;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>