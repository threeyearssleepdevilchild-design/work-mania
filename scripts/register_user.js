/**
 * ユーザー登録スクリプト
 * 使い方: node scripts/register_user.js <氏名コード>
 * 
 * 例: node scripts/register_user.js 20588648
 * 
 * 複数ユーザーを登録する場合は繰り返し実行してください。
 */

const SUPABASE_URL = 'https://mjnolccfugtaooixbkwi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FIXED_PASSWORD = 'WorkManiA2024!';

async function registerUser(employeeId) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.error('エラー: SUPABASE_SERVICE_ROLE_KEY 環境変数を設定してください。');
        console.error('Supabase ダッシュボード > Settings > API > service_role key を使用してください。');
        process.exit(1);
    }

    const email = `${employeeId}@workmania.local`;

    console.log(`ユーザーを登録中: ${employeeId} (${email})...`);

    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
            email: email,
            password: FIXED_PASSWORD,
            email_confirm: true,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.msg && data.msg.includes('already been registered')) {
            console.log(`ユーザー ${employeeId} は既に登録されています。パスワードを更新します...`);
            // 既存ユーザーのパスワードを固定値に更新
            await updateUserPassword(employeeId, email);
            return;
        }
        console.error('登録エラー:', data);
        process.exit(1);
    }

    console.log(`✅ ユーザー ${employeeId} の登録が完了しました！`);
    console.log(`   User ID: ${data.id}`);
}

async function updateUserPassword(employeeId, email) {
    // まず既存ユーザーのIDを取得
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
        headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
    });
    const listData = await listResponse.json();
    const user = listData.users?.find(u => u.email === email);

    if (!user) {
        console.error(`ユーザー ${employeeId} が見つかりません。`);
        process.exit(1);
    }

    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
            password: FIXED_PASSWORD,
        }),
    });

    if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('パスワード更新エラー:', errorData);
        process.exit(1);
    }

    console.log(`✅ ユーザー ${employeeId} のパスワードを更新しました！`);
}

const employeeId = process.argv[2];
if (!employeeId) {
    console.error('使い方: node scripts/register_user.js <氏名コード>');
    console.error('例: node scripts/register_user.js 20588648');
    process.exit(1);
}

registerUser(employeeId);
