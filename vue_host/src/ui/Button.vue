<template>
  <button 
    :class="buttonClass" 
    @click="onClick"
  >
    <slot>Click Me</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'primary' } // 'primary' | 'secondary' | 'outlined'
})

const emit = defineEmits(['click'])

const onClick = (event) => {
  emit('click', event)
}

const buttonClass = computed(() => {
  switch (props.type) {
    case 'secondary':
      return 'secondary'
    case 'outlined':
      return 'outlined'
    default:
      return 'primary'
  }
})
</script>

<style scoped>
.primary {
  background-color: #3b82f6; /* blue-500 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.primary:hover {
  background-color: #2563eb; /* blue-600 */
}

.secondary {
  background-color: #d1d5db; /* gray-300 */
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.secondary:hover {
  background-color: #9ca3af; /* gray-400 */
}

.outlined {
  background-color: transparent;
  color: #374151; /* gray-700 */
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #6b7280; /* gray-500 */
  cursor: pointer;
}

.outlined:hover {
  background-color: #f3f4f6; /* gray-100 */
}
</style>
