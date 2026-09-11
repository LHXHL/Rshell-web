<template>
  <div class="socks5-container">
    <!-- 头部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="header-left">
          <h2 class="header-title">
            <i class="el-icon-connection header-icon"></i>
            {{ t('socks.title') }}
          </h2>
          <p class="header-description">
            {{ t('socks.subtitle') }}
          </p>
        </div>
        <div class="header-right">
          <el-button
              type="primary"
              size="large"
              @click="dialogVisible = true"
              class="add-button"
          >
            <i class="el-icon-plus"></i>
            {{ t('socks.add') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 代理列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <i class="el-icon-s-order"></i>
            <span>{{ t('socks.list') }}</span>
          </div>
          <div class="table-actions">
            <el-button
                type="info"
                size="small"
                :icon="Refresh"
                @click="refreshList"
                :loading="loading"
            >
              {{ t('common.refresh') }}
            </el-button>
            <el-button
                type="text"
                size="small"
                @click="toggleHelp"
            >
              <i class="el-icon-question"></i>
              {{ t('socks.guide') }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <el-empty
          v-if="tableData.length === 0 && !loading"
          :description="t('socks.empty')"
          :image-size="100"
      >
        <el-button type="primary" @click="dialogVisible = true">
          {{ t('socks.createFirst') }}
        </el-button>
      </el-empty>

      <!-- 代理表格 -->
      <div v-else>
        <el-table
            :data="tableData"
            :loading="loading"
            style="width: 100%"
            class="proxy-table"
            stripe
        >
          <el-table-column
              prop="Socks5port"
              :label="t('gen.listenPort')"
              width="120"
          >
            <template #default="{ row }">
              <div class="port-cell">
                <span class="port-number">{{ row.Socks5port }}</span>
                <el-tag
                    size="small"
                    type="info"
                    effect="plain"
                    v-if="row.Status === 1"
                >
                  {{ t('socks.enabled') }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              prop="UserName"
              :label="t('credentials.username')"
              width="150"
          >
            <template #default="{ row }">
              <span v-if="row.UserName" class="auth-info">
                <i class="el-icon-user"></i>
                {{ row.UserName }}
              </span>
              <span v-else class="no-auth">{{ t('socks.noAuth') }}</span>
            </template>
          </el-table-column>

          <el-table-column
              prop="Password"
              :label="t('socks.pwd')"
              width="180"
          >
            <template #default="{ row }">
              <div v-if="row.Password" class="password-cell">
                <span class="password-mask">••••••</span>
                <el-tooltip
                    :content="t('socks.showPwd')"
                    placement="top"
                >
                  <el-button
                      type="text"
                      size="small"
                      @click="showPassword(row)"
                      class="show-password-btn"
                  >
                    <i class="el-icon-view"></i>
                  </el-button>
                </el-tooltip>
              </div>
              <span v-else class="no-auth">{{ t('socks.noPwd') }}</span>
            </template>
          </el-table-column>

          <el-table-column
              :label="t('socks.connInfo')"
              min-width="200"
          >
            <template #default="{ row }">
              <div class="connection-info">
                <div class="connection-item">
                  <span class="label">{{ t('credentials.type') }}:</span>
                  <el-tag size="small">{{ row.Type }}</el-tag>
                </div>
                <div class="connection-item">
                  <span class="label">{{ t('common.status') }}:</span>
                  <el-tag
                      :type="row.Status === 1 ? 'success' : 'danger'"
                      size="small"
                      :effect="row.Status === 1 ? 'light' : 'plain'"
                  >
                    <i :class="row.Status === 1 ? 'el-icon-success' : 'el-icon-error'"></i>
                    {{ row.Status === 1 ? t('listener.running') : t('listener.stopped') }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              :label="t('common.actions')"
              width="240"
              align="center"
              fixed="right"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                    v-if="row.Status === 2"
                    type="success"
                    size="small"
                    @click="handleOpen(row)"
                    :loading="row.loading"
                    class="action-btn"
                >
                  <i class="el-icon-video-play"></i>
                  {{ t('socks.enable') }}
                </el-button>
                <el-button
                    v-if="row.Status === 1"
                    type="warning"
                    size="small"
                    @click="handleClose(row)"
                    :loading="row.loading"
                    class="action-btn"
                >
                  <i class="el-icon-video-pause"></i>
                  {{ t('socks.disable') }}
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDelete(row)"
                    :loading="row.deleting"
                    class="action-btn"
                >
                  <i class="el-icon-delete"></i>
                  {{ t('common.delete') }}
                </el-button>
                <el-dropdown
                    trigger="click"
                    @command="handleCommand($event, row)"
                    size="small"
                >
                  <el-button
                      type="text"
                      size="small"
                      class="more-btn"
                  >
                    <i class="el-icon-more"></i>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy">
                        <i class="el-icon-document-copy"></i>
                        {{ t('socks.copyConn') }}
                      </el-dropdown-item>
                      <el-dropdown-item command="test">
                        <i class="el-icon-connection"></i>
                        {{ t('socks.testConn') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统计信息 -->
        <div class="stats-info" v-if="tableData.length > 0">
          <el-space>
            <span class="stat-item">
              <span class="stat-label">{{ t('listener.total') }}:</span>
              <span class="stat-value">{{ tableData.length }}</span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">{{ t('listener.running') }}:</span>
              <span class="stat-value running">
                {{ runningCount }}
              </span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">{{ t('listener.stopped') }}:</span>
              <span class="stat-value stopped">
                {{ stoppedCount }}
              </span>
            </span>
          </el-space>
        </div>
      </div>
    </el-card>

    <!-- 新增代理对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="t('socks.add')"
        width="480px"
        class="add-dialog"
        @close="resetForm"
    >
      <el-form
          :model="formData"
          label-width="120px"
          :rules="formRules"
          ref="formRef"
      >
        <el-form-item
            :label="t('gen.listenPort')"
            prop="socks5port"
            required
        >
          <el-input
              v-model="formData.socks5port"
              :placeholder="t('socks.portPh')"
              clearable
          >
            <template #prepend>
              <span class="input-prepend">{{ t('gen.listenPort') }}</span>
            </template>
          </el-input>
          <div class="form-tip">
            {{ t('socks.portRange') }}
          </div>
        </el-form-item>

        <el-form-item :label="t('credentials.username')" prop="username">
          <el-input
              v-model="formData.username"
              :placeholder="t('socks.authOptional')"
              clearable
              autocomplete="off"
          >
            <template #prepend>
              <span class="input-prepend">{{ t('credentials.username') }}</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="t('socks.pwd')" prop="password">
          <el-input
              v-model="formData.password"
              :placeholder="t('socks.authOptional')"
              type="password"
              show-password
              clearable
              autocomplete="new-password"
          >
            <template #prepend>
              <span class="input-prepend">{{ t('socks.pwd') }}</span>
            </template>
          </el-input>
          <div class="form-tip">
            {{ t('socks.userPwdRule') }}
          </div>
        </el-form-item>

        <el-form-item :label="t('socks.proxyType')" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="socks5">Socks5</el-radio>
<!--            <el-radio label="socks4" disabled>Socks4（暂不支持）</el-radio>-->
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button
              type="primary"
              @click="startSocks5"
              :loading="adding"
          >
            {{ t('socks.confirmCreate') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 使用说明抽屉 -->
    <el-drawer
        v-model="helpVisible"
        :title="t('socks.guide')"
        size="400px"
    >
      <div class="help-content">
        <h3><i class="el-icon-info"></i> {{ t('socks.whatIs') }}</h3>
        <p>{{ t('socks.whatIsDesc') }}</p>

        <h3><i class="el-icon-setting"></i> {{ t('socks.howTo') }}</h3>
        <el-steps direction="vertical" :active="4">
          <el-step :title="t('socks.stepCreate')">
            <template #description>
              <p>{{ t('socks.stepCreateDesc') }}</p>
            </template>
          </el-step>
          <el-step :title="t('socks.stepStart')">
            <template #description>
              <p>{{ t('socks.stepStartDesc') }}</p>
            </template>
          </el-step>
          <el-step :title="t('socks.stepConfig')">
            <template #description>
              <p>{{ t('socks.stepConfigDesc') }}</p>
              <el-card shadow="never" class="example-card">
                <pre class="config-example">{{ t('socks.cfgHost') }}: {{ currentHost }}
{{ t('gen.listenPort') }}: [{{ t('socks.cfgYourPort') }}]
{{ t('socks.cfgAuth') }}: [{{ t('credentials.username') }}/{{ t('socks.pwd') }}] ({{ t('socks.cfgIfSet') }})</pre>
              </el-card>
            </template>
          </el-step>
          <el-step :title="t('socks.stepUse')">
            <template #description>
              <p>{{ t('socks.stepUseDesc') }}</p>
            </template>
          </el-step>
        </el-steps>

        <h3><i class="el-icon-warning-outline"></i> {{ t('socks.notes') }}</h3>
        <ul class="notice-list">
          <li>{{ t('socks.note1') }}</li>
          <li>{{ t('socks.note2') }}</li>
          <li>{{ t('socks.note3') }}</li>
          <li>{{ t('socks.note4') }}</li>
        </ul>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Refresh } from '@element-plus/icons-vue';
import ClientAPI from "@/api/clients";
import { useRoute } from "vue-router";

const route = useRoute();
const uid = route.query.uid as string;

// 响应式数据
const dialogVisible = ref(false);
const helpVisible = ref(false);
const loading = ref(false);
const adding = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  connectAddress: "",
  socks5port: "",
  username: "",
  password: "",
  type: "socks5"
});

// 表单验证规则
const formRules = {
  socks5port: [
    { required: true, message: t('socks.portRequired'), trigger: 'blur' },
    { pattern: /^[1-9]\d*$/, message: t('socks.portInteger'), trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
        if (value && (parseInt(value) < 1 || parseInt(value) > 65535)) {
          callback(new Error(t('socks.portRangeErr')));
        } else {
          callback();
        }
      }, trigger: 'blur' }
  ],
  username: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !formData.password) {
          callback(new Error(t('socks.userNeedsPwd')));
        } else if (!value && formData.password) {
          callback(new Error(t('socks.pwdNeedsUser')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 计算属性
const runningCount = computed(() => {
  return tableData.value.filter(item => item.Status === 1).length;
});

const stoppedCount = computed(() => {
  return tableData.value.filter(item => item.Status === 2).length;
});

const currentHost = computed(() => {
  return window.location.hostname || 'localhost';
});

// 方法
const getSocks5List = async () => {
  loading.value = true;
  try {
    const res = await ClientAPI.getSocks5List({ uid });
    if (res.status === 200) {
      // 检查 res.data.data 是否存在且为数组，否则置空数组
      if (res.data.data && Array.isArray(res.data.data)) {
        tableData.value = res.data.data.map((item: any) => ({
          ...item,
          loading: false,
          deleting: false
        }));
      } else {
        // 当 data 为 null、undefined 或不是数组时，清空表格
        tableData.value = [];
      }
    }
  } catch (error) {
    console.error('获取代理列表失败:', error);
    ElMessage.error(t('socks.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await getSocks5List();
  ElMessage.success(t('socks.refreshed'));
};

const startSocks5 = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    adding.value = true;
    try {
      const res = await ClientAPI.startSocks5({
        Password: formData.password,
        Socks5port: formData.socks5port,
        UserName: formData.username,
        uid
      });

      if (res.status === 200) {
        if (res.data.status === 200) {
          ElMessage.success(t('socks.createOk'));
          dialogVisible.value = false;
          await getSocks5List();
        } else {
          ElMessage.error(res.data.data || t('gen.createFailed'));
        }
      }
    } catch (error) {
      console.error('创建代理失败:', error);
      ElMessage.error(t('socks.createFailed'));
    } finally {
      adding.value = false;
    }
  });
};

const handleClose = async (row: any) => {
  row.loading = true;
  try {
    const res = await ClientAPI.CloseSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success(t('gen.serviceStopped'));
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || t('gen.stopFailed'));
      }
    }
  } catch (error) {
    console.error('停止代理失败:', error);
    ElMessage.error(t('gen.stopFailed'));
  } finally {
    row.loading = false;
  }
};

const handleOpen = async (row: any) => {
  row.loading = true;
  try {
    const res = await ClientAPI.OpenSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success(t('socks.started'));
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || t('socks.startFailed'));
      }
    }
  } catch (error) {
    console.error('开启代理失败:', error);
    ElMessage.error(t('socks.startFailed'));
  } finally {
    row.loading = false;
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        t('socks.deleteConfirm'),
        t('listener.deleteTitle'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
    );

    row.deleting = true;
    const res = await ClientAPI.DeleteSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success(t('common.deleted'));
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || t('common.deleteFailed'));
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除代理失败:', error);
      ElMessage.error(t('common.deleteFailed'));
    }
  } finally {
    row.deleting = false;
  }
};

const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      copyConnectionInfo(row);
      break;
    case 'test':
      testConnection(row);
      break;
  }
};

const copyConnectionInfo = (row: any) => {
  const text = `${t('socks.cfgTitle')}:
${t('socks.cfgServer')}: ${currentHost.value}
${t('gen.listenPort')}: ${row.Socks5port}
${t('credentials.username')}: ${row.UserName || t('shell.none')}
${t('socks.pwd')}: ${row.Password || t('shell.none')}`;

  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(t('common.copied'));
  }).catch(() => {
    ElMessage.error(t('gen.copyFailed'));
  });
};

const testConnection = async (row: any) => {
  ElMessage.info(t('socks.testWip'));
};

const showPassword = (row: any) => {
  ElMessageBox.alert(
      `${t('socks.pwd')}: ${row.Password}`,
      t('socks.pwdDetail'),
      {
        confirmButtonText: t('common.confirm'),
        callback: () => {
          copyToClipboard(row.Password);
        }
      }
  );
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(t('common.copied'));
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.socks5port = '';
  formData.username = '';
  formData.password = '';
  formData.type = 'socks5';
};

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value;
};

// 生命周期
onMounted(async () => {
  await getSocks5List();
});
</script>

<style scoped lang="scss">
.socks5-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  :deep(.el-card__body) {
    padding: 24px 32px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-left {
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;

  .header-icon {
    margin-right: 12px;
    font-size: 28px;
  }
}

.header-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.add-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.table-card {
  border: none;
  border-radius: 12px;

  :deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;

  i {
    margin-right: 8px;
    color: var(--theme-primary);
  }
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.proxy-table {
  :deep(.el-table__header) {
    th {
      background-color: #fafafa;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-table__body) {
    tr:hover {
      td {
        background-color: #f5f7fa;
      }
    }
  }
}

.port-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .port-number {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
    color: #409eff;
  }
}

.auth-info {
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    color: #909399;
  }
}

.no-auth {
  color: #c0c4cc;
  font-style: italic;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .password-mask {
    font-family: 'Monaco', 'Consolas', monospace;
    letter-spacing: 2px;
  }

  .show-password-btn {
    padding: 2px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.connection-info {
  .connection-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
      font-size: 12px;
      min-width: 40px;
    }
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;

  .action-btn {
    padding: 7px 12px;

    i {
      margin-right: 4px;
    }
  }

  .more-btn {
    padding: 7px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.stats-info {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;

  .stat-item {
    display: inline-flex;
    align-items: center;
  }

  .stat-label {
    color: #606266;
    font-size: 14px;
  }

  .stat-value {
    font-weight: 600;
    font-size: 16px;

    &.running {
      color: #67c23a;
    }

    &.stopped {
      color: #f56c6c;
    }
  }
}

.add-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #f0f0f0;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 24px 20px 20px;
  }
}

.input-prepend {
  color: #909399;
  width: 40px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.help-content {
  padding: 20px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 20px 0 12px 0;
    color: #303133;

    i {
      color: #409eff;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    color: #606266;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
}

.example-card {
  margin: 12px 0;
  background-color: #f8f9fa;

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.config-example {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #333;
  white-space: pre-wrap;
}

.notice-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;

  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
}

:deep(.el-step__head) {
  &.is-process {
    color: #409eff;
    border-color: #409eff;
  }
}

:deep(.el-step__title) {
  &.is-process {
    color: #409eff;
  }
}
</style>