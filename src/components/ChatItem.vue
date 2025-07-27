<template>
  <div
    :class="[item.type === 'group' ? 'chat-item' : 'private-item', 'swipe-item']"
    @click="!isEdit && openChat(item.type, item.id, item.name)"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <div class="swipe-content" :style="swipeStyles[item.key]">
      <div class="avatar-wrapper">
        <input v-if="isEdit" type="checkbox"
          :checked="selectedIds.includes(item.key)"
          @change="select(item.key, $event)"
          class="item-checkbox left" />
        <img v-if="item.avatar" :src="item.avatar" :class="item.type === 'group' ? 'avatar' : 'private-avatar'" />
        <div v-else :class="item.type === 'group' ? 'avatar' : 'private-avatar'">{{ item.name.charAt(0) }}</div>
        <span v-if="item.unreadCount > 0 && !isEdit" class="item-badge">{{ item.unreadCount }}</span>
      </div>
      <div :class="item.type === 'group' ? 'chat-info' : 'private-info'">
        <div :class="item.type === 'group' ? 'chat-name' : 'private-name'">{{ item.name }}</div>
        <div :class="item.type === 'group' ? 'chat-preview' : 'private-preview'">{{ item.content }}</div>
      </div>
      <div :class="item.type === 'group' ? 'chat-time' : 'private-time'">{{ item.sendTime && item.sendTime.slice(5, 10) }}</div>
    </div>
    <button v-if="swipeStates[item.key]" class="swipe-delete-btn" @click.stop="deleteItem(item.type, item.id)">
      <span v-if="deletingId !== item.key">删除</span>
      <span v-else class="loading-spinner"></span>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  item: Object,
  isEdit: Boolean,
  selectedIds: Array,
  swipeStates: Object,
  swipeStyles: Object,
  deletingId: String
})
const emit = defineEmits(['select', 'delete', 'open', 'swipe'])

function select(key, e) {
  emit('select', key, e)
}
function deleteItem(type, id) {
  emit('delete', type, id)
}
function openChat(type, id, name) {
  emit('open', type, id, name)
}
function onTouchStart(e) { emit('swipe', 'touchstart', props.item.key, e) }
function onTouchMove(e) { emit('swipe', 'touchmove', props.item.key, e) }
function onTouchEnd(e) { emit('swipe', 'touchend', props.item.key, e) }
function onMouseDown(e) { emit('swipe', 'mousedown', props.item.key, e) }
function onMouseMove(e) { emit('swipe', 'mousemove', props.item.key, e) }
function onMouseUp(e) { emit('swipe', 'mouseup', props.item.key, e) }
</script>

<style scoped>
/* ...可复用原 MessagePage.vue 样式... */
</style>
