<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      即刻开启您的球球之旅，适用于
      <a href="https://developer.android.google.cn" target="_blank" rel="noopener">Android</a>、
      <a href="https://www.apple.com/os/ios/" target="_blank" rel="noopener">iOS</a>和
      <a href="https://www.microsoft.com/zh-cn/software-download/windows11" target="_blank" rel="noopener">Windows</a>平台。
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
