<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangeNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // フロントエンドの検証ページURL
        // React側のルート設定に合わせてパスを指定します
        $url = url("/verify-email?token={$this->token}");

        return (new MailMessage)
            ->subject('【重要】メールアドレス変更の確認')
            ->line('メールアドレスの変更リクエストを受け付けました。')
            ->line('まだ変更は完了していません。以下のボタンをクリックして、新しいメールアドレスを有効化してください。')
            ->action('変更を完了する', $url)
            ->line('もしこの変更に身に覚えがない場合は、このメールを無視してください。');
    }
}
