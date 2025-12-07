# 日本語学習 - プッシュ通知登録ミニサイト

日本語学習向けのプッシュ通知許可専用ランディングページです。

## 機能

- PWA対応（ホーム画面に追加可能）
- OneSignalによるプッシュ通知登録
- 3ステップの登録フロー

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id-here
NEXT_PUBLIC_JP_LEARNING_LP_URL=https://example.com/japanese-learning
```

### 3. PWAアイコンの準備

`public/` ディレクトリに以下のアイコンファイルを配置してください：

- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OneSignal (react-onesignal)
- PWA (Progressive Web App)

## 使用方法

1. **STEP 1**: ユーザーにホーム画面への追加を案内
2. **STEP 2**: プッシュ通知の許可を促す
3. **STEP 3**: 登録完了後、LPへの遷移ボタンを表示

## 注意事項

- OneSignalのPush Primer（スライドダウンUI）は無効化されています
- ユーザー操作の中で明示的に通知許可を取得します
- PWAとして起動している場合は、自動的にSTEP 2から開始します
- iOS 16.4以降で、ホーム画面に追加されたWebアプリでプッシュ通知がサポートされています

## 実装の特徴

- **3ステップの登録フロー**: ホーム画面追加 → 通知許可 → LP遷移
- **PWA対応**: ホーム画面に追加可能で、スタンドアロンモードで動作
- **OneSignal統合**: Push Primerを無効化し、カスタムボタンで通知許可を取得
- **レスポンシブデザイン**: スマートフォンに最適化されたUI

