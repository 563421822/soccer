<!-- UploadingImage.vue -->
<template>
  <div class="chat-msg chat-msg-right">
    <div class="msg-avatar">
      <img :src="avatar" class="upload-avatar" />
    </div>
    <div class="msg-body msg-body-self">
      <div class="msg-text uploading-container">
        <img :src="previewUrl" class="upload-preview" />
        <div v-if="!done" class="upload-overlay">
          <div class="progress">{{ progress }}%</div>
        </div>
      </div>
      <div class="msg-time">{{ time }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  previewUrl: String,
  finalUrl: String,
  avatar: String,
  time: String,
  progress: Number,
  done: Boolean
})
</script>

<style scoped>
.upload-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 6px;
}

.upload-preview {
  max-width: 180px;
  max-height: 180px;
  border-radius: 10px;
  display: block;
}

.uploading-container {
  position: relative;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #27c16e;
  font-weight: bold;
  border-radius: 10px;
}
</style>
