---
title: "【Google OAuth】「アクセスをブロック: xxxはGoogleの審査プロセスを完了していません」エラーの対処法"
emoji: "🚫"
type: "tech" # tech: 技術記事 / idea: アイデア
# cspell:ignore googlecloud
topics: ["googlecloud", "oauth"]
publication_name: "larva06"
published: true
---

# エラーの概要

Google OAuthの認証画面で「アクセスをブロック: cloudflareaccess.comはGoogleの審査プロセスを完了していません」「エラー 403: access_denied」と表示されました。

<!-- cspell:ignore cloudflareaccess -->

:::details エラーメッセージ

> アクセスをブロック: cloudflareaccess.comはGoogleの審査プロセスを完了していません
> cloudflareaccess.comはGoogleの審査プロセスを完了していません。このアプリは現在テスト中で、デベロッパーに承認されたテスターのみがアクセスできます。アクセス権があると思われる場合は、デベロッパーにお問い合わせください。
> cloudflareaccess.comのデベロッパーの場合は、エラーの詳細をご確認ください。
> エラー 403: access_denied

:::

![アクセスをブロック:cloudflareaccess.comはGoogleの審査プロセスを完了していません。](/images/google-oauth-access-blocked-error/access-blocked-403-ja.png)

私の場合、Cloudflare Zero Trustの認証にGoogle OAuthを使っているのですが、一部のGoogleアカウントでのみこのエラーが発生しました。
Cloudflare Zero Trustでアクセスを許可していないアカウントでログインしても、本来このエラーにはならず、Cloudflareのエラー画面が表示されます。

ちなみに、英語でのエラーメッセージは次の通りです。

:::details エラーメッセージ

> Access blocked: cloudflareaccess.com has not completed the Google verification process
> cloudflareaccess.com has not completed the Google verification process. The app is currently being tested, and can only be accessed by developer-approved testers. If you think you should have access, contact the developer.
> If you are a developer of cloudflareaccess.com, see error details.
> Error 403: access_denied

:::

![Access blocked: cloudflareaccess.com has not completed the Google verification process](/images/google-oauth-access-blocked-error/access-blocked-403-en.png)

# 原因

不明です!!!

もちろん、Google OAuthの審査プロセスを完了していないことが原因ですが、一部のアカウントでのみ発生する原因はわかりませんでした。
Googleアカウントの設定かと思ったのですが、私のアカウント(1/7でエラー発生)はすべて2FAを有効化しており、他にも異なる設定も特にありませんでした。
また、レートリミットのような一時的なエラーかと思いましたが、時間を空けてもエラーが発生するうえ、同時に試した別のアカウントではエラーが発生しませんでした。

Google Workspaceのドキュメントには、「世界のユーザー数が100人未満の未確認のサードパーティ製アプリ」には制限は適用されないと書かれていますが、それ以外の明確な情報は見つかりませんでした。
(試したアカウントはGoogle Workspaceのアカウントではありませんでした。)
https://support.google.com/a/answer/9352843?hl=ja

ちなみに、Google Workspaceのアカウント(学校のアカウント)で試したところ、次のようなエラーが発生しました。
おそらく、管理者側の設定で制限がかかっているのだと思われます。
ただ、これは400エラーで、403エラーとは異なることがわかります。

:::details エラーメッセージ

> Access blocked: Your institution's admin needs to review cloudflareaccess.com
> You can't access this app until an admin at your institution reviews and configures access for it. If you need access to this app,
> Request access
> If you are a developer of cloudflareaccess.com, see error details.
> Error 400: access_not_configured

:::

![Access blocked: Your institution's admin needs to review cloudflareaccess.com](/images/google-oauth-access-blocked-error/access-blocked-400.png)

また、Google Identityのドキュメントには、次のような記述があります。
ただ、これも「警告は表示されません。」と書かれていますので、おそらく原因ではないと思われます。

> 現在、更新トークンの上限は、OAuth 2.0 クライアント ID ごとに、Google アカウントあたり 100 個です。 上限に達した場合、新しい更新トークンを作成すると、自動的に最も古い更新トークンが無効化され、警告は表示されません。この上限はサービス アカウントには適用されません。

https://developers.google.com/identity/protocols/oauth2?hl=ja

<!-- textlint-disable ja-technical-writing/ja-no-weak-phrase -->

そもそも、「デベロッパーに追加されたテスター」以外もアクセスできている状況が想定された動作でなく、エラーが発生すべきなのかもしれません。

<!-- textlint-enable ja-technical-writing/ja-no-weak-phrase -->

何か詳しい原因をご存じの方がいれば、教えていただけると助かります。

# 対処法

Googleの審査プロセスを完了する必要があります。
これはGoogle OAuthを認証のためだけに使っていてユーザーのデータにアクセスしない場合など、特にスコープを要求しなければ審査は必要なく、単にボタンを押すだけで完了します。
ただ、OAuth同意画面にアイコンを設定している場合など、他にも審査が必要になる場合があります。

## 手順

1. OAuth同意画面(OAuth Consent Screen)の設定を開く
   (Publishing statusがTestingになっている場合は、審査が完了していない状態)

![OAuth Consent Screen](/images/google-oauth-access-blocked-error/oauth-consent-screen-testing.png)

2. `PUBLISH APP` ボタンをクリックして、確認画面で `CONFIRM` を押す

![Push to production?](/images/google-oauth-access-blocked-error/oauth-consent-screen-form.png)

3. 完了 (Publishing statusがIn productionになる)

![OAuth Consent Screen](/images/google-oauth-access-blocked-error/oauth-consent-screen-in-prod.png)

以上で、審査プロセスが完了し、エラーが解消されます。
