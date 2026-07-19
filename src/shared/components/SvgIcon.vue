<template>
  <svg :style="{ width: width, height: height, margin: margin }">
    <use :xlink:href="prefix + name" :fill="color"></use>
  </svg>
</template>

<script setup lang="ts">
  defineProps({
    prefix: {
      type: String,
      default: '#icon-'
    },
    name: String,
    color: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '16px'
    },
    height: {
      type: String,
      default: '16px'
    },
    margin: {
      type: String,
      default: '0 5px 0 0'
    }
  })
</script>

<style scoped lang="scss"></style>
