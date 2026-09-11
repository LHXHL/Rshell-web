<template>
  <div class="enhanced-terminal-container">

    <!-- 主终端区域 -->
    <div class="main-terminal-area">
      <!-- 终端输出区域 -->
      <div class="terminal-output-container">
        <div class="output-header">
          <div class="output-title">
            <el-icon><Promotion /></el-icon>
            <span>{{ t('shell.output') }}</span>
          </div>
        </div>

        <div class="output-content" ref="outputRef">
          <div class="command-history" v-if="ShellStr">
<!--            <pre class="terminal-output">{{ ShellStr }}</pre>-->
            <pre
                class="terminal-output"
                v-html="ShellHtml"
            ></pre>
          </div>

          <div class="empty-output" v-else>
            <el-empty :description="t('shell.emptyOutput')" />
          </div>
        </div>
      </div>

      <!-- 命令输入区域 -->
      <div class="command-input-container">

        <div class="input-wrapper">
          <el-input
              v-model="command"
              class="enhanced-command-input"
              :placeholder="t('shell.inputPh')"
              @keyup.enter="sendCommand"
              @keydown.up.prevent="prevCommand"
              @keydown.down.prevent="nextCommand"
              ref="inputRef"
              :spellcheck="false"
              size="large"
          >
            <template #prefix>
              <el-icon><Promotion /></el-icon>
            </template>
            <template #append>
              <el-button
                  type="primary"
                  @click="sendCommand"
                  :loading="isExecuting"
                  :disabled="!command.trim()"
              >
                {{ t('shell.execute') }}
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="input-hints">
          <span class="hint-text">{{ t('shell.shortcuts') }}</span>
        </div>
        <!-- 添加的按钮区域 -->
        <div class="action-buttons">
          <el-tooltip :content="t('shell.winMemExec')" placement="top">
            <el-button
                type="primary"
                @click="dialogVisible = true"
                size="default"
                class="action-button"
            >
              <el-icon><MagicStick /></el-icon>
              {{ t('shell.winMemExec') }}
            </el-button>
          </el-tooltip>

          <el-tooltip :content="t('shell.linuxExec')" placement="top">
            <el-button
                type="warning"
                @click="linuxScriptDialogVisible = true"
                size="default"
                class="action-button"
            >
            <el-icon><Platform /></el-icon>
              {{ t('shell.linuxExec') }}
            </el-button>
          </el-tooltip>

          <el-tooltip :content="t('shell.openTerm')" placement="top">
            <el-button
                type="success"
                @click="openInteractiveTerminal"
                size="default"
                class="action-button"
            >
              <el-icon><Monitor /></el-icon>
              {{ t('cside.termTitle') }}
            </el-button>
          </el-tooltip>

          <el-tooltip :content="t('shell.pluginExec')" placement="top">
            <el-button
                type="danger"
                @click="openPluginDialog"
                size="default"
                class="action-button"
            >
              <el-icon><MagicStick /></el-icon>
              {{ t('shell.pluginExec') }}
            </el-button>
          </el-tooltip>

          <el-tooltip :content="t('cside.sensTitle')" placement="top">
            <el-button
                type="info"
                @click="sensitiveDialogVisible = true"
                size="default"
                class="action-button"
            >
              <el-icon><Search /></el-icon>
              {{ t('cside.sensTitle') }}
            </el-button>
          </el-tooltip>

        </div>

        <!-- Windows 后渗透区域 -->
        <div class="post-exploitation-box">
          <div class="post-box-label">{{ t('shell.winPostExploit') }}</div>
          <div class="post-box-buttons">
            <el-tooltip :content="t('shell.privesc')" placement="top">
              <el-button type="danger" size="default" class="action-button" :loading="postLoading" @click="executeGetSystem">
                <el-icon><Top /></el-icon>
                Getsystem
              </el-button>
            </el-tooltip>

            <el-tooltip :content="t('shell.lsass')" placement="top">
              <el-button type="warning" size="default" class="action-button" :loading="postLoading" @click="executeMimikatz">
                <el-icon><Key /></el-icon>
                {{ t('shell.lsass') }}
              </el-button>
            </el-tooltip>

          </div>
        </div>
      </div>

    </div>

    <!-- 美化后的内存执行对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="t('shell.memExec')"
        width="520px"
        :before-close="handleClose"
        class="enhanced-memory-dialog"
        center
    >
      <template #header>
        <div class="dialog-title">
          <el-icon class="dialog-icon"><MagicStick /></el-icon>
          <span>{{ t('shell.winMemExec') }}</span>
        </div>
      </template>

      <div class="dialog-content">
        <!-- 执行模式选择 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Setting /></el-icon>
            <span>{{ t('shell.execMode') }}</span>
          </div>
          <el-select
              v-model="executionMode"
              :placeholder="t('shell.pickMode')"
              class="mode-selector"
              size="large"
              filterable
              popper-class="plugin-type-dropdown"
              :teleported="true"
              :append-to-body="true"
              placement="bottom"
              fallback-placements="['bottom']"
          >
            <el-option
                v-for="item in modeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
              <div class="mode-option-item">
                <el-icon :class="item.iconClass"><component :is="item.icon" /></el-icon>
                <div class="option-details">
                  <div class="option-label">{{ item.label }}</div>
                  <div class="option-desc">{{ item.description }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 文件选择区域 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Document /></el-icon>
            <span>{{ t('shell.execFile') }}</span>
          </div>
          <div
              class="file-upload-card"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
              :class="{ 'has-file': selectedFile }"
          >
            <div class="upload-placeholder" v-if="!selectedFile">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <p class="upload-title">{{ t('shell.dropFile') }}</p>
                <p class="upload-subtitle">{{ t('shell.supportedFormats') }}</p>
              </div>
            </div>
            <div class="file-selected" v-else>
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-details">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-info">
                  <el-tag size="small" type="info">
                    <el-icon><Document /></el-icon>
                    {{ formatFileSize(selectedFile.size) }}
                  </el-tag>
                  <el-tag size="small" type="success">
                    <el-icon><Timer /></el-icon>
                    {{ new Date(selectedFile.lastModified).toLocaleDateString() }}
                  </el-tag>
                </div>
              </div>
              <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeFile"
                  :icon="Delete"
              />
            </div>
            <input
                type="file"
                ref="fileInputRef"
                @change="handleFileChange"
                style="display: none;"
            />
          </div>
        </div>

        <!-- 参数输入 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><EditPen /></el-icon>
            <span>{{ t('shell.runArgs') }}</span>
          </div>
          <el-input
              v-model="inputParams"
              :placeholder="t('shell.argsPh')"
              type="textarea"
              :rows="2"
              clearable
              class="params-input"
              :autosize="{ minRows: 2, maxRows: 4 }"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 执行预览 -->
        <div class="dialog-section" v-if="selectedFile || inputParams || executionMode">
          <div class="section-label">
            <el-icon><View /></el-icon>
            <span>{{ t('shell.preview') }}</span>
          </div>
          <div class="preview-card">
            <div class="preview-item" v-if="selectedFile">
              <el-icon class="preview-icon"><Document /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ t('files.colName') }}</div>
                <div class="preview-value">{{ selectedFile.name }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="executionMode">
              <el-icon class="preview-icon"><Setting /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ t('shell.execMode') }}</div>
                <div class="preview-value">{{ getModeLabel(executionMode) }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="inputParams">
              <el-icon class="preview-icon"><Key /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ t('shell.argsLabel') }}</div>
                <div class="preview-value">{{ inputParams || t('shell.none') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose" :disabled="isExecuting">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="handleExecute"
              :disabled="!selectedFile || isExecuting"
              :loading="isExecuting"
              class="execute-button"
          >
            <el-icon><MagicStick /></el-icon>
            {{ t('shell.confirmExec') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Linux执行对话框 -->
    <el-dialog
        v-model="linuxScriptDialogVisible"
        :title="t('shell.linuxExec')"
        width="520px"
        :before-close="handleLinuxScriptClose"
        class="enhanced-memory-dialog"
        center
    >
      <template #header>
        <div class="dialog-title">
          <el-icon class="dialog-icon"><Platform /></el-icon>
          <span>{{ t('shell.linuxExec') }}</span>
        </div>
      </template>

      <div class="dialog-content">
        <!-- 执行模式选择 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Setting /></el-icon>
            <span>{{ t('shell.execMode') }}</span>
          </div>
          <el-select
              v-model="linuxExecutionMode"
              :placeholder="t('shell.pickMode')"
              class="mode-selector"
              size="large"
              filterable
              popper-class="plugin-type-dropdown"
              :teleported="true"
              :append-to-body="true"
              placement="bottom"
              fallback-placements="['bottom']"
          >
            <el-option
                v-for="item in linuxModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
              <div class="mode-option-item">
                <el-icon :class="item.iconClass"><component :is="item.icon" /></el-icon>
                <div class="option-details">
                  <div class="option-label">{{ item.label }}</div>
                  <div class="option-desc">{{ item.description }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 文件选择 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Document /></el-icon>
            <span>{{ linuxExecutionMode === 'binary' ? t('shell.binaryFile') : t('shell.scriptFile') }}</span>
          </div>
          <div
              class="file-upload-card"
              @click="triggerLinuxScriptInput"
              @dragover.prevent
              @drop.prevent="handleLinuxScriptDrop"
              :class="{ 'has-file': linuxScriptFile }"
          >
            <div class="upload-placeholder" v-if="!linuxScriptFile">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <p class="upload-title">{{ linuxExecutionMode === 'binary' ? t('shell.dropBinary') : t('shell.dropScript') }}</p>
                <p class="upload-subtitle">{{ linuxExecutionMode === 'binary' ? t('shell.elfOnly') : t('shell.shOnly') }}</p>
              </div>
            </div>
            <div class="file-selected" v-else>
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-details">
                <div class="file-name">{{ linuxScriptFile.name }}</div>
                <div class="file-info">
                  <el-tag size="small" type="info">
                    <el-icon><Document /></el-icon>
                    {{ formatFileSize(linuxScriptFile.size) }}
                  </el-tag>
                  <el-tag size="small" type="success">
                    <el-icon><Timer /></el-icon>
                    {{ new Date(linuxScriptFile.lastModified).toLocaleDateString() }}
                  </el-tag>
                </div>
              </div>
              <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeLinuxScript"
                  :icon="Delete"
              />
            </div>
            <input
                type="file"
                ref="linuxScriptInputRef"
                @change="handleLinuxScriptChange"
                style="display: none;"
            />
          </div>
        </div>

        <!-- 脚本参数输入 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><EditPen /></el-icon>
            <span>{{ t('shell.scriptArgs') }}</span>
          </div>
          <el-input
              v-model="linuxScriptArgs"
              :placeholder="t('shell.argsPh')"
              type="textarea"
              :rows="2"
              clearable
              class="params-input"
              :autosize="{ minRows: 2, maxRows: 4 }"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 执行预览 -->
        <div class="dialog-section" v-if="linuxScriptFile || linuxScriptArgs || linuxExecutionMode">
          <div class="section-label">
            <el-icon><View /></el-icon>
            <span>{{ t('shell.preview') }}</span>
          </div>
          <div class="preview-card">
            <div class="preview-item">
              <el-icon class="preview-icon"><Setting /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ t('shell.execMode') }}</div>
                <div class="preview-value">{{ linuxExecutionMode === 'binary' ? 'Memory Execute' : 'Bash Script' }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="linuxScriptFile">
              <el-icon class="preview-icon"><Document /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ linuxExecutionMode === 'binary' ? t('files.colName') : t('shell.scriptFile') }}</div>
                <div class="preview-value">{{ linuxScriptFile.name }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="linuxScriptArgs">
              <el-icon class="preview-icon"><Key /></el-icon>
              <div class="preview-content">
                <div class="preview-label">{{ t('shell.argsLabel') }}</div>
                <div class="preview-value">{{ linuxScriptArgs || t('shell.none') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleLinuxScriptClose" :disabled="isExecuting">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="handleLinuxScriptExecute"
              :disabled="!linuxScriptFile || isExecuting"
              :loading="isExecuting"
              class="execute-button"
          >
            <el-icon><MagicStick /></el-icon>
            {{ t('shell.confirmExec') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 敏感信息搜索对话框 -->
    <el-dialog
        v-model="sensitiveDialogVisible"
        :title="t('cside.sensTitle')"
        width="520px"
        :before-close="handleSensitiveClose"
        class="enhanced-memory-dialog"
        center
    >
      <template #header>
        <div class="dialog-title">
          <el-icon class="dialog-icon"><Search /></el-icon>
          <span>{{ t('cside.sensTitle') }}</span>
        </div>
      </template>

      <div class="dialog-content">
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><FolderOpened /></el-icon>
            <span>{{ t('shell.searchPath') }}</span>
          </div>
          <el-input
              v-model="sensitivePath"
              :placeholder="t('shell.searchPathPh')"
              clearable
              class="params-input"
              size="large"
          >
            <template #prefix>
              <el-icon><FolderOpened /></el-icon>
            </template>
          </el-input>
          <div class="sensitive-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ t('shell.searchPathHint') }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleSensitiveClose" :disabled="isExecuting">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="handleSensitiveExecute"
              :disabled="!sensitivePath.trim() || isExecuting"
              :loading="isExecuting"
              class="execute-button"
          >
            <el-icon><Search /></el-icon>
            {{ t('shell.startSearch') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
        v-model="interactiveDialogVisible"
        :title="t('cside.termTitle')"
        width="90%"
        :fullscreen="isFullscreen"
        class="interactive-terminal-dialog"
        :destroy-on-close="true"
    >
      <template #header>
        <div class="dialog-title">
          <div class="title-left">
            <el-icon class="dialog-icon"><Monitor /></el-icon>
            <div class="title-content">
              <h3 class="title-text">{{ t('cside.termTitle') }}</h3>
              <div class="title-subtext">
                <el-tag size="small" type="primary" effect="plain" v-if="terminalStatus.connected">
                  <el-icon><Connection /></el-icon>
                  {{ t('shell.liveConn') }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="dialog-actions">
            <el-tooltip :content="isFullscreen ? t('shell.exitFullscreen') : t('shell.fullscreen')" placement="bottom">
              <el-button
                  type="primary"
                  circle
                  size="small"
                  @click="toggleFullscreen"
                  :icon="isFullscreen ? Fold : Expand"
              />
            </el-tooltip>
            <el-tooltip :content="t('shell.disconnect')" placement="bottom">
              <el-button
                  type="danger"
                  circle
                  size="small"
                  @click="disconnectTerminal"
                  :icon="SwitchButton"
              />
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="terminal-controls">
      </div>

      <!-- 终端容器 -->
      <div class="terminal-wrapper" ref="terminalRef" style="color: #ffffff !important;">
        <!-- Xterm.js终端将在这里渲染 -->
      </div>

      <template #footer>
        <div class="terminal-status-bar">
          <div class="status-left">
            <div class="status-indicator" :class="terminalStatus.connected ? 'connected' : 'disconnected'">
              <div class="status-dot"></div>
              <span class="status-text">{{ terminalStatus.text }}</span>
            </div>
          </div>
          <div class="status-right">
            <el-tag size="small" type="info" effect="plain">
              <el-icon><Clock /></el-icon>
              {{ t('shell.connDuration') }} {{ connectionDuration }}
            </el-tag>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 插件调用对话框 -->
    <el-dialog v-model="pluginDialogVisible" :title="t('shell.pluginExec')" top="15vh" width="500px" center :append-to-body="true" :lock-scroll="false">
      <el-form label-width="100px" style="min-height: 180px;">
        <el-form-item :label="t('shell.pickOs')">
          <el-radio-group v-model="pluginQuery.os" @change="fetchAvailablePlugins">
            <el-radio label="windows"><span style="color: #606266; font-weight: normal;">Windows</span></el-radio>
            <el-radio label="linux"><span style="color: #606266; font-weight: normal;">Linux</span></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('shell.pickPlugin')">
          <el-select v-model="pluginQuery.pluginId" :placeholder="t('shell.pickPluginPh')" style="width:100%" :teleported="true" :append-to-body="true" placement="bottom" fallback-placements="['bottom']">
            <el-option
              v-for="item in filteredPlugins"
              :key="item.Id"
              :label="item.Name + ' (' + item.Type + ')'"
              :value="item.Id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('shell.execArgs')">
          <el-input v-model="pluginQuery.args" :placeholder="t('shell.pluginArgsPh')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="pluginDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleExecutePlugin">{{ t('shell.bgExec') }}</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import { getPluginList, executePlugin } from '@/api/plugin'
import { useRoute } from "vue-router"
import { useCommandHistoryStore } from '@/stores/shellcommand'
import {
  Monitor,
  User,
  Delete,
  MagicStick,
  Clock,
  Promotion,
  Histogram,
  Setting,
  Document,
  Upload,
  EditPen,
  View,
  Timer,
  Key,
  CopyDocument,
  Refresh,
  FullScreen,
  SwitchButton,
  DocumentCopy,
  Link,
  DataLine,
  Expand,           // 用于全屏图标
  Fold,             // 用于退出全屏图标
  Sort,              // 用于字体大小图标
  Search,
  FolderOpened,
  InfoFilled,
  Platform
} from '@element-plus/icons-vue'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import 'xterm/css/xterm.css'
import { v4 as uuidv4 } from 'uuid'
import request from "@/utils/request";
import AnsiToHtml from 'ansi-to-html'

const ansiConverter = new AnsiToHtml({
  fg: '#ffffff',
  bg: '#1e1e1e',
  newline: true,
  escapeXML: true
})

// 性能优化：缓存ANSI转换结果
let lastShellStr = ''
let cachedShellHtml = ''

const ShellHtml = computed(() => {
  const currentStr = ShellStr.value || ''
  // 如果Shell内容未变化，使用缓存避免重复转换
  if (currentStr === lastShellStr) {
    return cachedShellHtml
  }
  // 只有当内容改变时才进行转换
  lastShellStr = currentStr
  cachedShellHtml = ansiConverter.toHtml(currentStr)
  return cachedShellHtml
})


const sessionId = ref('')
const commandHistory = useCommandHistoryStore();
const route = useRoute()

const command = ref('')
const ShellStr = ref('')
const ShellStrTmp = ref('')
const lastCommand = ref('')
const isExecuting = ref(false)
const uid = String(route.query.uid);
const outputRef = ref(null)
const inputRef = ref(null)
// 性能优化：定义轮询interval的引用，方便清理
const shellContentIntervalId = ref(null)

// Dialog 相关
const dialogVisible = ref(false)
const fileInputRef = ref(null)
const selectedFile = ref(null)
const inputParams = ref('')
const executionMode = ref('execute-assembly')

// Linux脚本执行对话框相关
const linuxScriptDialogVisible = ref(false)
const linuxScriptInputRef = ref(null)
const linuxScriptFile = ref(null)
const linuxScriptArgs = ref('')
const linuxExecutionMode = ref('script')

// 敏感信息搜索相关
const sensitiveDialogVisible = ref(false)
const sensitivePath = ref('')

// 插件调用相关
const pluginDialogVisible = ref(false)
const allPlugins = ref([])
const filteredPlugins = ref([])
const pluginQuery = ref({
  os: 'windows',
  pluginId: null,
  args: ''
})

// Windows 后渗透相关
const postLoading = ref(false)
const sendPostCommand = async (command) => {
  postLoading.value = true
  try {
    const res = await ClientAPI.send_commands({ uid: route.query.uid, command })
    if (res.data.status === 200) {
      ElMessage.success(t('shell.cmdSent', { cmd: command }))
    } else {
      ElMessage.warning(res.data.msg || t('shell.cmdSendFailed'))
    }
  } catch {
    ElMessage.error(t('shell.cmdSendFailed'))
  } finally {
    postLoading.value = false
  }
}

const executeGetSystem = () => sendPostCommand('getsystem')
const executeMimikatz = () => sendPostCommand('mimikatz')

const fetchAvailablePlugins = async () => {
  pluginQuery.value.pluginId = null
  try {
    const res = await getPluginList()
    if (res.data.status === 200) {
      allPlugins.value = res.data.data || []
      filteredPlugins.value = allPlugins.value.filter(p => p.Os === pluginQuery.value.os)
    }
  } catch (e) {
    console.error("加载插件失败", e)
  }
}

const openPluginDialog = () => {
  pluginDialogVisible.value = true
  fetchAvailablePlugins()
}

const handleExecutePlugin = async () => {
  if (!pluginQuery.value.pluginId) {
    ElMessage.warning(t('shell.pickPluginFirst'))
    return
  }
  isExecuting.value = true
  try {
    const res = await executePlugin({
      id: pluginQuery.value.pluginId,
      uid: String(route.query.uid),
      args: pluginQuery.value.args
    })
    if (res.data.status === 200) {
      ElMessage.success(t('shell.pluginExecOk'))
      pluginDialogVisible.value = false
    } else {
      ElMessage.error(res.data.data || t('shell.execFailed'))
    }
  } catch (error) {
    ElMessage.error(t('common.requestError'))
  } finally {
    isExecuting.value = false
  }
}

// 扁平化后的模式选项
const modeOptions = computed(() => [
  {
    value: 'execute-assembly',
    label: 'Execute Assembly',
    description: t('plugin.typeAssembly'),
    icon: 'MagicStick',
    iconClass: 'net-icon'
  },
  {
    value: 'inline-bin',
    label: 'Inline Binary',
    description: t('plugin.typeBin'),
    icon: 'Cpu',
    iconClass: 'native-icon'
  },
  {
    value: 'shellcode-inject',
    label: 'Shellcode Inject',
    description: t('plugin.typeShellcode'),
    icon: 'Connection',
    iconClass: 'inject-icon'
  },
  {
    value: 'inline-execute',
    label: 'Inline Execute',
    description: t('plugin.typeBof'),
    icon: 'Tools',
    iconClass: 'bof-icon'
  }
])

// Linux执行模式选项
const linuxModeOptions = computed(() => [
  {
    value: 'script',
    label: 'Bash Script',
    description: t('plugin.typeShell'),
    icon: 'Platform',
    iconClass: 'linux-icon'
  },
  {
    value: 'binary',
    label: 'Memory Execute',
    description: t('plugin.typeElf'),
    icon: 'Cpu',
    iconClass: 'native-icon'
  }
])

// 清屏函数
const clearOutput = () => {
  ShellStr.value = ''
  lastCommand.value = ''
  ElMessage.success(t('shell.cleared'))
}

// 保持您原来的所有函数不变
const sendCommand = async () => {
  if (command.value.trim() === '') return

  const currentCommand = command.value.trim()
  lastCommand.value = currentCommand
  command.value = ''
  commandHistory.addCommand(uid, currentCommand)
  commandHistory.clearCurrentIndex(uid)
  isExecuting.value = true

  try {
    const res = await ClientAPI.send_commands({ uid: uid, command: currentCommand })
    ShellStrTmp.value = res.data.data
    if (ShellStr.value !== ShellStrTmp.value) {
      ShellStr.value = ShellStrTmp.value
      await nextTick()
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    }
    // ElMessage.warning('命令执行中')
  } catch (error) {
    ElMessage.error(t('shell.execFailed'))
  } finally {
    isExecuting.value = false
  }
}

const prevCommand = () => {
  const prevCmd = commandHistory.getPrevCommand(uid);
  if (prevCmd !== undefined) {
    command.value = prevCmd;
  }
}

const nextCommand = () => {
  const nextCmd = commandHistory.getNextCommand(uid);
  if (nextCmd !== undefined) {
    command.value = nextCmd;
  }
};

function GetShellContent() {
  ClientAPI.get_shellcontent({ uid: uid }).then((res) => {
    ShellStrTmp.value = res.data.data
    if (ShellStr.value !== ShellStrTmp.value) {
      let newContent = ShellStrTmp.value
      
      // 性能优化：限制缓存大小
      // 如果输出超过50KB，只保留最后的50KB内容
      const MAX_CACHE_SIZE = 50 * 1024 // 50KB
      if (newContent && newContent.length > MAX_CACHE_SIZE) {
        const truncatedLength = newContent.length - MAX_CACHE_SIZE
        newContent = newContent.substring(truncatedLength)
        // 移除可能被截断的不完整行首
        const firstNewline = newContent.indexOf('\n')
        if (firstNewline !== -1) {
          newContent = newContent.substring(firstNewline + 1)
        }
      }
      
      ShellStr.value = newContent
      nextTick(() => {
        if (outputRef.value) {
          outputRef.value.scrollTop = outputRef.value.scrollHeight
        }
      })
    }
  })
}

const getModeLabel = (value) => {
  const mode = modeOptions.value.find(m => m.value === value)
  return mode ? mode.label : value
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleDrop = (event) => {
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleExecute = async () => {
  if (!selectedFile.value) {
    ElMessage.warning(t('shell.pickFileFirst'))
    return
  }

  isExecuting.value = true
  try {
    const params = inputParams.value.trim()
    const mode = executionMode.value

    const res = await ClientAPI.ExecuteBin({ uid: uid, mode: mode, file: selectedFile.value, args: params })
    if (res.data.status === 200) {
      ElMessage.success(t("shell.bgExecOk"))
      dialogVisible.value = false
      resetDialog()
    } else {
      ElMessage.error(res.data.data)
    }
  } catch (error) {
    console.error('执行过程中出错:', error)
    ElMessage.error(t('shell.execFailedWith', { msg: error.message || t('shell.unknownErr') }))
  } finally {
    isExecuting.value = false
  }
}

const handleClose = () => {
  if (isExecuting.value) {
    ElMessage.warning(t('shell.waitCurrent'))
    return
  }

  if (selectedFile.value || inputParams.value) {
    ElMessageBox.confirm(
        t('shell.closeClearConfirm'),
        t('common.notice'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
    ).then(() => {
      dialogVisible.value = false
      resetDialog()
    })
  } else {
    dialogVisible.value = false
  }
}

const resetDialog = () => {
  selectedFile.value = null
  inputParams.value = ''
  executionMode.value = 'execute-assembly'
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Linux脚本执行相关函数
const triggerLinuxScriptInput = () => {
  if (linuxScriptInputRef.value) {
    linuxScriptInputRef.value.click()
  }
}

const handleLinuxScriptChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    linuxScriptFile.value = files[0]
  }
}

const handleLinuxScriptDrop = (event) => {
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    linuxScriptFile.value = files[0]
  }
}

const removeLinuxScript = () => {
  linuxScriptFile.value = null
  if (linuxScriptInputRef.value) {
    linuxScriptInputRef.value.value = ''
  }
}

const handleLinuxScriptClose = () => {
  if (isExecuting.value) {
    ElMessage.warning(t('shell.waitCurrent'))
    return
  }

  if (linuxScriptFile.value || linuxScriptArgs.value) {
    ElMessageBox.confirm(
        t('shell.closeClearConfirm'),
        t('common.notice'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
    ).then(() => {
      linuxScriptDialogVisible.value = false
      resetLinuxScriptDialog()
    })
  } else {
    linuxScriptDialogVisible.value = false
  }
}

const resetLinuxScriptDialog = () => {
  linuxScriptFile.value = null
  linuxScriptArgs.value = ''
  linuxExecutionMode.value = 'script'
  if (linuxScriptInputRef.value) {
    linuxScriptInputRef.value.value = ''
  }
}

const handleLinuxScriptExecute = async () => {
  if (!linuxScriptFile.value) {
    ElMessage.warning(t('shell.pickFileFirst'))
    return
  }

  isExecuting.value = true
  try {
    const args = linuxScriptArgs.value.trim()
    const mode = linuxExecutionMode.value

    let res
    if (mode === 'binary') {
      res = await ClientAPI.ExecuteLinuxBin({ uid: uid, file: linuxScriptFile.value, args: args })
    } else {
      res = await ClientAPI.ExecuteLinuxScript({ uid: uid, file: linuxScriptFile.value, args: args })
    }
    if (res.data.status === 200) {
      ElMessage.success(t("shell.bgExecOk"))
      linuxScriptDialogVisible.value = false
      resetLinuxScriptDialog()
    } else {
      ElMessage.error(res.data.data)
    }
  } catch (error) {
    console.error('执行过程中出错:', error)
    ElMessage.error(t('shell.execFailedWith', { msg: error.message || t('shell.unknownErr') }))
  } finally {
    isExecuting.value = false
  }
}

// 敏感信息搜索相关
const handleSensitiveExecute = async () => {
  const path = sensitivePath.value.trim()
  if (!path) {
    ElMessage.warning(t('shell.searchPathRequired'))
    return
  }

  isExecuting.value = true
  try {
    const res = await ClientAPI.SearchSensitive({ uid: uid, path: path })
    if (res.data.status === 200) {
      ElMessage.success(t("shell.searchStarted"))
      sensitiveDialogVisible.value = false
      sensitivePath.value = ''
    } else {
      ElMessage.error(res.data.data || t('shell.searchStartFailed'))
    }
  } catch (error) {
    console.error('搜索请求出错:', error)
    ElMessage.error(t('shell.searchStartFailedWith', { msg: error.message || t('shell.unknownErr') }))
  } finally {
    isExecuting.value = false
  }
}

const handleSensitiveClose = () => {
  if (isExecuting.value) {
    ElMessage.warning(t('shell.waitCurrent'))
    return
  }
  if (sensitivePath.value) {
    ElMessageBox.confirm(
        t('shell.closeClearPath'),
        t('common.notice'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
    ).then(() => {
      sensitiveDialogVisible.value = false
      sensitivePath.value = ''
    })
  } else {
    sensitiveDialogVisible.value = false
  }
}

const interactiveDialogVisible = ref(false)
const isFullscreen = ref(false)
const terminalRef = ref(null)
const reconnectAttempts = ref(0)
const MAX_RECONNECT_ATTEMPTS = 5
let reconnectTimeout = null
let autoReconnect = true // 是否自动重连

// 3. 新增终端相关变量
let term = null
let fitAddon = null
let ws = null

// 4. 新增终端状态管理
const terminalStatus = ref({
  connected: false,
  text: t('shell.stDisconnected'),
  type: 'info'
})

// 5. 计算WebSocket端点
const wsEndpoint = computed(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  // 包含uid和sessionId
  return `${protocol}//${host}/api/ws/interactive/${uid}/${sessionId.value}`
})

const generateSessionId = () => {
  // 使用更精确的标识：uid + 时间戳 + 随机数
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${uid}_${timestamp}_${random}`
}

// 6. 新增方法
const openInteractiveTerminal = async () => {
  // 重置重连状态
  reconnectAttempts.value = 0
  autoReconnect = true

  // 生成唯一的会话ID
  sessionId.value = generateSessionId()
  interactiveDialogVisible.value = true

  await nextTick()

  try {
    await initializeTerminal()
    await connectWebSocket()
  } catch (error) {
    console.error('打开终端失败:', error)
    ElMessage.error(t('shell.openTermFailed') + ' ' + error.message)
  }
}


const initializeTerminal = () => {
  if (term) {
    term.dispose()
  }

  term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      black: '#000000',
      red: '#ff6b6b',
      green: '#51cf66',
      yellow: '#ffd43b',
      blue: '#74c0fc',
      magenta: '#ff8787',
      cyan: '#69db7c',
      white: '#ffffff',
      brightBlack: '#808080',
      brightRed: '#ff8787',
      brightGreen: '#51cf66',
      brightYellow: '#ffd43b',
      brightBlue: '#74c0fc',
      brightMagenta: '#ff8787',
      brightCyan: '#69db7c',
      brightWhite: '#ffffff'
    }
  })

  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.loadAddon(new WebLinksAddon())

  term.open(terminalRef.value)
  fitAddon.fit()

  // 强制覆盖所有颜色为白色
  if (terminalRef.value) {
    terminalRef.value.style.color = '#ffffff'
    // 遍历所有子元素
    const allElements = terminalRef.value.querySelectorAll('*')
    allElements.forEach((el) => {
      el.style.color = '#ffffff'
    })
  }

  // 处理用户输入
  term.onData(data => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'input', data }))
    }
  })

  term.onResize(({ cols, rows }) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'resize', cols, rows }))
    }
  })
}

// 新增一个获取WebSocket认证token的函数
// 修改getWebSocketAuth函数
const getWebSocketAuth = async () => {
  try {
    const response = await request({
      url: `/ws/auth/${uid}`,
      method: 'GET'
    })
    return response.data
  } catch (error) {
    console.error('获取WebSocket认证失败:', error)
    ElMessage.error(t('shell.authFailed') + ' ' + (error.response?.data?.error || error.message))
    throw error
  }
}
let heartbeatInterval = null
let lastPongTime = null

const startHeartbeat = () => {
  stopHeartbeat()
  lastPongTime = Date.now()

  heartbeatInterval = setInterval(() => {
    // 先检查是否太久没收到响应
    if (Date.now() - lastPongTime > 45000) { // 改为45秒超时（考虑网络延迟）
      console.warn('心跳超时，重新连接', Date.now() - lastPongTime, 'ms')
      if (ws) ws.close()
      return
    }

    // 发送心跳
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'heartbeat' }))
        console.log('发送心跳，等待响应...')
      } catch (e) {
        console.error('发送心跳失败:', e)
      }
    }
  }, 15000) // 改为15秒发送一次心跳（缩短间隔）
}

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}


// 修改连接WebSocket的方法
// 修改connectWebSocket函数
const connectWebSocket = async () => {
  if (ws) {
    ws.close()
  }

  // 清理可能的重连定时器
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  updateTerminalStatus(t('shell.stConnecting'), 'warning')

  try {
    // 1. 先获取WebSocket专用token
    const authResponse = await getWebSocketAuth()
    const wsToken = authResponse.token

    // 2. 使用专用token连接WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    ws = new WebSocket(
        `${protocol}//${host}/api/ws/interactive/${uid}/${sessionId.value}?auth=${encodeURIComponent(wsToken)}`
    )

    // 添加认证响应处理
    let authenticated = false

    ws.onopen = () => {
      updateTerminalStatus(t('shell.stAuthing'), 'warning')
      console.log('WebSocket连接已建立')
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      lastPongTime = Date.now()
      try {
        const data = JSON.parse(event.data)

        // 处理心跳响应
        if (data.type === 'heartbeat_response') {
          return
        }

        // 首先检查认证响应
        if (data.type === 'auth_response') {
          if (data.success) {
            authenticated = true
            updateTerminalStatus(t('shell.stConnected'), 'success')
            console.log('WebSocket认证成功')

            // 重置重连计数
            reconnectAttempts.value = 0

            // 认证成功后发送初始化信息
            const { cols, rows } = term
            ws.send(JSON.stringify({
              type: 'init',
              uid: uid,
              sessionId: sessionId.value,
              cols: cols,
              rows: rows
            }))
          } else {
            console.error('认证失败:', data.message)
            term.writeln(`\x1b[31m✗ ${t('shell.authFailed')}: ${data.message}\x1b[0m`)
            updateTerminalStatus(t('shell.stAuthFailed'), 'danger')
            ws.close()
          }
          return
        }

        // 认证通过后才处理其他消息
        if (!authenticated) {
          console.warn('收到未认证的消息')
          term.writeln(`\x1b[31m✗ ${t('shell.unauthMsg')}\x1b[0m`)
          ws.close()
          return
        }

        switch (data.type) {
          case 'output':
            term.write(data.data)
            break
          case 'error':
            console.error('服务器错误:', data.message)
            term.writeln(`\x1b[31m${t('common.failed')}: ${data.message}\x1b[0m`)
            break
          case 'session_info':
            console.log('会话信息:', data.message)
            term.writeln(`\x1b[33m${data.message}\x1b[0m`)
            break
          default:
            console.log('收到未知类型消息:', data.type)
        }
      } catch (e) {
        // 可能是非JSON的终端输出
        term.write(event.data)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      updateTerminalStatus(t('shell.stConnError'), 'danger')

      if (term) {
        term.writeln(`\x1b[31m✗ ${t('shell.connErrCheckNet')}\x1b[0m`)
      }

      // 立即尝试重连
      scheduleReconnect()
    }

    ws.onclose = (event) => {
      console.log(`WebSocket连接关闭，代码: ${event.code}, 原因: ${event.reason}`)
      updateTerminalStatus(t('shell.stDisconnected'), 'info')

      if (term) {
        term.writeln(`\x1b[33m✗ ${t('shell.reconnecting')}\x1b[0m`)
      }

      stopHeartbeat()

      // 如果不是正常关闭，则尝试重连
      if (interactiveDialogVisible.value && autoReconnect) {
        scheduleReconnect()
      }
    }

    // 设置连接超时
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.warn('WebSocket连接超时')
        term.writeln(`\x1b[31m✗ ${t('shell.stConnTimeout')}\x1b[0m`)
        ws.close()
        updateTerminalStatus(t('shell.stConnTimeout'), 'danger')

        // 超时后也尝试重连
        scheduleReconnect()
      }
    }, 10000)

  } catch (error) {
    console.error('WebSocket连接失败:', error)
    updateTerminalStatus(t('shell.stAuthFailed'), 'danger')

    if (term) {
      term.writeln(`\x1b[31m✗ ${t('shell.authFailedTerm')}\x1b[0m`)
    }

    ElMessage.error(t('shell.termConnFailed') + ' ' + error.message)

    // 连接失败也尝试重连
    scheduleReconnect()
  }
}

const updateTerminalStatus = (text, type) => {
  terminalStatus.value = {
    connected: type === 'success',
    text,
    type
  }
}

const disconnectTerminal = (manual = true) => {
  // 如果是手动关闭，停止自动重连
  if (manual) {
    autoReconnect = false
    reconnectAttempts.value = 0
  }

  // 清理重连定时器
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  stopHeartbeat()

  if (ws) {
    if (ws.readyState === WebSocket.OPEN && manual) {
      // 手动关闭时发送断开消息
      try {
        ws.send(JSON.stringify({
          type: 'close',
          uid: uid,
          sessionId: sessionId.value
        }))
      } catch (e) {
        console.warn('发送关闭消息失败:', e)
      }
    }
    ws.close()
    ws = null
  }

  // 重置状态
  if (manual) {
    if (term) {
      term.dispose()
      term = null
    }
    sessionId.value = ''
    interactiveDialogVisible.value = false
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit(), 100)
    }
  })
}

// 7. 监听对话框关闭
watch(interactiveDialogVisible, (newVal) => {
  if (!newVal && term) {
    disconnectTerminal()
  }
})

// 8. 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // GetShellContent initial call
  GetShellContent();
  // 性能优化：轮询间隔从2000ms增加到5000ms，减少API调用频率
  // 这在虚拟机环境中可以显著减少CPU压力
  shellContentIntervalId.value = setInterval(GetShellContent, 5000);
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disconnectTerminal()
  
  // 清理Shell内容轮询的interval
  if (shellContentIntervalId.value) {
    clearInterval(shellContentIntervalId.value);
    shellContentIntervalId.value = null;
  }
})

const handleResize = () => {
  if (fitAddon) {
    fitAddon.fit()
  }
}
// 添加新的响应式变量
const fontSize = ref(14)
const terminalCols = ref(80)
const terminalRows = ref(24)
const connectionStartTime = ref(null)
const connectionDuration = ref('00:00')

// 添加计算属性
const shortWsEndpoint = computed(() => {
  const url = wsEndpoint.value
  return url.replace(/^wss?:\/\//, '').replace(/\/ws\/interactive\/.*$/, '')
})

const reconnectTerminal = async () => {
  // 停止自动重连（如果是手动触发）
  autoReconnect = false

  ElMessage.info(t('shell.reconnecting'))

  // 清理现有连接
  stopHeartbeat()
  if (ws) {
    ws.close()
    ws = null
  }

  // 重新生成会话ID
  sessionId.value = generateSessionId()

  try {
    await initializeTerminal()
    await connectWebSocket()

    // 重置重连计数
    reconnectAttempts.value = 0
    autoReconnect = true

    ElMessage.success(t('shell.reconnectOk'))
  } catch (error) {
    console.error('重连失败:', error)
    ElMessage.error(t('shell.reconnectFailed') + ' ' + error.message)

    // 重置为自动重连模式
    autoReconnect = true
  }
}
const scheduleReconnect = () => {
  // 如果不是自动重连模式或已达到最大重试次数，则停止
  if (!autoReconnect || reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    console.log('已达到最大重连次数或手动取消重连')
    return
  }

  // 增加重连计数
  reconnectAttempts.value++

  // 指数退避策略
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value - 1), 30000)

  console.log(`将在 ${delay}ms 后尝试第 ${reconnectAttempts.value} 次重连`)

  reconnectTimeout = setTimeout(async () => {
    if (interactiveDialogVisible.value) {
      try {
        console.log(`尝试第 ${reconnectAttempts.value} 次重连...`)

        // 清理现有连接
        stopHeartbeat()
        if (ws) {
          ws.close()
          ws = null
        }

        // 重新生成会话ID
        sessionId.value = generateSessionId()

        // 重新初始化并连接
        await initializeTerminal()
        await connectWebSocket()

        // 成功连接后重置计数
        reconnectAttempts.value = 0
        ElMessage.success(t('shell.reconnectOk'))
      } catch (error) {
        console.error(`第 ${reconnectAttempts.value} 次重连失败:`, error)
        // 继续尝试重连
        scheduleReconnect()
      }
    }
  }, delay)
}

const clearTerminal = () => {
  if (term) {
    term.clear()
    ElMessage.success(t('shell.cleared'))
  }
}

const copySelectedText = async () => {
  try {
    const selectedText = window.getSelection().toString()
    if (selectedText) {
      await navigator.clipboard.writeText(selectedText)
      ElMessage.success(t('common.copied'))
    } else {
      ElMessage.info(t('shell.selectFirst'))
    }
  } catch (err) {
    ElMessage.error(t('gen.copyFailed'))
  }
}

const pasteToTerminal = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text && term) {
      term.write(text)
    }
  } catch (err) {
    ElMessage.error(t('shell.pasteFailed'))
  }
}

const updateTerminalFontSize = () => {
  if (term) {
    term.options.fontSize = fontSize.value
    term.refresh(0, term.rows - 1)
  }
}

// 在连接成功时启动计时器
watch(() => terminalStatus.value.connected, (connected) => {
  if (connected) {
    connectionStartTime.value = Date.now()
    startConnectionTimer()
  } else {
    connectionStartTime.value = null
    connectionDuration.value = '00:00'
  }
})

const startConnectionTimer = () => {
  const timer = setInterval(() => {
    if (!connectionStartTime.value) {
      clearInterval(timer)
      return
    }
    const duration = Date.now() - connectionStartTime.value
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    connectionDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    // 性能优化：将更新频率从1000ms改为2000ms，减少DOM更新频率
    // 用户感知不到秒数显示的1秒延迟差异，但可降低CPU压力
  }, 2000)
}
</script>

<style scoped>
.enhanced-terminal-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部样式 */
.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.terminal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.terminal-icon {
  color: #409eff;
  font-size: 24px;
}

.client-badge .el-tag {
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 主终端区域 */
.main-terminal-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 输出区域 */
.terminal-output-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.output-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.output-content {
  height: 500px;
  padding: 20px;
  overflow-y: auto;
  background: #1e1e1e;
}

.output-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.output-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.command-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.command-item {
  padding: 10px 14px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  border-left: 4px solid #409eff;
  margin-bottom: 10px;
}

.command-prompt {
  color: #409eff;
  font-weight: bold;
  margin-right: 8px;
  font-family: 'Consolas', monospace;
}

.command-text {
  color: #67c23a;
  font-weight: 500;
  font-family: 'Consolas', monospace;
}

.terminal-output {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-output {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 输入区域 */
.command-input-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid #ebeef5;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.prompt-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.prompt-user {
  color: #409eff;
  font-weight: bold;
}

.prompt-separator {
  color: #909399;
}

.prompt-path {
  color: #67c23a;
  font-weight: bold;
}

.prompt-symbol {
  color: #e6a23c;
  font-weight: bold;
}

.enhanced-command-input {
  width: 100%;
}

.enhanced-command-input :deep(.el-input-group__append) {
  padding: 0;
}

.enhanced-command-input :deep(.el-input-group__append .el-button) {
  height: 100%;
  border-radius: 0 8px 8px 0;
  padding: 0 24px;
}

.input-hints {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #909399;
  border: 1px dashed #dcdfe6;
}

.hint-text {
  font-family: 'Consolas', monospace;
}

/* 对话框样式 */
.enhanced-memory-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.dialog-icon {
  color: #409eff;
  font-size: 24px;
}

.dialog-content {
  padding: 20px 0;
}

.dialog-section {
  margin-bottom: 24px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

.mode-selector {
  width: 100%;
}

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

.file-upload-card {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-upload-card:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
}

.file-upload-card.has-file {
  border-style: solid;
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.05);
  padding: 20px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 56px;
  color: #409eff;
  opacity: 0.7;
}

.upload-text {
  color: #909399;
}

.upload-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 16px;
}

.upload-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.file-icon {
  font-size: 36px;
  color: #67c23a;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  word-break: break-all;
}

.file-info {
  display: flex;
  gap: 8px;
}

.params-input :deep(.el-textarea__inner) {
  font-family: 'Consolas', monospace;
  line-height: 1.5;
  color: #333333 !important;
  background: #ffffff !important;
}

.params-input :deep(.el-input__inner) {
  color: #333333 !important;
  background: #ffffff !important;
}

.enhanced-memory-dialog :deep(.el-input__wrapper) {
  background: #ffffff !important;
}

.preview-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.preview-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preview-item:first-child {
  padding-top: 0;
}

.sensitive-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 8px;
  border: 1px solid #d6e4ff;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.sensitive-hint .el-icon {
  color: #409eff;
  flex-shrink: 0;
  margin-top: 2px;
}

.preview-icon {
  font-size: 20px;
  color: #409eff;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.preview-value {
  font-weight: 600;
  color: #2c3e50;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.execute-button {
  min-width: 140px;
  padding: 10px 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .enhanced-terminal-container {
    padding: 12px;
  }

  .terminal-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-left, .header-right {
    justify-content: center;
  }

  .output-content {
    height: 400px;
  }

  .file-selected {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .file-info {
    flex-wrap: wrap;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .execute-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .terminal-title {
    font-size: 18px;
  }

  .output-content {
    height: 300px;
    padding: 12px;
  }

  .command-input-container {
    padding: 16px;
  }

  .prompt-display {
    font-size: 12px;
  }
}
.action-buttons {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.action-button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button .el-icon {
  margin-right: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-button {
    flex: 0 0 auto;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    margin-top: 16px;
    gap: 8px;
  }

  .action-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
/* 新增交互式终端对话框样式 */
.interactive-terminal-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.interactive-terminal-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  margin-right: 0;
}

.interactive-terminal-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #1e1e1e;
}

.interactive-terminal-dialog .dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #ffffff;
}

.dialog-title span {
  font-size: 16px;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.terminal-wrapper {
  width: 100%;
  height: 70vh;
  min-height: 400px;
  padding: 10px;
  box-sizing: border-box;
}

.terminal-wrapper :deep(.xterm) {
  height: 100%;
}

.terminal-wrapper :deep(.xterm-viewport) {
  scrollbar-width: thin;
  scrollbar-color: #555 #2d2d2d;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar) {
  width: 8px;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar-track) {
  background: #2d2d2d;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

.interactive-terminal-dialog :deep(.el-dialog__footer) {
  padding: 12px 20px;
  background: #1e1e1e;
  border-top: 1px solid #333;
  color: #ffffff;
}

.terminal-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.connection-info {
  font-size: 12px;
  color: #ffffff;
  font-family: 'Consolas', monospace;
}

.connection-info .el-icon {
  margin-right: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .interactive-terminal-dialog {
    width: 95% !important;
  }

  .terminal-wrapper {
    height: 60vh;
    min-height: 300px;
  }

  .dialog-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dialog-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
/* 美化交互式终端对话框 */
.interactive-terminal-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.interactive-terminal-dialog :deep(.el-dialog__header) {
  padding: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.interactive-terminal-dialog .dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  width: 100%;
  color: #ffffff;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dialog-icon {
  font-size: 28px;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-text {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-primary);
  letter-spacing: 0.5px;
}

.title-subtext {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 终端控制工具栏 */
.terminal-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #252525;
  border-bottom: 1px solid #333;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-buttons .el-button {
  border-color: #444;
  background: #333;
  color: #ddd;
  transition: all 0.3s ease;
}

.control-buttons .el-button:hover {
  background: #444;
  border-color: #00d4ff;
  color: #00d4ff;
  transform: translateY(-1px);
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: #333;
  border-radius: 6px;
  border: 1px solid #444;
}

.font-size-control .el-icon {
  color: #00d4ff;
}

.font-size-label {
  color: #ddd;
  font-size: 12px;
  min-width: 30px;
  text-align: center;
}

/* 终端容器 */
.terminal-wrapper {
  width: 100%;
  height: 70vh;
  min-height: 400px;
  padding: 0;
  background: #0f0f0f;
  box-sizing: border-box;
  border-bottom: 1px solid #333;
}

.terminal-wrapper :deep(.xterm) {
  height: 100%;
  padding: 20px;
}

.terminal-wrapper :deep(.xterm-viewport) {
  background: #0f0f0f;
  scrollbar-width: thin;
  scrollbar-color: #00d4ff #2d2d2d;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar) {
  width: 10px;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar-track) {
  background: #1a1a1a;
  border-radius: 5px;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar-thumb) {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border-radius: 5px;
}

.terminal-wrapper :deep(.xterm-viewport::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(135deg, #00a8cc, #0077cc);
}

/* 底部状态栏 */
.interactive-terminal-dialog :deep(.el-dialog__footer) {
  padding: 0;
  background: #1a1a2e;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.terminal-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  color: #ffffff;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.status-indicator.disconnected {
  background: rgba(255, 100, 100, 0.15);
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff6464;
  animation: pulse 2s infinite;
}

.status-indicator.connected .status-dot {
  background: #00ff88;
  animation: pulse-connected 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes pulse-connected {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
  }
  70% {
    opacity: 0.7;
    box-shadow: 0 0 0 6px rgba(0, 255, 136, 0);
  }
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #000000;
}

.connection-info, .terminal-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #aaa;
}

.connection-info .el-icon, .terminal-info .el-icon {
  color: #00d4ff;
}

.status-right .el-tag {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ddd;
  backdrop-filter: blur(10px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .interactive-terminal-dialog {
    width: 95% !important;
    margin: 10px !important;
  }

  .terminal-wrapper {
    height: 60vh;
    min-height: 300px;
  }

  .terminal-controls {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .controls-left, .controls-right {
    width: 100%;
    justify-content: center;
  }

  .dialog-title {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .terminal-status-bar {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .status-left {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 额外的颜色覆盖 */
.interactive-terminal-dialog :deep(.xterm) * {
    color: #ffffff !important;
}

.interactive-terminal-dialog :deep(.xterm-color-0),
.interactive-terminal-dialog :deep(.xterm-color-1),
.interactive-terminal-dialog :deep(.xterm-color-2),
.interactive-terminal-dialog :deep(.xterm-color-3),
.interactive-terminal-dialog :deep(.xterm-color-4),
.interactive-terminal-dialog :deep(.xterm-color-5),
.interactive-terminal-dialog :deep(.xterm-color-6),
.interactive-terminal-dialog :deep(.xterm-color-7),
.interactive-terminal-dialog :deep(.xterm-color-8),
.interactive-terminal-dialog :deep(.xterm-color-9) {
    color: #ffffff !important;
}

/* Windows 后渗透区域 */
.post-exploitation-box {
  margin-top: 16px;
  border: 1px solid #e6a23c;
  border-radius: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fff8f0 0%, #fff 100%);
  position: relative;
}

.post-box-label {
  position: absolute;
  top: -10px;
  left: 16px;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #e6a23c;
  letter-spacing: 1px;
}

.post-box-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>