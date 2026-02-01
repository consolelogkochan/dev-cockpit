import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Axiosのインスタンスを作成
const client = axios.create({
    baseURL: 'http://localhost', // APIのベースURL
    headers: {
        'X-Requested-With': 'XMLHttpRequest', // Ajax通信であることを明示
    },
    withCredentials: true, // ★重要: これでクッキー(セッション)を自動で送受信します
});

// レスポンスのインターセプター (結果が返ってきた時の処理)
client.interceptors.response.use(
    (response) => {
        // 成功時の共通処理（必要なら）
        // 例えば、特定のフラグがあれば "保存しました" を出すなど
        // 今回はシンプルにするため、個別の画面で toast.success() を呼ぶ運用にします
        return response;
    },
    (error: AxiosError<any>) => {
        // エラー時の共通処理
        const status = error.response?.status;
        const message = error.response?.data?.message || '予期せぬエラーが発生しました。';

        switch (status) {
            case 401:
                // 未認証 (ログイン切れなど)
                // ログイン画面へのリダイレクトは AuthContext 側や Router で制御されるため
                // ここでは「セッションが切れました」等の通知だけ出すか、何もしない
                // toast.error('セッションが無効です。再ログインしてください。');
                break;

            case 403:
                // 権限なし
                toast.error('この操作を行う権限がありません。');
                break;

            case 404:
                // リソースが見つからない
                // APIの404は画面遷移させず、通知で知らせるのが一般的
                toast.error('データが見つかりませんでした。');
                break;
            
            case 419:
                // CSRFトークン期限切れ
                toast.error('ページの有効期限が切れました。リロードしてください。');
                break;

            case 422:
                // バリデーションエラー
                // 個別のフォームで細かく出したい場合が多いので、
                // ここでは「入力内容を確認してください」とだけ出す
                toast.error('入力内容に誤りがあります。');
                break;

            case 500:
                // サーバーエラー
                toast.error('サーバーエラーが発生しました。時間を置いて再試行してください。');
                console.error('Server Error:', error.response?.data);
                break;

            default:
                // ネットワークエラーなど (statusがない場合)
                if (!status) {
                    toast.error('ネットワークエラー。接続を確認してください。');
                } else {
                    toast.error(`エラーが発生しました (${status})`);
                }
                break;
        }

        // 個別のコンポーネントでも catch で処理したい場合のためにエラーを投げ返す
        return Promise.reject(error);
    }
);

export default client;