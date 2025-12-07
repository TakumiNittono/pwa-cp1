'use client'

import { useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'

type Step = 1 | 2 | 3

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [isPWA, setIsPWA] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const onesignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''
  const lpUrl = process.env.NEXT_PUBLIC_JP_LEARNING_LP_URL || ''

  useEffect(() => {
    // PWAとして起動しているかチェック
    const checkPWA = () => {
      if (typeof window !== 'undefined') {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true
        setIsPWA(isStandalone)
        if (isStandalone) {
          setStep(2)
        }
      }
    }

    checkPWA()

    // OneSignal初期化
    const initOneSignal = async () => {
      if (!onesignalAppId) {
        console.error('OneSignal App ID is not set')
        return
      }

      try {
        await OneSignal.init({
          appId: onesignalAppId,
          allowLocalhostAsSecureOrigin: true,
          autoRegister: false,
          promptOptions: {
            slidedown: {
              enabled: false, // Push Primer 完全OFF
            },
          },
        })

        // すでに通知が有効になっているかチェック
        const enabled = await OneSignal.User.Push.isEnabled()
        if (enabled) {
          const id = await OneSignal.User.getId()
          if (id) {
            setIsSubscribed(true)
            setStep(3)
          }
        }

        setIsInitialized(true)
      } catch (err) {
        console.error('OneSignal initialization error:', err)
        setError('OneSignalの初期化に失敗しました')
      }
    }

    initOneSignal()
  }, [onesignalAppId])

  const handleSkipToStep2 = () => {
    setStep(2)
  }

  const handleSubscribe = async () => {
    if (!isInitialized) {
      setError('OneSignalの初期化が完了していません')
      return
    }

    setError(null)

    try {
      // 通知を有効化
      await OneSignal.User.Push.enable()

      // 有効化されたか確認
      const enabled = await OneSignal.User.Push.isEnabled()

      if (enabled) {
        const id = await OneSignal.User.getId()
        if (id) {
          setIsSubscribed(true)
          setStep(3)
        } else {
          setError('Player IDの取得に失敗しました')
        }
      } else {
        setError('通知が拒否されました。ブラウザの設定から通知を許可することができます。')
      }
    } catch (err: any) {
      console.error('Subscription error:', err)
      if (err?.message?.includes('denied') || err?.message?.includes('permission')) {
        setError('通知が拒否されました。ブラウザの設定から通知を許可することができます。')
      } else {
        setError('通知の許可に失敗しました。もう一度お試しください。')
      }
    }
  }

  const handleGoToLP = () => {
    if (lpUrl) {
      window.location.href = lpUrl
    } else {
      alert('LP URLが設定されていません')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* STEP 1: ホーム画面に追加 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              ① ホーム画面に追加してください
            </h1>

            <div className="space-y-4 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  iPhone（Safari）の場合：
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>画面下の「共有」アイコン（□に↑）をタップ</li>
                  <li>「ホーム画面に追加」を選ぶ</li>
                  <li>「追加」を押す</li>
                  <li>ホーム画面からこのアプリを開いてください</li>
                </ol>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Android（Chrome）の場合：
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>右上の「︙」メニューをタップ</li>
                  <li>「ホーム画面に追加」または「インストール」を選ぶ</li>
                  <li>指示に従って追加</li>
                  <li>ホーム画面からこのアプリを開いてください</li>
                </ol>
              </div>
            </div>

            <button
              onClick={handleSkipToStep2}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              すでにホーム画面に追加した
            </button>
          </div>
        )}

        {/* STEP 2: 通知を許可 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              ② プッシュ通知を許可してください
            </h1>

            <div className="space-y-6 mb-8">
              <p className="text-gray-600 text-lg">
                日本語学習のコツや、新しい教材の更新情報をプッシュ通知でお届けします。
              </p>
              <p className="text-gray-600">
                あと 1 回、通知を許可するだけで完了です。
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleSubscribe}
                disabled={!isInitialized}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
              >
                <span>🔔</span>
                <span>通知を許可する</span>
              </button>
              <p className="text-sm text-gray-500 text-center">
                このボタンをタップすると、ブラウザの通知許可ダイアログが表示されます。
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              ③ 登録が完了しました！
            </h1>

            <p className="text-gray-600 mb-8 text-lg">
              準備が整いました。下のボタンから日本語学習ページへ進んでください。
            </p>

            <button
              onClick={handleGoToLP}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Success! 学習ページへ進む
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

