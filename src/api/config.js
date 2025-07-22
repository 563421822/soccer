import axios from 'axios'
import router from '@/router'

const baseURL = import.meta.env.DEV ? 'http://154.214.177.99:8080/api' : 'http://154.214.177.99:8080/api'

const api = axios.create({
  baseURL,
  timeout: 5000
})

// 请求拦截器：自动带上 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：token 失效自动跳转登录
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      router.replace('/login')
    }
    return Promise.reject(err)
  }
)

export { baseURL }
export default api

