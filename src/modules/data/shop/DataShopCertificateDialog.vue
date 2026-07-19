<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="门店证件管理"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-tabs v-model="state.activeTab">
      <!-- 营业执照 -->
      <el-tab-pane label="营业执照" name="businessLicense">
        <el-form :model="state.form.businessLicense" label-width="180px" ref="businessLicenseFormRef">
          <el-form-item label="统一社会信用代码" prop="unifiedSocialCreditCode">
            <el-input v-model="state.form.businessLicense.unifiedSocialCreditCode" placeholder="请输入统一社会信用代码" />
          </el-form-item>
          <el-form-item label="企业名称" prop="enterpriseName">
            <el-input v-model="state.form.businessLicense.enterpriseName" placeholder="请输入企业名称" />
          </el-form-item>
          <el-form-item label="法定代表人" prop="legalPersonName">
            <el-input v-model="state.form.businessLicense.legalPersonName" placeholder="请输入法定代表人" />
          </el-form-item>
          <el-form-item label="发证日期" prop="issueDate">
            <el-date-picker v-model="state.form.businessLicense.issueDate" type="date" placeholder="选择发证日期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="有效期至" prop="expiryDate">
            <el-date-picker v-model="state.form.businessLicense.expiryDate" type="date" placeholder="选择有效期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="企业地址" prop="enterpriseAddress">
            <el-input v-model="state.form.businessLicense.enterpriseAddress.address" placeholder="请输入企业地址" />
          </el-form-item>
          <el-form-item label="营业执照照片" prop="materialIdList">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="state.businessLicenseFiles"
              :on-change="handleBusinessLicenseChange"
              :auto-upload="false"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 食品经营许可证 -->
      <el-tab-pane label="食品经营许可证" name="foodBusinessLicense">
        <el-form :model="state.form.foodBusinessLicense" label-width="180px" ref="foodBusinessLicenseFormRef">
          <el-form-item label="统一社会信用代码" prop="unifiedSocialCreditCode">
            <el-input v-model="state.form.foodBusinessLicense.unifiedSocialCreditCode" placeholder="请输入统一社会信用代码" />
          </el-form-item>
          <el-form-item label="企业名称" prop="enterpriseName">
            <el-input v-model="state.form.foodBusinessLicense.enterpriseName" placeholder="请输入企业名称" />
          </el-form-item>
          <el-form-item label="法定代表人" prop="legalPersonName">
            <el-input v-model="state.form.foodBusinessLicense.legalPersonName" placeholder="请输入法定代表人" />
          </el-form-item>
          <el-form-item label="发证日期" prop="issueDate">
            <el-date-picker v-model="state.form.foodBusinessLicense.issueDate" type="date" placeholder="选择发证日期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="有效期至" prop="expiryDate">
            <el-date-picker v-model="state.form.foodBusinessLicense.expiryDate" type="date" placeholder="选择有效期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="企业地址" prop="enterpriseAddress">
            <el-input v-model="state.form.foodBusinessLicense.enterpriseAddress.address" placeholder="请输入企业地址" />
          </el-form-item>
          <el-form-item label="许可证照片" prop="materialIdList">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="state.foodBusinessLicenseFiles"
              :on-change="handleFoodBusinessLicenseChange"
              :auto-upload="false"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 消杀合同 -->
      <el-tab-pane label="消杀合同" name="disinfectingContract">
        <el-form :model="state.form.disinfectingContract" label-width="180px" ref="disinfectingContractFormRef">
          <el-form-item label="合同编号" prop="contractCode">
            <el-input v-model="state.form.disinfectingContract.contractCode" placeholder="请输入合同编号" />
          </el-form-item>
          <el-form-item label="合同名称" prop="contractName">
            <el-input v-model="state.form.disinfectingContract.contractName" placeholder="请输入合同名称" />
          </el-form-item>
          <el-form-item label="签订日期" prop="issueDate">
            <el-date-picker v-model="state.form.disinfectingContract.issueDate" type="date" placeholder="选择签订日期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="有效期至" prop="expiryDate">
            <el-date-picker v-model="state.form.disinfectingContract.expiryDate" type="date" placeholder="选择有效期" value-format="x" style="width: 100%" />
          </el-form-item>
          <el-form-item label="合同照片" prop="contractMaterialList">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="state.disinfectingContractFiles"
              :on-change="handleDisinfectingContractChange"
              :auto-upload="false"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 门头照 -->
      <el-tab-pane label="门头照" name="frontPhoto">
        <el-form :model="state.form.frontPhoto" label-width="180px" ref="frontPhotoFormRef">
          <el-form-item label="门头照片" prop="storeFrontMaterialIdList">
            <el-upload action="#" list-type="picture-card" :file-list="state.frontPhotoFiles" :on-change="handleFrontPhotoChange" :auto-upload="false" multiple>
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="前台照片" prop="frontDeskMaterialIdList">
            <el-upload action="#" list-type="picture-card" :file-list="state.frontDeskFiles" :on-change="handleFrontDeskChange" :auto-upload="false" multiple>
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE:DATA:SHOP:UPDATE_CERTIFICATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { UploadFile, UploadFiles } from 'element-plus'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import type { DataShopCertificateResponseVo, DataShopUpdateCertificateRequestVo } from '@/modules/data/shop/type/DataShop.type'
  import type { AddressInfoDto } from '@/shared/types/CommonData.type'

  const props = defineProps<{
    modelValue: boolean
    shopId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    activeTab: 'businessLicense',
    form: {
      id: props.shopId,
      businessLicense: {
        certificateStatus: 1,
        temporaryBusinessLicense: {
          impendingReminderRule: 30,
          unifiedSocialCreditCode: '',
          enterpriseName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          legalPersonName: '',
          enterpriseAddress: {
            address: ''
          } as AddressInfoDto,
          materialIdList: [] as string[]
        },
        permanentBusinessLicense: {
          impendingReminderRule: 30,
          unifiedSocialCreditCode: '',
          enterpriseName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          legalPersonName: '',
          enterpriseAddress: {
            address: ''
          } as AddressInfoDto,
          materialIdList: [] as string[]
        }
      },
      foodBusinessLicense: {
        certificateStatus: 1,
        temporaryFoodBusinessLicense: {
          impendingReminderRule: 30,
          unifiedSocialCreditCode: '',
          enterpriseName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          legalPersonName: '',
          enterpriseAddress: {
            address: ''
          } as AddressInfoDto,
          materialIdList: [] as string[]
        },
        permanentFoodBusinessLicense: {
          impendingReminderRule: 30,
          unifiedSocialCreditCode: '',
          enterpriseName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          legalPersonName: '',
          enterpriseAddress: {
            address: ''
          } as AddressInfoDto,
          materialIdList: [] as string[]
        }
      },
      disinfectingContract: {
        certificateStatus: 1,
        temporaryDisinfectingContract: {
          impendingReminderRule: 30,
          contractCode: '',
          contractName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          contractMaterialList: [] as string[]
        },
        permanentDisinfectingContract: {
          impendingReminderRule: 30,
          contractCode: '',
          contractName: '',
          issueDate: undefined as number | undefined,
          expiryDate: undefined as number | undefined,
          contractMaterialList: [] as string[]
        }
      },
      frontPhoto: {
        certificateStatus: 1,
        temporaryShopFrontPhoto: {
          storeFrontMaterialIdList: [] as string[],
          frontDeskMaterialIdList: [] as string[]
        },
        permanentShopFrontPhoto: {
          storeFrontMaterialIdList: [] as string[],
          frontDeskMaterialIdList: [] as string[]
        }
      }
    } as DataShopUpdateCertificateRequestVo,
    businessLicenseFiles: [] as UploadFile[],
    foodBusinessLicenseFiles: [] as UploadFile[],
    disinfectingContractFiles: [] as UploadFile[],
    frontPhotoFiles: [] as UploadFile[],
    frontDeskFiles: [] as UploadFile[]
  })

  // 表单引用
  const businessLicenseFormRef = ref()
  const foodBusinessLicenseFormRef = ref()
  const disinfectingContractFormRef = ref()
  const frontPhotoFormRef = ref()

  // 获取证件数据
  const fetchData = async () => {
    try {
      state.loading = true
      const data: DataShopCertificateResponseVo = await DataShopApi.getCertificate({ id: props.shopId })

      // 营业执照
      if (data.businessLicense) {
        state.form.businessLicense = data.businessLicense
        // 这里需要将materialIdList转换为UploadFile格式
      }

      // 食品经营许可证
      if (data.foodBusinessLicense) {
        state.form.foodBusinessLicense = data.foodBusinessLicense
        // 这里需要将materialIdList转换为UploadFile格式
      }

      // 消杀合同
      if (data.disinfectingContract) {
        state.form.disinfectingContract = data.disinfectingContract
        // 这里需要将contractMaterialList转换为UploadFile格式
      }

      // 门头照
      if (data.frontPhoto) {
        state.form.frontPhoto = data.frontPhoto
        // 这里需要将storeFrontMaterialIdList和frontDeskMaterialIdList转换为UploadFile格式
      }
    } catch (error) {
      console.error('获取门店证件失败', error)
    } finally {
      state.loading = false
    }
  }

  // 处理文件上传变化
  const handleBusinessLicenseChange = (file: UploadFile, fileList: UploadFiles) => {
    state.businessLicenseFiles = fileList
    // 这里需要处理文件上传逻辑，获取materialId并设置到form中
  }

  const handleFoodBusinessLicenseChange = (file: UploadFile, fileList: UploadFiles) => {
    state.foodBusinessLicenseFiles = fileList
    // 这里需要处理文件上传逻辑，获取materialId并设置到form中
  }

  const handleDisinfectingContractChange = (file: UploadFile, fileList: UploadFiles) => {
    state.disinfectingContractFiles = fileList
    // 这里需要处理文件上传逻辑，获取materialId并设置到form中
  }

  const handleFrontPhotoChange = (file: UploadFile, fileList: UploadFiles) => {
    state.frontPhotoFiles = fileList
    // 这里需要处理文件上传逻辑，获取materialId并设置到form中
  }

  const handleFrontDeskChange = (file: UploadFile, fileList: UploadFiles) => {
    state.frontDeskFiles = fileList
    // 这里需要处理文件上传逻辑，获取materialId并设置到form中
  }

  const handleDialogClosed = () => {
    console.log('===')
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true

      // 验证表单
      await Promise.all([
        businessLicenseFormRef.value?.validate(),
        foodBusinessLicenseFormRef.value?.validate(),
        disinfectingContractFormRef.value?.validate(),
        frontPhotoFormRef.value?.validate()
      ])

      await DataShopApi.updateCertificate(state.form)
      ElMessage.success('保存成功')
      emit('success')
      state.dialogVisible = false
    } catch (error) {
      console.error('保存门店证件失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.shopId],
    async ([modelValue, shopId]) => {
      if (modelValue && shopId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
