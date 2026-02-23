<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Sidebar（商業邏輯層） -->
    <AppSidebar />

    <!-- Main: Header + 頁面內容 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';
</script>
