<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased pb-24">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* iOS-like transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Hide scrollbar but allow scrolling */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Safe area support */
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
}
</style>
