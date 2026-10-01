<!-- Small mark in the corner of every slide except the cover. -->
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { currentLayout } = useNav()
const show = computed(() => currentLayout.value !== 'cover')
</script>

<template>
  <YaMark v-if="show" class="absolute bottom-5 right-6 w-9 opacity-80" />
</template>
