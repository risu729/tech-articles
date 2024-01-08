---
title: "__dirname, __filename を ES Modules で使う方法"
emoji: "📦"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "esm", "nodejs", "bun", "deno"]
published: true
---

# Node.js v21.2.0以上

```js
const __dirname = import.meta.dirname;
const __filename = import.meta.filename;
```

https://nodejs.org/api/esm.html#importmetadirname

次のPRで[v21.2.0](https://nodejs.org/en/blog/release/v21.2.0)から追加されました。

https://github.com/nodejs/node/pull/48740

# Bun

```js
const __dirname = import.meta.dir;
const __filename = import.meta.path;
```

`import.meta.file` はファイル名であり、ファイルへのパスではないので注意が必要です。

https://bun.sh/docs/api/import-meta

Node.jsとの互換性が無いのでIssueを立てたところ、PRを出してくださった方がいました。
ただ、今のところまだマージされていません。

// TODO: link of pr

:::message alert
BunではCJSも扱えるので、`__dirname`, `__filename` もそのまま使えますが、非推奨(deprecated)になっているので使うべきではありません。
:::

# Node.js v21.2.0未満 / Deno

```js
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

次のESLintの開発者さんの記事を参照しました。

https://humanwhocodes.com/snippets/2023/01/mimicking-dirname-filename-nodejs-esm/

`import.meta.url` は自身のモジュールへの `file://` で始まるURIです。
これを `fileURLToPath` でパスに変換することで `__filename` を取得できます。
また、そのディレクトリ名を `path.dirname` で取得することで `__dirname` も取得できます。

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
