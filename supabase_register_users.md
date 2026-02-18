# Supabase ユーザー登録手順

## ユーザーの新規追加方法

### 方法1: Supabase 管理画面から（推奨）

1. [Supabaseダッシュボード](https://supabase.com/dashboard/project/mjnolccfugtaooixbkwi) にログイン
2. 左サイドバーの **Authentication** をクリック
3. **Users** タブを開く
4. **Add user** → **Create new user** をクリック
5. 以下を入力:
   - **Email**: `{氏名コード}@workmania.local`（例: `20588648@workmania.local`）
   - **Password**: `WorkManiA2024!`
   - **Auto Confirm User**: ✅ チェックを入れる
6. **Create user** をクリック

### 方法2: スクリプトから

```bash
# まず Supabase ダッシュボードの Settings > API > service_role key を取得
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ユーザーを登録
node scripts/register_user.js 20588648
```

## 既存ユーザーのパスワード変更

既に登録されているユーザー（以前の登録でパスワードが異なるもの）は、Supabase管理画面でパスワードを `WorkManiA2024!` に変更してください。

1. Authentication > Users でユーザーを見つける
2. ユーザー行の右端の `...` メニューをクリック
3. **Reset password** を選択して `WorkManiA2024!` を設定

## 登録が必要なユーザー

| 氏名コード | メール | 状態 |
|---|---|---|
| 20588648 | 20588648@workmania.local | 要登録 |

## 環境変数（Renderにも設定必要）

Render にデプロイする場合、以下の環境変数を追加してください:

```
FIXED_AUTH_PASSWORD=WorkManiA2024!
```
