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
この記事は2024/01時点での情報です。
huskyはv8.0.3, lint-stagedはv15.2.0となっています。
どちらもセマンティックバージョニングなので、メジャーバージョンが同じである限りはおそらく問題なく使えるはずです。
:::

# TL;DR

husky + lint-stagedのインストールは以下をコピーアンドペーストして実行してください。

```shell
npx husky-init && npm install && npm install --save-dev lint-staged && npx husky set .husky/pre-commit "npx lint-staged"
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

## lint-staged とは

lint-stagedとは、Gitでステージ上の、つまり変更されたファイルに対してのみlintやformatをするためのnpmライブラリです。

https://github.com/okonet/lint-staged

# husky + lint-staged のインストール

:::message
`git init` と `npm init` はすでに実行されているものとします。
:::

1. `npx husky-init`

ドキュメントにあるとおり、以下を実行します。

https://typicode.github.io/husky/#/?id=automatic-recommended

```shell
npx husky-init
```

`package.json` に次の通り追加されます。

```diff json:package.json
+ "devDependencies": {
+   "husky": "^8.0.0"
+ },
+ "scripts": {
+   "prepare": "husky install"
+ }
```

※`scripts` の **`prepare`** は特殊で、`npm install` の前に自動で実行されます。

詳細は↓を読んでください。

https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts

また、`.husky` ディレクトリも作成されます。
この中身は基本的に触らない方が良いです。(`pre-commit`は編集してもいいのですが、コマンドで管理できるのでそちらの方が安全です。)

2. `npm install`

まだ依存関係が `package.json` に記述されただけなので、実際にインストールします。
前述の通り、`prepare` の `husky install` も自動で実行されます。

```shell
npm install
```

3. `npm install --save-dev lint-staged`

`lint-staged` を追加します。

```shell
npm install --save-dev lint-staged
```

4. `npx husky set .husky/pre-commit "npx lint-staged"`

`.husky/pre-commit` にlint-stagedを実行するよう設定します。
手動で編集しても問題はないですが、安全のためコマンドで編集することをおすすめします。

```shell
npx husky set .husky/pre-commit "npx lint-staged"
```

これによって、`.husky/pre-commit` が次のように編集され、`pre-commit` フックでlint-stagedが実行されるようになります。

```diff shell:.husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

- npm test
+ npx lint-staged
```

:::message
`~ husky add ~` としている解説もありますが、`npm test` を上書きするために `~ husky set ~` を用いています。
:::

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

# もう動かない方法

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
https://blog.typicode.com/husky-git-hooks-javascript-config/
