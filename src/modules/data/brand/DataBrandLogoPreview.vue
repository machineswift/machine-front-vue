<template>
  <div class="logo-preview">
    <el-image
      v-if="url"
      :src="url"
      fit="contain"
      :preview-src-list="[url]"
      hide-on-click-modal
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      preview-teleported
    >
      <template #error>
        <div class="error-placeholder">
          <el-icon><Picture /></el-icon>
        </div>
      </template>
    </el-image>
    <span v-else>无</span>
  </div>
</template>

<script setup lang="ts">
  import { Picture } from '@element-plus/icons-vue'

  defineProps({
    url: {
      type: String,
      default: ''
    }
  })
</script>

<style scoped lang="scss">
  .logo-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;

    .el-image {
      width: 50px;
      height: 50px;
      cursor: zoom-in;
      transition: transform 0.3s ease;
      border-radius: 4px;
      overflow: hidden;

      &:hover {
        transform: scale(1.05);
      }
    }

    .error-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f7fa;
      color: #909399;
      border-radius: 4px;

      .el-icon {
        font-size: 30px;
      }
    }
  }
</style>
