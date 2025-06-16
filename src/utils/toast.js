// 通用toast工具函数
import { ref } from 'vue'

export function useErrorToast() {
  const showToast = ref(false)
  const toastMsg = ref('')
  let toastTimer = null

  function showErrorToast(msg) {
    toastMsg.value = msg
    showToast.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      showToast.value = false
    }, 1800)
  }

  return {
    showToast,
    toastMsg,
    showErrorToast
  }
}

