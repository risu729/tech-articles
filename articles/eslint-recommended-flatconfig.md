---
title: "【ESLint】 Flat Config で eslint:recommended, eslint:all を使う"
emoji: "📜"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["eslint"]
published: true
---

# TL;DR

```js:eslint.config.js
import js from "@eslint/js";
export default [
  js.configs.recommended,
  // or
  js.configs.all,
]
```

:::message
`@eslint/js` は `eslint` の依存に含まれているのでそのまま使えます。
:::

https://eslint.org/docs/latest/use/configure/configuration-files-new#using-predefined-configurations

# Flat Config とは？

Flat Config とは、2022/8/1 の **v8.21.0** で導入された ESLint の新しい設定方法です。 
既存の記法とは大きく異なり、ファイル名も `eslint.config.js` にしかできません。

公式ドキュメント:
https://eslint.org/docs/latest/use/configure/configuration-files-new

解説記事:
※とても分かりやすい記事なのですが、2022/08/12のものなので一部(
**`eslint:recommended`, `eslint:all`含む**)変更されています。
https://zenn.dev/makotot/articles/0d9184f3dde858

# 本題

上の解説記事に書かれていた以下の記法が変わっていました。

```js
// ESLintのあらかじめ用意された eslint:recommended、eslint:all のconfigは文字列で配列に含めることができる。
"eslint:recommended",
```

2023/2/26 の **v8.35.0** で変更されたようです。

`@eslint/js` という新しいパッケージを使うようになっています。(`@eslint/js` は `eslint` の `dependencies` に含まれているので、`devDependencies` に追加しなくても大丈夫です。)

```js:eslint.config.js
import js from "@eslint/js";
export default [
  js.configs.recommended,
  // or
  js.configs.all,
]
```

PR:
https://github.com/eslint/eslint/pull/16844

ちなみに、古い記法で書くと↓の警告が出ます。
> Warning: The 'eslint:recommended' string configuration is deprecated and will be replaced by the @eslint/js package's 'recommended' config.

Docs にこの `predefined-configurations` についての章もあります。

https://eslint.org/docs/latest/use/configure/configuration-files-new#using-predefined-configurations

# おわりに

Flat Config を使っていてこの仕様に気が付いたのですが、まだ新しいこともあって情報が少ないですね…
ただ、かなり分かりやすく便利にはなっていたので、できるだけこちらを使うようにしたいです。
