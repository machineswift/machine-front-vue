<template>
  <el-button type="info" size="small" icon="el-icon-Refresh" circle @click="refresh"></el-button>
  <el-button type="info" size="small" icon="el-icon-FullScreen" circle @click="fullScreen"></el-button>

  <el-popover placement="bottom" title="主题设置" :width="160" trigger="hover">
    <template #reference>
      <el-button type="info" size="small" icon="el-icon-Setting" circle></el-button>
    </template>

    <el-form>
      <el-form-item label="暗黑模式">
        <el-switch v-model="dark" inline-prompt size="default" active-icon="el-icon-Sunny" inactive-icon="el-icon-Moon" @change="changeDark" />
      </el-form-item>
    </el-form>
  </el-popover>

  <el-dropdown class="dropdown">
    <span class="el-dropdown-link">
      {{ currentUser.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>action</el-dropdown-item>
        <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useSettingStore } from '@/modules/common/stores/SystemSetting.store'
  import { useIamUserStore } from '@/modules/common/stores/IamUser.store'
  import { ArrowDown } from '@element-plus/icons-vue'

  const userStore = useIamUserStore()
  const settingStore = useSettingStore()
  const dark = ref(false)
  const currentUser = ref(userStore.currentUser)

  //刷新按钮
  const refresh = () => {
    settingStore.setIsRefresh(!settingStore.getIsRefresh())
  }

  //全屏按钮
  const fullScreen = () => {
    //DOM对象属性，判断是不是全屏
    const full = document.fullscreenElement
    if (!full) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const changeDark = () => {
    //获取html根节点
    const html = document.documentElement
    if (dark.value) {
      html.className = 'dark'
    } else {
      html.className = ''
    }
  }

  const logout = async () => {
    try {
      await userStore.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
</script>

<style scoped lang="scss">
  .dropdown {
    margin: 0 0 0 8px;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-border-color);
      }
    }

    .el-icon--right {
      margin-left: 4px;
      transition: transform 0.2s;
    }

    &:hover .el-icon--right {
      transform: rotate(180deg);
    }
  }
</style>
