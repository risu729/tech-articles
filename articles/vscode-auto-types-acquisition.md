---
title: "【VS Code】 プロジェクトの node_modules から TypeScript の型定義を参照する方法"
emoji: "📚"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["typescript", "vscode", "JavaScript"]
published: true
---

# はじめに

VS Code で TypeScript の開発をしていると、謎の型エラーが表示されました。ライブラリのソースコードを読むと特に自分が間違っているわけではなかったのですが、VS Code の機能のせいで古い型定義が読み込まれていることが原因でした。

# 原因

VC Code IntelliSense は JavaScript で型が見つからない場合に自動で [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) の `@types` を以下のようなパスにダウンロードしてくるようです。

`C:\Users\risu\AppData\Local\Microsoft\TypeScript\5.2\node_modules\@types\eslint\index.d.ts`

このとき、この型定義がプロジェクト内の `node_modules` より優先される上に、すぐには新しいバージョンに更新されないようでエラーを吐いていました。

https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition

ちなみに、なぜ TypeScript でなく JavaScript なのかですが、VS Code では JavaScript ファイルでも `tsconfig.json`, `jsconfig.json` の設定によっては、また `@ts-chck` によって型をチェックします。おそらく TypeScript では自動で型定義をダウンロードすることはありません。私は `lint-staged.config.js` を `TypeScript` のプロジェクト内で書いているときにハマりました…

# 解決方法

VS Code の設定で `typescript.disableAutomaticTypeAcquisition` を `true` にして機能を無効化します。

素の JavaScript プロジェクトで `@types` を `package.json` に追加したくない場合などもありえるので、ユーザー全体で設定するよりかはプロジェクトごとに設定した方がいいかもしれません。

```json:.vscode/settings.json
{
  "typescript.disableAutomaticTypeAcquisition": true
}
```

# 参考

https://stackoverflow.com/questions/53283595/how-do-i-prevent-uninstall-typescript-installing-and-referencing-its-own-typ
