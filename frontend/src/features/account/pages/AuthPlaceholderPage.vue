<script setup lang="ts">
import { IonPage } from '@ionic/vue'
import AuthLayout from '@/shared/layouts/AuthLayout.vue'

defineProps<{
  title: string
  heading: string
  description: string
  linkLabel: string
  linkTo: string
  secondaryLinkLabel?: string
  secondaryLinkTo?: string
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
      :secondary-link-label="secondaryLinkLabel"
      :secondary-link-to="secondaryLinkTo"
    >
      <slot />
    </AuthLayout>
  </IonPage>
</template>
