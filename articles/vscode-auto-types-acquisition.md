---
title: "【VS Code】 プロジェクトの node_modules から TypeScript の型定義を参照する方法"
emoji: "📚"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["typescript", "vscode", "JavaScript"]
published: true
---

# はじめに

VS CodeでTypeScriptの開発をしていると、謎の型エラーが表示されました。ライブラリのソースコードを読むと特に自分が間違っているわけではなかったのですが、VS Codeの機能のせいで古い型定義が読み込まれていることが原因でした。

# 原因

VC Code IntelliSenseはJavaScriptで型が見つからない場合に自動で [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) の `@types` を次のようなパスにダウンロードしてくるようです。

`C:\Users\risu\AppData\Local\Microsoft\TypeScript\5.2\node_modules\@types\eslint\index.d.ts`

このとき、この型定義がプロジェクト内の `node_modules` より優先される上に、すぐには新しいバージョンに更新されないようでエラーを吐いていました。

https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition

ちなみに、なぜTypeScriptでなくJavaScriptなのかですが、VS Codeは `tsconfig.json`, `jsconfig.json` の設定、また `@ts-check` によってJavaScriptの型もチェックします。
おそらくTypeScriptでは自動で型定義をダウンロードすることはありません。
私は `lint-staged.config.js` をTypeScriptのプロジェクト内で書いているときにハマりました…

# 解決方法

VS Codeの設定で `typescript.disableAutomaticTypeAcquisition` を `true` にして機能を無効化します。

素のJavaScriptプロジェクトで `@types` を `package.json` に追加したくない場合などもありえるので、ユーザー全体で設定するよりかはプロジェクトごとに設定するほうが良いでしょう。

```json:.vscode/settings.json
{
  "typescript.disableAutomaticTypeAcquisition": true
}
```

# 参考

https://stackoverflow.com/questions/53283595/how-do-i-prevent-uninstall-typescript-installing-and-referencing-its-own-typ
