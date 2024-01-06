---
title: "Dependabot が engine-strict を設定していると動かない件"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["npm", "dependabot", "github"]
published: true
---

# 何が起こるのか

```json:package.json
"engines": {
    "node": ">=20.0.0",
    "npm": ">=9.6.4"
}
```

```:.npmrc
engine-strict=true
```

このような設定で Dependabot を npm に対して適用した場合、Dependabot のページ(Insights > Dependency graph > Dependabot)に以下のエラーが表示されます。

```shell-session
Dependabot can't resolve your JavaScript dependency files
Dependabot failed to update your dependencies because there was an error resolving your JavaScript dependency files.

Dependabot encountered the following error:

Dependabot uses Node.js v16.20.0
 and NPM 8.19.4
. Due to the engine-strict setting, the update will not succeed.
```

エラーメッセージに書いてある通りなのですが、`engines` を指定していても、Dependabot は無視して特定のバージョンで走るので `engine-strict` によってエラーを吐いて停止しています。

# 解決策

1. `engine-strict` を `false` にする

2. `engines` で Dependabot が使っているバージョンを含める

3. `Dependabot` の使用を諦める

このいずれかしかありません。

:::message
2 の方法を用いる場合、2023/5/6 時点で Node.js はv16.20.0、npm は 8.19.4 が使われていましたが、更新されるのでエラーメッセージから判断すると良いです。
:::

:::message
2023/9/23 更新
Dependabot の Dockerfile (↓) に Node.js, npm, yarn, pnpm のバージョンが記載されるようになっていました！
:::

https://github.com/dependabot/dependabot-core/blob/main/npm_and_yarn/Dockerfile

# GitHub の対応について

https://github.com/dependabot/dependabot-core/issues/4072#issuecomment-1413222679

上の Issue へのコメントに記載されていることを以下に要約しました。詳しく知りたい場合は原文をあたってみてください。

- `package.json` を読んで `node`, `npm` のバージョンを切り替えると Dependabot の実行が遅くなってしまう。

- バージョンを切り替えられるようにすると、多くのバージョンをサポートしなければならなくなる。

- `engine-strict` を無視するようにもできるが、`engine-strict` の意味がなくなる。

これらの理由からこの問題は少なくともすぐには修正されないようです。諦めましょう。

# Yarn と pnpm について

Yarn と pnpm については検証していませんが、おそらく同様の挙動になると思われます。
もし検証してくださる方がいればコメントに残していただけると助かります。

~~pnpm は 2023/5/13 現在、Dependabot でサポートされていません。
以下の通りクローズドベータは開始されているようです。
https://github.com/dependabot/dependabot-core/issues/1736#issuecomment-1527947075~~
↑サポートされました！

これらのバージョンについても以下の Dockerfile に記載されています。
https://github.com/dependabot/dependabot-core/blob/main/npm_and_yarn/Dockerfile
