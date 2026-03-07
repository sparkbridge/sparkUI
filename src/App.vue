<template>
  <GlobalNotice />

  <router-view></router-view>
</template>

<script setup>
import GlobalNotice from './components/GlobalNotice.vue';
</script>
<style>
/* 全局基础样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: sans-serif;
}
</style>