<script setup lang="ts">
import {ElConfigProvider} from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import {ref, computed, nextTick, provide, onMounted} from "vue";//要引入方法
import { useThemeStore } from '@/stores/theme'
import i18n from '@/i18n'

// Element Plus 组件文案跟随应用语言
const elementLocale = computed(() =>
  i18n.global.locale.value.startsWith('zh') ? zhCn : en
);

// 局部组件刷新
const isRouterAlive = ref(true);
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};
provide("reload", reload);

// 初始化主题
const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <RouterView v-if="isRouterAlive"/>
  </el-config-provider>

</template>

<style>
:root {
  --theme-primary: #4a90e2;
  --theme-light: #e6f1ff;
  --theme-dark: #357abd;
  --theme-gradient: linear-gradient(135deg, #e6f1ff 0%, #cde3ff 100%);
}
</style>

<style scoped>
</style>
