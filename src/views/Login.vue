<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { PawPrint } from 'lucide-vue-next';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.login({ username: username.value, password: password.value });
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.message || '登录失败，请检查用户名或密码';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white px-8">
    <div class="w-full max-w-sm space-y-10">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF6B35] to-[#FF9F45] shadow-lg mb-6 transform rotate-3">
          <PawPrint :size="40" class="text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">欢迎回来</h2>
        <p class="mt-2 text-sm text-gray-500">登录你的宠物圈账号</p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1 ml-1">用户名</label>
            <input 
              id="username" 
              v-model="username" 
              name="username" 
              type="text" 
              required 
              class="appearance-none block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all text-base" 
              placeholder="请输入用户名"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1 ml-1">密码</label>
            <input 
              id="password" 
              v-model="password" 
              name="password" 
              type="password" 
              required 
              class="appearance-none block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all text-base" 
              placeholder="请输入密码"
            >
          </div>
        </div>

        <div v-if="error" class="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">{{ error }}</div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-[#FF6B35] hover:bg-[#ff8c61] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div class="text-center mt-6">
          <p class="text-sm text-gray-500">
            还没有账号? 
            <router-link to="/register" class="font-bold text-[#FF6B35] hover:text-[#e55a2b]">
              立即注册
            </router-link>
          </p>
        </div>
      </form>
      
      <!-- Social Login Placeholder -->
      <div class="pt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-100"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-400">或者使用微信登录</span>
          </div>
        </div>
        <div class="mt-6 flex justify-center gap-4">
           <button class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
             <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8.6 15.6c-.2 0-.4.1-.5.2-.2.2-.4.4-.5.7-.1.2-.1.5-.1.7 0 .2.1.5.2.7.2.2.4.3.7.3.2 0 .5-.1.7-.2.2-.2.3-.4.3-.7 0-.2-.1-.5-.2-.7-.2-.2-.4-.3-.6-.3zm6.8-6.9c-.2 0-.4.1-.6.2-.2.2-.3.4-.3.7s.1.5.3.7c.2.2.4.3.6.3.3 0 .5-.1.7-.2.2-.2.3-.4.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3zM12 2C6.5 2 2 5.8 2 10.5c0 2.6 1.4 4.9 3.6 6.5-.1.7-.4 2.5-.4 2.6 0 0 .9.2 3.2-1.3 1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.5S17.5 2 12 2z"/></svg>
           </button>
        </div>
      </div>
    </div>
  </div>
</template>
