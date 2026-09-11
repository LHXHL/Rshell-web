<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import './LoadingCss.css'

const { t } = useI18n()
const props = defineProps({
  message: {
    type: String,
    default: ''
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
      <div class="message">{{ props.message || t('common.loading') }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>