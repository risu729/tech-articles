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

上の設定でDependabotをnpmに対して適用した場合、Dependabotのページ(Insights > Dependency graph > Dependabot)に次のエラーが表示されます。

```shell-session
Dependabot can't resolve your JavaScript dependency files
Dependabot failed to update your dependencies because there was an error resolving your JavaScript dependency files.

Dependabot encountered the following error:

Dependabot uses Node.js v16.20.0
 and NPM 8.19.4
. Due to the engine-strict setting, the update will not succeed.
```

エラーメッセージに書いてあるとおり、`engines` を指定していても、Dependabotは無視して特定のバージョンで走るので `engine-strict` によってエラーを吐いて停止しています。

# 解決策

1. `engine-strict` を `false` にする

2. `engines` でDependabotが使っているバージョンを含める

3. `Dependabot` の使用を諦める

このいずれかしかありません。

:::message
2の方法を用いる場合、DependabotのDockerfile (↓) にNode.js, npm, yarn, pnpmのバージョンが記載されています。
:::

https://github.com/dependabot/dependabot-core/blob/main/npm_and_yarn/Dockerfile

# GitHub の対応について

https://github.com/dependabot/dependabot-core/issues/4072#issuecomment-1413222679

上のIssueへのコメントに記載されていることを以下に要約しました。詳しく知りたい場合は原文をあたってみてください。

- `package.json` を読んで `node`, `npm` のバージョンを切り替えるとDependabotの実行が遅くなってしまう。

- バージョンを切り替えられるようにすると、多くのバージョンをサポートしなければならなくなる。

- `engine-strict` を無視するようにもできるが、`engine-strict` の意味がなくなる。

これらの理由からこの問題は少なくともすぐには修正されないようです。諦めましょう。
