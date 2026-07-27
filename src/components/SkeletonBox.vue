<template>
  <div class="shimmer-bg rounded-2xl" :style="{ width, height }" />
</template>
<script setup lang="ts">
defineProps<{ width?: string; height?: string }>()
</script>
