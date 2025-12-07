// OneSignal Web SDK の型定義
declare module 'react-onesignal' {
  interface OneSignalInitOptions {
    appId: string
    allowLocalhostAsSecureOrigin?: boolean
    autoRegister?: boolean
    promptOptions?: {
      slidedown?: {
        enabled: boolean
      }
    }
  }

  interface OneSignalUser {
    Push: {
      enable(): Promise<void>
      isEnabled(): Promise<boolean>
    }
    getId(): Promise<string | null>
  }

  interface OneSignalStatic {
    init(options: OneSignalInitOptions): Promise<void>
    User: OneSignalUser
  }

  const OneSignal: OneSignalStatic
  export default OneSignal
}

