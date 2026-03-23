import { defineStore } from 'pinia';
import api from '../lib/axios';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPosts(type?: string) {
      this.loading = true;
      try {
        const response = await api.get('/posts', { params: { type } });
        this.posts = response.data;
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch posts';
      } finally {
        this.loading = false;
      }
    },
    async createPost(postData: any) {
      try {
        const response = await api.post('/posts', postData);
        this.posts.unshift(response.data);
      } catch (err: any) {
        throw err;
      }
    },
    async toggleLike(postId: number) {
      const post = this.posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update
      const oldLiked = post.liked;
      const oldLikes = post.likes;
      
      post.liked = !post.liked;
      post.likes = post.liked ? (post.likes || 0) + 1 : (post.likes || 0) - 1;

      try {
        await api.post(`/posts/${postId}/like`);
      } catch (err) {
        // Revert
        post.liked = oldLiked;
        post.likes = oldLikes;
        throw err;
      }
    },
    async addComment(postId: number, content: string) {
      try {
        const response = await api.post(`/posts/${postId}/comments`, { content });
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments_count = (post.comments_count || 0) + 1;
        }
        return response.data;
      } catch (err) {
        throw err;
      }
    }
  },
});
