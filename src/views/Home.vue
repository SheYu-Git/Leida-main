<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePostStore } from '../stores/post';
import { useAuthStore } from '../stores/auth';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, LayoutDashboard } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import api from '../lib/axios';

const postStore = usePostStore();
const authStore = useAuthStore();
const router = useRouter();
const activeTab = ref('recommend');

// Watch tab change
import { watch } from 'vue';
watch(activeTab, (newVal) => {
  postStore.fetchPosts(newVal);
});

onMounted(() => {
  postStore.fetchPosts(activeTab.value);
});
const currentPost = ref<any>(null);
const comments = ref<any[]>([]);
const newComment = ref('');
const submittingComment = ref(false);
const showCommentModal = ref(false);

const tabs = [
  { id: 'recommend', label: '推荐' },
  { id: 'follow', label: '关注' },
  { id: 'nearby', label: '同城' }
];

/*
onMounted(() => {
  postStore.fetchPosts();
});
*/

const handleLike = async (post: any) => {
  try {
    await postStore.toggleLike(post.id);
  } catch (error) {
    console.error('Like failed', error);
  }
};

const openComments = async (post: any) => {
  currentPost.value = post;
  showCommentModal.value = true;
  comments.value = [];
  try {
    const response = await api.get(`/posts/${post.id}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error('Fetch comments failed', error);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || !currentPost.value) return;
  
  submittingComment.value = true;
  try {
    const comment = await postStore.addComment(currentPost.value.id, newComment.value);
    comments.value.push(comment);
    newComment.value = '';
  } catch (error) {
    console.error('Comment failed', error);
  } finally {
    submittingComment.value = false;
  }
};

const goToProfile = (userId: number) => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Custom Header for Home -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe">
      <div class="flex items-center justify-between px-4 h-12">
        <div class="w-10">
           <!-- Placeholder for avatar/menu -->
           <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Me" />
           </div>
        </div>
        <div class="flex space-x-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="text-[16px] font-bold transition-all relative"
            :class="activeTab === tab.id ? 'text-[#333333]' : 'text-gray-400'"
          >
            {{ tab.label }}
            <div v-if="activeTab === tab.id" class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-5 h-[3px] bg-[#FF6B35] rounded-full shadow-sm"></div>
          </button>
        </div>
        <div class="w-10 flex justify-end">
          <router-link v-if="authStore.user?.role === 'admin'" to="/admin" class="p-1 text-gray-600 mr-2" title="管理后台">
            <LayoutDashboard :size="24" />
          </router-link>
          <button class="p-1">
             <!-- Placeholder for search/notification -->
             <div class="w-6 h-6 text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
             </div>
          </button>
        </div>
      </div>
    </header>
    <div class="h-16 pt-safe"></div>

    <!-- Stories / Banner Area -->
    <div class="bg-white p-4 mb-4 mt-2 overflow-x-auto no-scrollbar">
      <div class="flex space-x-4">
        <div class="flex flex-col items-center space-y-1 min-w-[64px]">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 p-[2px]">
            <div class="w-full h-full rounded-full bg-white p-[2px]">
              <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop" class="w-full h-full rounded-full object-cover" alt="Story" />
            </div>
          </div>
          <span class="text-xs text-gray-600 truncate w-16 text-center">我的宠物</span>
        </div>
        <div v-for="(img, i) in [
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=150&h=150&fit=crop'
        ]" :key="i" class="flex flex-col items-center space-y-1 min-w-[64px]">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 p-[2px]">
            <div class="w-full h-full rounded-full bg-white p-[2px]">
              <img :src="img" class="w-full h-full rounded-full object-cover" alt="Story" />
            </div>
          </div>
          <span class="text-xs text-gray-600 truncate w-16 text-center">用户{{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Feed -->
    <div class="space-y-2 pb-20">
      <div v-if="postStore.loading" class="text-center py-10 text-gray-400">加载中...</div>
      
      <template v-else>
        <!-- Post Card -->
        <div v-for="post in postStore.posts" :key="post.id" class="bg-white pb-4">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center space-x-3" @click="goToProfile(post.author?.id)">
              <img :src="post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`" class="w-10 h-10 rounded-full border border-gray-100" alt="Avatar" />
              <div>
                <h3 class="text-sm font-bold text-gray-900">{{ post.author?.nickname || post.author?.username }}</h3>
                <p class="text-xs text-gray-500">{{ new Date(post.created_at).toLocaleDateString() }} · {{ post.location || '杭州' }}</p>
              </div>
            </div>
            <button class="text-gray-400">
              <MoreHorizontal :size="20" />
            </button>
          </div>

          <!-- Content -->
          <div class="px-4 mb-2">
            <p class="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{{ post.content }}</p>
          </div>

          <!-- Images -->
          <div v-if="post.images && post.images.length" class="mb-3 overflow-hidden">
             <!-- Single Image -->
             <div v-if="post.images.length === 1" class="px-4">
               <img :src="post.images[0]" class="w-full rounded-xl max-h-[400px] object-cover" alt="Post Image" />
             </div>
             <!-- Multiple Images (Grid) -->
             <div v-else class="px-4 grid grid-cols-3 gap-1">
               <div v-for="(img, idx) in post.images" :key="idx" class="aspect-square relative">
                 <img :src="img" class="absolute inset-0 w-full h-full object-cover rounded-lg" alt="Post Image" />
               </div>
             </div>
          </div>

          <!-- Actions -->
          <div class="px-4 flex items-center justify-between mt-2">
            <div class="flex items-center space-x-6">
              <button 
                class="flex items-center space-x-1 transition-colors"
                :class="post.liked ? 'text-red-500' : 'text-gray-700'"
                @click="handleLike(post)"
              >
                <Heart :size="24" stroke-width="2" :fill="post.liked ? 'currentColor' : 'none'" />
                <span class="text-sm font-medium">{{ post.likes || 0 }}</span>
              </button>
              <button 
                class="flex items-center space-x-1 text-gray-700 active:text-blue-500 transition-colors"
                @click="openComments(post)"
              >
                <MessageCircle :size="24" stroke-width="2" />
                <span class="text-sm font-medium">{{ post.comments_count || 0 }}</span>
              </button>
              <button class="text-gray-700 active:text-green-500 transition-colors">
                <Share2 :size="24" stroke-width="2" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="postStore.posts.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart :size="32" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">暂无动态</h3>
          <p class="text-gray-500 mt-1 max-w-xs">快去发布第一条动态，分享你的宠物生活吧！</p>
          <router-link to="/post/create" class="mt-6 px-6 py-2 bg-[#FF6B35] text-white rounded-full font-medium shadow-lg shadow-orange-200">
            发布动态
          </router-link>
        </div>
      </template>
    </div>

    <!-- Comment Modal (Bottom Sheet style) -->
    <div v-if="showCommentModal" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCommentModal = false"></div>
      <div class="bg-white w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl relative z-10 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-base font-bold text-gray-900">评论 ({{ currentPost?.comments_count || 0 }})</h3>
          <button @click="showCommentModal = false" class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X :size="24" />
          </button>
        </div>

        <!-- Comments List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="comments.length === 0" class="text-center py-10 text-gray-400 text-sm">
            暂无评论，快来抢沙发吧~
          </div>
          <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
            <img :src="comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.username}`" class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-gray-500">{{ comment.author?.nickname || comment.author?.username }}</span>
                <span class="text-[10px] text-gray-400">{{ new Date(comment.created_at).toLocaleDateString() }}</span>
              </div>
              <p class="text-sm text-gray-800 mt-0.5">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-gray-100 bg-white pb-safe">
          <div class="flex items-center space-x-2">
            <input 
              v-model="newComment"
              type="text" 
              placeholder="说点什么..." 
              class="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-all"
              @keyup.enter="submitComment"
            />
            <button 
              @click="submitComment"
              :disabled="!newComment.trim() || submittingComment"
              class="p-2.5 bg-[#FF6B35] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-100"
            >
              <Send :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pt-safe {
  padding-top: max(env(safe-area-inset-top), 20px);
}
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
}
</style>
