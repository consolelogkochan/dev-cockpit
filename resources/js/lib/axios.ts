import axios from 'axios';

// Axiosのインスタンスを作成
const client = axios.create({
    baseURL: 'http://localhost', // APIのベースURL
    headers: {
        'X-Requested-With': 'XMLHttpRequest', // Ajax通信であることを明示
    },
    withCredentials: true, // ★重要: これでクッキー(セッション)を自動で送受信します
});

export default client;