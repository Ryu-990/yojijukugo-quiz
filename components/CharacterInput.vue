<template>
  <div class="character-input">
    <input
      type="text"
      v-model="character"
      maxlength="1"
      class="input-field"
      :class="{ 'player-a': isPlayerA, 'player-b': !isPlayerA }"
      :disabled="disabled || !canEdit"
      @input="onInput"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  position: {
    type: Number,
    required: true
  },
  value: {
    type: String,
    default: ''
  },
  isPlayerA: {
    type: Boolean,
    required: true
  },
  myTurn: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value', 'input-character']);

const character = ref(props.value);
const canEdit = computed(() => {
  // プレイヤーAは0, 2の位置、プレイヤーBは1, 3の位置を編集可能
  return (props.isPlayerA && (props.position === 0 || props.position === 2)) ||
         (!props.isPlayerA && (props.position === 1 || props.position === 3));
});

watch(() => props.value, (newValue) => {
  character.value = newValue;
});

function onInput() {
  if (character.value.length > 0 && canEdit.value && props.myTurn) {
    emit('update:value', character.value);
    emit('input-character', {
      position: props.position,
      character: character.value
    });
  }
}
</script>

<style scoped>
.character-input {
  display: inline-block;
  margin: 0 5px;
}

.input-field {
  width: 60px;
  height: 60px;
  font-size: 32px;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 5px;
}

.player-a {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.player-b {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.input-field:disabled {
  background-color: #f5f5f5;
  color: #777;
}
</style>ï