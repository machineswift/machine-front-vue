<template>
  <div class="logo" v-if="appSetting.logoHidden">
    <img :src="appSetting.logo" alt="" />
    <transition name="fade">
      <p v-show="!settingStore.getIsCollapse()">{{ appSetting.title }}</p>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import appSetting from '@/setting'
  import { useSettingStore } from '@/modules/common/stores/SystemSetting.store'

  const settingStore = useSettingStore()
</script>

<style scoped lang="scss">
  .logo {
    width: 100%;
    height: $base-menu-logo-height;
    display: flex;
    align-items: center;
    padding: 10px;

    img {
      width: 36px;
      height: 36px;
    }

    p {
      font-size: $base-menu-title-fontsize;
      margin-left: 18px;
    }
  }
</style>
