<script setup lang="ts">
import { IonPage } from '@ionic/vue'
import AuthLayout from '@/shared/layouts/AuthLayout.vue'

defineProps<{
  title: string
  heading: string
  description: string
  linkLabel: string
  linkTo: string
}>()
</script>

<template>
  <IonPage>
    <AuthLayout
      :title="title"
      :heading="heading"
      :description="description"
      :link-label="linkLabel"
      :link-to="linkTo"
    />
  </IonPage>
</template>
