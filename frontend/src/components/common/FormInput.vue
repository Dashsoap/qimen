<template>
  <div class="form-group">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="input-container">
      <div v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix"></slot>
      </div>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
        :type="type"
        :placeholder="placeholder"
        :class="['form-input', { 'error': error, 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix }]"
        :maxlength="maxlength"
      />
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  maxlength: [String, Number]
})

defineEmits(['update:modelValue', 'blur'])
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #C4A876;
  letter-spacing: 0.5px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 16px;
  color: rgba(196, 168, 118, 0.5);
  z-index: 2;
  pointer-events: none;
}

.input-suffix {
  position: absolute;
  right: 16px;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(196, 168, 118, 0.2);
  border-radius: 8px;
  color: #C4A876;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.form-input.has-prefix {
  padding-left: 48px;
}

.form-input.has-suffix {
  padding-right: 48px;
}

.form-input::placeholder {
  color: rgba(196, 168, 118, 0.4);
}

.form-input:focus {
  outline: none;
  border-color: rgba(196, 168, 118, 0.4);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(196, 168, 118, 0.1);
}

.form-input.error {
  border-color: rgba(220, 53, 69, 0.5);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: rgba(220, 53, 69, 0.8);
  font-size: 12px;
  margin-top: 4px;
}
</style>