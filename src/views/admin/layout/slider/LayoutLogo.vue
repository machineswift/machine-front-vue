<template>
  <div class="logo" v-if="appSetting.logoHidden" @click="goHome" style="cursor: pointer">
    <img :src="appSetting.logo" alt="" />
    <transition name="fade">
      <p v-show="!settingStore.getIsCollapse()">{{ appSetting.title }}</p>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import appSetting from '@/setting'
  import { useSettingStore } from '@/shared/stores/SystemSetting.store'

  const router = useRouter()
  const settingStore = useSettingStore()

  const goHome = () => router.push('/')
</script>

<style scoped lang="scss">
  .logo {
    width: 100%;
    height: $base-menu-logo-height;
    display: flex;
    align-items: center;
    padding: 10px;

    img {
      width: 32px;
      height: 32px;
    }

    p {
      font-size: $base-menu-title-fontsize;
      margin-left: 16px;
    }
  }
</style>
