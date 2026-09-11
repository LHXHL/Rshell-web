<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import './LoadingCss.css'

const props = defineProps({
  message: {
    type: String,
    default() {
      return t('common.loading')
    }
  }
})
</script>

<template>
  <div class="easy-loading">
    <div class="content-loading">
      <div class="loading">
        <div class="dot white"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="message">{{ props.message }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>