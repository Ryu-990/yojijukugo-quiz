<template>
  <div class="difficulty-selector">
    <h3>難易度設定</h3>
    <div class="difficulty-options">
      <button
        v-for="option in options"
        :key="option.value"
        :class="{ active: value === option.value }"
        @click="selectDifficulty(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: 'medium'
  }
});

const emit = defineEmits(['update:value', 'change']);

const options = [
  { value: 'easy', label: '簡単' },
  { value: 'medium', label: '普通' },
  { value: 'hard', label: '難しい' }
];

function selectDifficulty(difficulty) {
  emit('update:value', difficulty);
  emit('change', difficulty);
}
</script>

<style scoped>
.difficulty-selector {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.difficulty-options {
  display: flex;
  justify-content: center;
  gap: 10px;
}

button {
  padding: 8px 15px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 3px;
}
</style>