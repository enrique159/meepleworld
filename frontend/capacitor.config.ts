import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.meepleworld.app',
  appName: 'MeepleWorld',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
