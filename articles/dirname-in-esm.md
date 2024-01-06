---
title: "__dirname, __filename を ES Modules で使う方法"
emoji: "📦"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "esm"]
published: true
---

# 結論

```js
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

以下の ESLint の開発者さんの記事を参照しました。

https://humanwhocodes.com/snippets/2023/01/mimicking-dirname-filename-nodejs-esm/

# 解説

ES Modules (ESM) で `__dirname`, `__filename` は使えなくなりましたが、同様のものを自身で取ることはできます。

`import.meta.url` は自身のモジュールへのURLです。Node.js においては `file://` で始まるパスになります。

これを `fileURLToPath` でパスに変換することで `__filename` を取得できます。また、そのディレクトリ名を `path.dirname` で取得することで `__dirname` も取得できます。

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
