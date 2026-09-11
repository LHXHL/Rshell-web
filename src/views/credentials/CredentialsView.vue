<template>
  <div class="credentials-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ t('credentials.title') }}</span>
          <el-button type="primary" size="small" @click="fetchData">
            <el-icon><Refresh /></el-icon>
            {{ t('common.refresh') }}
          </el-button>
        </div>
      </template>
      <el-table :data="credentials" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="uid" :label="t('credentials.client')" width="180" />
        <el-table-column prop="target" :label="t('credentials.target')" min-width="120" />
        <el-table-column prop="username" :label="t('credentials.username')" min-width="120" />
        <el-table-column prop="secret" :label="t('credentials.secret')" min-width="180">
          <template #default="{ row }">
            <el-tag type="danger" style="font-family: monospace">{{ row.secret }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cred_type" :label="t('credentials.type')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'warning' : row.cred_type === 'hash' ? 'danger' : 'info'" size="small">
              {{ row.cred_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" :label="t('credentials.source')" width="100" />
        <el-table-column prop="notes" :label="t('credentials.notes')" min-width="120" />
        <el-table-column prop="created_at" :label="t('credentials.time')" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at * 1000).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import CredentialsAPI from '@/api/credentials'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const credentials = ref<any[]>([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await CredentialsAPI.list()
    if (res.data.status === 200) {
      credentials.value = res.data.data || []
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(t('credentials.deleteConfirm'), t('common.notice'))
    const res = await CredentialsAPI.delete(row.id)
    if (res.data.status === 200) {
      ElMessage.success(t('common.deleted'))
      await fetchData()
    }
  } catch {
    // cancelled
  }
}

onMounted(fetchData)
</script>

<style scoped>
.credentials-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
