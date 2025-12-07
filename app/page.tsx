'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    OneSignal: any
    OneSignalDeferred: any[]
  }
}

type Step = 1 | 2 | 3

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [isPWA, setIsPWA] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const onesignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''
  const lpUrl = process.env.NEXT_PUBLIC_JP_LEARNING_LP_URL || ''

  // デバッグ: 環境変数の読み込み確認
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('環境変数チェック:', {
        onesignalAppId: onesignalAppId || '❌ 未設定',
        lpUrl: lpUrl || '❌ 未設定',
      })
    }
  }, [])

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
        setError('OneSignal App IDが設定されていません。環境変数を確認してください。')
        return
      }

      console.log('OneSignal初期化開始...', { appId: onesignalAppId })

      // OneSignal SDKが読み込まれるまで待つ
      const waitForOneSignal = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          if (typeof window === 'undefined') {
            reject(new Error('window is not defined'))
            return
          }

          // 既に読み込まれている場合
          if (window.OneSignal) {
            resolve(window.OneSignal)
            return
          }

          // OneSignalDeferredが存在する場合
          if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push(async function(OneSignal: any) {
              resolve(OneSignal)
            })
            return
          }

          // ポーリングで待つ
          let attempts = 0
          const maxAttempts = 50 // 5秒間待つ
          const interval = setInterval(() => {
            attempts++
            if (window.OneSignal) {
              clearInterval(interval)
              resolve(window.OneSignal)
            } else if (attempts >= maxAttempts) {
              clearInterval(interval)
              reject(new Error('OneSignal SDKの読み込みがタイムアウトしました'))
            }
          }, 100)
        })
      }

      try {
        const OneSignal = await waitForOneSignal()
        console.log('OneSignal SDK読み込み完了', OneSignal)

        if (!OneSignal || typeof OneSignal.init !== 'function') {
          throw new Error('OneSignal SDKが正しく読み込まれていません')
        }

        await OneSignal.init({
          appId: onesignalAppId,
          allowLocalhostAsSecureOrigin: true,
          autoRegister: false,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' },
          promptOptions: {
            slidedown: {
              enabled: false, // Push Primer 完全OFF
            },
          },
        })

        console.log('OneSignal初期化成功')

        // すでに通知が有効になっているかチェック
        const enabled = await OneSignal.User.Push.isEnabled()
        console.log('通知状態:', enabled)
        if (enabled) {
          const id = await OneSignal.User.getId()
          console.log('Player ID:', id)
          if (id) {
            setIsSubscribed(true)
            setStep(3)
          }
        }

        setIsInitialized(true)
      } catch (err: any) {
        console.error('OneSignal initialization error:', err)
        const errorMessage = err?.message || '不明なエラー'
        setError(`OneSignalの初期化に失敗しました: ${errorMessage}`)
        // エラーが発生しても、ボタンを有効にする（ユーザーが試せるように）
        setIsInitialized(true)
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

    if (typeof window === 'undefined' || !window.OneSignal) {
      setError('OneSignal SDKが読み込まれていません。ページを再読み込みしてください。')
      return
    }

    setError(null)

    try {
      const OneSignal = window.OneSignal
      
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
        setError(`通知の許可に失敗しました: ${err?.message || '不明なエラー'}`)
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

            {!isInitialized && !error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">OneSignalを初期化中...</p>
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
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <p>デバッグ情報:</p>
                  <p>初期化状態: {isInitialized ? '✅ 完了' : '⏳ 初期化中...'}</p>
                  <p>App ID: {onesignalAppId ? '✅ 設定済み' : '❌ 未設定'}</p>
                  {onesignalAppId && <p>App ID値: {onesignalAppId.substring(0, 8)}...</p>}
                </div>
              )}
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

