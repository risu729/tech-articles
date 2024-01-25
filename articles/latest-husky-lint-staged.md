---
title: "【2024/01最新】husky + lint-staged でコミット前にlintを強制する方法"
emoji: "🚫"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["husky", "lintstaged", "eslint", "javascript", "git"]
published: true
---

# はじめに

huskyのアプデの影響か古い情報が多く、適当にネットの情報を鵜呑みにしたら動かなかったので書きました。

:::message alert
この記事は2024/01/25時点での情報です。
huskyはv9.0.1, lint-stagedはv15.2.0となっています。
どちらもセマンティックバージョニングなので、メジャーバージョンが同じである限りはおそらく問題なく使えるはずです。
:::

# TL;DR

husky + lint-stagedのインストールは以下をコピーアンドペーストして実行してください。

```shell
npm install --save-dev husky lint-staged && npx husky init && echo "npx lint-staged" > .husky/pre-commit
```

lint-stagedの設定は、READMEの #Configurationを読みましょう。

https://github.com/okonet/lint-staged#Configuration

---

# lint を強制したいわけ

lintを強制しないと、忘れたり面倒になって適当なコードのままcommit, pushしてしまうことがあります。ありました。
また、複数人で開発している場合はルールを共有するためにも有効でしょう。
husky, lint-stagedを用いると、lintを通過しないコードはcommitすらできないようにできます。(故意に無視しようとしない限り)

## Git フック とは

Gitで特定のコマンドの実行前後にスクリプトを実行するための仕組みです。

https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA-Git-%E3%83%95%E3%83%83%E3%82%AF

## husky とは

huskyとは、Gitフックで任意のプログラムを実行するためのnpmライブラリです。

https://github.com/typicode/husky

https://typicode.github.io/husky/

## lint-staged とは

lint-stagedとは、Gitでステージ上の、つまり変更されたファイルに対してのみlintやformatをするためのnpmライブラリです。

https://github.com/okonet/lint-staged

# husky + lint-staged のインストール

:::message
`git init` と `npm init` はすでに実行されているものとします。
:::

1. `npm install --save-dev husky lint-staged`

`husky`, `lint-staged` を `devDependencies` に追加します。

```shell
npm install --save-dev husky lint-staged
```

2. `npx husky init`

ドキュメントにあるとおり、以下を実行します。

https://typicode.github.io/husky/get-started.html#install

```shell
npx husky init
```

`package.json` に次の通り追加されます。

```diff json:package.json
+ "scripts": {
+   "prepare": "husky"
+ }
```

※`scripts` の **`prepare`** は特殊で、`npm install` の前に自動で実行されます。

詳細は↓を読んでください。

https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts

また、`.husky/pre-commit` が作成されます。
このファイルは、`pre-commit` フックで実行されるスクリプトを記述するためのものです。
他のフックについても、`.husky/` 以下にファイルを作成することで設定できます。(`commit-msg` など)

4. `echo "npx lint-staged" > .husky/pre-commit`

`pre-commit` フックでlint-stagedが実行されるように設定します。
VS Codeなどから手動で編集することもできます。

```shell
echo "npx lint-staged" > .husky/pre-commit
```

```diff shell:.husky/pre-commit
- npm test
+ npx lint-staged
```

`npm test` は例として追加されているだけなので、削除して問題ありません。

以上でhusky + lint-stagedのインストールは完了です。

# lint-staged の設定

例えば、このように設定することですべての `.ts` `.tsx` ファイルがコミットされる前に `prettier` を実行できます。

```json:package.json
{
  "lint-staged": {
    "*.{ts,tsx}": "prettier --write"
  }
}
```

詳しくは↓を読んでください。

https://github.com/okonet/lint-staged#Configuration

# もう動かない・必要ない方法

## `package.json#hooks`

```json:package.json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
}
```

2021/3/26のhusky v5で、このように `package.json` で設定する方法はサポートされなくなりました。
どういうわけか2022年の記事にも書かれていたりしましたが、これは(v5以上を使っている限り)無意味です。

詳しくは次の開発者の書いた記事を読んでください。
https://blog.typicode.com/posts/husky-git-hooks-javascript-config/

## `npx husky-init`

2024/01/25のhusky v9で、`npx husky-init` は使われなくなりました。
`devDependencies` に `husky` を追加してから、`npx husky init` を実行する必要があります。

## `npx husky set`, `npx husky add`

2024/01/25のhusky v9で、`npx husky set`, `npx husky add` は使われなくなりました。
手動で `.husky/` 内のファイルを編集する必要があります。

また、husky v8までは、次のようなshebangとスクリプトがファイルの先頭にありましたが、husky v9からは不要になりました。

```shell:.husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
```

## `git add --chmod=+x .husky/pre-commit`

husky v8まで、Windowsでは `git add --chmod=+x .husky/pre-commit` として、`.husky/pre-commit` を実行可能にする必要がありました。
2024/01/25のhusky v9で、`.husky/` 内のファイルは実行可能でなくても問題なくなったので、これは不要です。
