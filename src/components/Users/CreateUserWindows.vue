<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import UserApi from '@/api/user'

interface RuleForm {
  username: string
  password: string
  password_again: string
  phone: string
  email: string
  permissions: number | string
}

const create_data = reactive<RuleForm>({
  username: '',
  password: '',
  password_again: '',
  email: '',
  phone: '',
  permissions: "0"
})

const ruleFormRef = ref<FormInstance>()
//表单验证规则
const rules = reactive<FormRules<RuleForm>>({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: 'blur' }],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    // { min: 8, message: '密码长度大于等于8位', trigger: 'blur' }
  ],
  password_again: [
    { required: true, message: t('cu.confirmPwdRequired'), trigger: 'change' },
    // { min: 8, message: '确认密码长度大于等于8位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== create_data.password) {
          callback(new Error(t('user.pwdMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: t('cu.phoneRequired'), trigger: 'blur' },
    // { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('cu.emailRequired'), trigger: 'blur' },
    // { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  permissions: [{ required: true, message: t('cu.permissRequired'), trigger: 'blur' }]
})

// 组件间数据通信
const props = defineProps({
  dialog: Boolean
})
console.log('收到父组件参数', props.dialog)
const dialogs = ref(false)
dialogs.value = props.dialog

const emits = defineEmits(['add'])

//接口请求函数

const create_user = (data: any) => {
  return UserApi.create_user(data)
}
const onSubmit = (formEl: FormInstance | undefined) => {
  console.log('创建', create_data)
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      create_user(create_data).then((res) => {
        if (res.data.code == 200) {
          ElMessage.success(res.data.data)
          dialogs.value = false
          emits('add', dialogs.value)
        }
      })
    } else {
      console.log('error submit!', fields)
      return false
    }
  })
}
const onCancel = () => {
  console.log('取消')
  dialogs.value = false
  emits('add', dialogs.value)
}
</script>

<template>
  <div>
    <el-form ref="ruleFormRef" :model="create_data" label-width="140px" :rules="rules">
      <el-form-item :label="t('login.username')" prop="username">
        <el-input
          v-model="create_data.username"
          type="text"
          :placeholder="t('login.usernamePlaceholder')"
          autocomplete="off"
          minlength="8"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item :label="t('login.password')" prop="password">
        <el-input
          v-model="create_data.password"
          type="password"
          :placeholder="t('login.passwordPlaceholder')"
          autocomplete="off"
          clearable
          style="width: 200px"
          show-password
        />
      </el-form-item>
      <el-form-item :label="t('user.confirmPwd')" prop="password_again">
        <el-input
          v-model="create_data.password_again"
          type="password"
          :placeholder="t('user.confirmPwdPh')"
          clearable
          style="width: 200px"
          show-password
        />
      </el-form-item>
      <el-form-item :label="t('cu.phone')" prop="phone">
        <el-input
          v-model="create_data.phone"
          type="text"
          :placeholder="t('cu.phoneRequired')"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item :label="t('cu.email')" prop="email">
        <el-input
          v-model="create_data.email"
          type="text"
          :placeholder="t('cu.emailRequired')"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item :label="t('cu.role')" prop="permissions">
        <el-radio-group v-model="create_data.permissions">
          <el-radio label="1">{{ t('cu.admin') }}</el-radio>
          <el-radio label="0">{{ t('cu.normalUser') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit(ruleFormRef)">{{ t('cu.create') }}</el-button>
        <el-button @click="onCancel">{{ t('common.cancel') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped></style>
