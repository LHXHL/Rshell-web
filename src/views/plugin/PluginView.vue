<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Upload, MagicStick, Cpu, Connection, Tools, Platform } from '@element-plus/icons-vue'
import { getPluginList, addPlugin, deletePlugin } from '@/api/plugin'

const pluginList = ref([])
const loading = ref(false)
const uploadDialogVisible = ref(false)

const newPlugin = ref({
  name: '',
  os: 'windows',
  type: 'execute-assembly',
  file: null as File | null
})

const fileInputRef = ref<HTMLInputElement | null>(null)

const fetchPlugins = async () => {
  loading.value = true
  try {
    const res = await getPluginList()
    if (res.data.status === 200) {
      pluginList.value = res.data.data || []
    } else {
      ElMessage.error(t('plugin.loadFailed'))
    }
  } catch (error) {
    ElMessage.error(t('common.fetchError'))
  } finally {
    loading.value = false
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    newPlugin.value.file = target.files[0]
  }
}

const handleUploadPlugin = async () => {
  if (!newPlugin.value.name) {
    ElMessage.warning(t('plugin.nameRequired'))
    return
  }
  if (!newPlugin.value.file) {
    ElMessage.warning(t('common.selectFile'))
    return
  }
  try {
    const res = await addPlugin(newPlugin.value)
    if (res.data.status === 200) {
      ElMessage.success(t('plugin.added'))
      uploadDialogVisible.value = false
      resetNewPlugin()
      fetchPlugins()
    } else {
      ElMessage.error(res.data.data || t('common.addFailed'))
    }
  } catch (error) {
    ElMessage.error(t('common.requestError'))
  }
}

const resetNewPlugin = () => {
  newPlugin.value = {
    name: '',
    os: 'windows',
    type: 'execute-assembly',
    file: null
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(t('plugin.deleteConfirm'), t('common.notice'), { type: 'warning' })
    const res = await deletePlugin({ id })
    if (res.data.status === 200) {
      ElMessage.success(t('common.deleted'))
      fetchPlugins()
    } else {
      ElMessage.error(t('common.deleteFailed'))
    }
  } catch (error) {
    // cancelled
  }
}

onMounted(() => {
  fetchPlugins()
})
</script>

<template>
  <div class="plugin-container">
    <div class="header">
      <h2>{{ t('plugin.title') }}</h2>
      <el-button type="primary" :icon="Plus" @click="uploadDialogVisible = true">
        {{ t('plugin.add') }}
      </el-button>
    </div>

    <el-table :data="pluginList" v-loading="loading" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="Id" label="ID" width="80" />
      <el-table-column prop="Name" :label="t('plugin.name')" />
      <el-table-column prop="Os" :label="t('plugin.platform')" width="120" />
      <el-table-column prop="Type" :label="t('credentials.type')" width="180" />
      <el-table-column prop="FileName" :label="t('plugin.fileName')" />
      <el-table-column :label="t('common.actions')" width="150" align="center">
        <template #default="{ row }">
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row.Id)">
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加插件对话框 -->
    <el-dialog v-model="uploadDialogVisible" :title="t('plugin.add')" width="500px" top="15vh" :append-to-body="true" :lock-scroll="false" @close="resetNewPlugin">
      <el-form label-width="100px" style="min-height: 200px;">
        <el-form-item :label="t('plugin.name')" required>
          <el-input v-model="newPlugin.name" :placeholder="t('plugin.namePh')" />
        </el-form-item>
        <el-form-item :label="t('plugin.os')" required>
          <el-radio-group v-model="newPlugin.os">
            <el-radio label="windows"><span style="color: #606266; font-weight: normal;">Windows</span></el-radio>
            <el-radio label="linux"><span style="color: #606266; font-weight: normal;">Linux</span></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('plugin.execType')" required>
          <el-select v-model="newPlugin.type" :placeholder="t('plugin.execTypePh')" popper-class="plugin-type-dropdown" style="width: 100%" :teleported="true" :append-to-body="true" placement="bottom" fallback-placements="['bottom']">
            <template v-if="newPlugin.os === 'windows'">
              <el-option label="Execute Assembly" value="execute-assembly">
                <div class="mode-option-item">
                  <el-icon class="net-icon"><MagicStick /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Execute Assembly</div>
                    <div class="option-desc">{{ t('plugin.typeAssembly') }}</div>
                  </div>
                </div>
              </el-option>
              <el-option label="Inline Binary" value="inline-bin">
                <div class="mode-option-item">
                  <el-icon class="native-icon"><Cpu /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Inline Binary</div>
                    <div class="option-desc">{{ t('plugin.typeBin') }}</div>
                  </div>
                </div>
              </el-option>
              <el-option label="Shellcode Inject" value="shellcode-inject">
                <div class="mode-option-item">
                  <el-icon class="inject-icon"><Connection /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Shellcode Inject</div>
                    <div class="option-desc">{{ t('plugin.typeShellcode') }}</div>
                  </div>
                </div>
              </el-option>
              <el-option label="Inline Execute" value="inline-execute">
                <div class="mode-option-item">
                  <el-icon class="bof-icon"><Tools /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Inline Execute</div>
                    <div class="option-desc">{{ t('plugin.typeBof') }}</div>
                  </div>
                </div>
              </el-option>
            </template>
            <template v-if="newPlugin.os === 'linux'">
              <el-option label="Script (Shell)" value="script">
                <div class="mode-option-item">
                  <el-icon class="linux-icon"><Platform /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Script (Shell)</div>
                    <div class="option-desc">{{ t('plugin.typeShell') }}</div>
                  </div>
                </div>
              </el-option>
              <el-option label="Binary (Memory)" value="binary">
                <div class="mode-option-item">
                  <el-icon class="native-icon"><Cpu /></el-icon>
                  <div class="option-details">
                    <div class="option-label">Binary (Memory)</div>
                    <div class="option-desc">{{ t('plugin.typeElf') }}</div>
                  </div>
                </div>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('plugin.file')" required>
          <div class="file-upload">
            <input type="file" ref="fileInputRef" @change="handleFileChange" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleUploadPlugin">{{ t('plugin.confirmUpload') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style>
/* 针对下拉弹窗的全局样式优化 */
.plugin-type-dropdown .el-select-dropdown__item {
  height: auto !important;
  padding: 6px 20px !important;
}
</style>
<style scoped>
.plugin-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 修复单选框字体颜色问题 */
:deep(.el-radio .el-radio__label) {
  color: var(--el-text-color-regular);
}

/* 下拉框选项美化样式 */
.mode-option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.mode-option-item .el-icon {
  font-size: 20px;
}

.net-icon {
  color: #a8b2c1;
}

.native-icon {
  color: #409eff;
}

.inject-icon {
  color: #f56c6c;
}

.bof-icon {
  color: #36cfc9;
}

.linux-icon {
  color: #e6a23c;
}

.option-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  font-weight: 600;
  color: #2c3e50;
  line-height: normal;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
