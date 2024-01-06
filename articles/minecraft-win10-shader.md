---
title: "Minecraft Win10 (BE/統合版) でチャンク境界/信号強度/明るさ表示、暗視のシェーダーを導入する"
emoji: "🐉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["Minecraft", "minecraftbedrock"]
published: true
---

:::message alert
この記事に記載されている内容を実行して発生したいかなる損害についても筆者は責任を負いません。
自己責任で試していただくようお願いします。
:::

# はじめに

Minecraft Bedrock Edition (統合版/以下BEと表記) はRTXのレイトレーシングに対応するため描画エンジンを `glsl/hlsl` から `Render Dragon` という独自に開発したものに切り替えました。
これに伴い旧来のシェーダーは一切使えなくなり、信号強度、チャンク境界の表示、暗視も含む、従来のシェーダーは使えなくなってしまいました。
Mojangは `Render Dragon` でもシェーダーの開発をサポートすると表明していますが、~~2022/11~~2023/2現在全く音沙汰がありません…

しかし、中国の方が描画エンジンのファイルを編集してシェーダーを開発するツール([MaterialBinTool](https://github.com/ddf8196/MaterialBinTool))を制作してくださり、それを使ったシェーダーが公開されています。
これらのシェーダーをWin10版で入れる方法に辿り着くのが大変だったので残しておきます。

この記事では [Useless Shader](https://github.com/OEOTYAN/useless-shaders) を主に紹介しますが、他のシェーダーも同様の方法で導入できます。

# Useless Shader

とても"Usefull"なシェーダーです。
信号強度、チャンク境界を表示できます。また、それらに暗視がついているバージョンもあります。

中国の方が開発してくださったもので、GitHubで公開されています。

https://github.com/OEOTYAN/useless-shaders

![Useless Shader を導入したスクショ](/images/minecraft-win10-shader/screenshot.png)

1. チャンク境界 (Chunk Border)
チャンク境界がブロックに表示されます。スクリーンショットの青い線です。
2. 信号強度 (Signal Strength)
レッドストーンダストに信号強度が表示されます。
3. 明るさ表示 (Light Level)
明るさがブロックに表示されます
左の大きい数字が `Block Light` (松明など光源からの明るさ)、右の小さい数字が `Sky Light` (時間によって変わる空の明るさ) です。
数字の色は(オーバーワールドで)モンスターが湧く明るさ(0)なら赤で、それ以上なら緑で表示されます。
4. 暗視 (Night Vision)
実際の明るさに関わらず明るく表示されます。暗視ポーションよりも強力です。


# ファイルの準備

必要なソフト、ファイルをダウンロードします。

## Useless Shader

**2023/2更新**
[Releases](https://github.com/OEOTYAN/useless-shaders/releases)から最新のバージョン(2023/02/19時点では [useless shaders for render dragon v0.3](https://github.com/OEOTYAN/useless-shaders/releases/tag/v.rd.0.3))の `Assets` から、以下から1つ選んでダウンロードしてください。
1. `RenderChunk.material.bin_default`
チャンク境界 + レッドストーン信号強度
2. `RenderChunk.material.bin_LIGHT_OVERLAY`
チャンク境界 + レッドストーン信号強度 + **明るさ**
3. `RenderChunk.material.bin_NIGHT_VISION`
チャンク境界 + レッドストーン信号強度 + **暗視**
4. `RenderChunk.material.bin_NIGHT_VISION_LIGHT_OVERLAY`
チャンク境界 + レッドストーン信号強度 + **明るさ** + **暗視**

ダウンロードしたら、どのファイルかによらず `_` 以降の末尾を消して、ファイル名を `RenderChunk.material.bin` に変更してください。

## IOBit Unlocker

中国(香港?)のIObit Information Technology社が無料で配布しているファイルのロックを解除するソフトです。

BE Win10 Edition はUWPアプリ(Microsoft Storeからインストールするソフト)なので、Windowsによって保護されていてファイルを編集するのは難しいです。
ファイル/フォルダの所有者や権限を変更したり、robocopyコマンドを使ったりしても、閲覧/削除はできても編集はできませんし、デュアルブートしたLinuxから編集しようとしてもフォルダが見えませんでした。

このソフトを使うことで無理矢理ロックを解除して編集できますが、安全性に疑念があるようです。使用は自己責任でお願いします。

:::message
以下のサイトにて安全性について書かれています。
もし不安であれば読んでみることをおすすめします。
https://eizone.info/iobit-software/
:::

使用する場合、以下の公式サイトからダウンロードして、インストーラーの指示に従ってインストールしてください。

https://jp.iobit.com/pc-optimization-software/iobit-unlocker-free.html

# 描画エンジンの編集

## 元ファイルのバックアップ

まず、描画エンジンの元ファイルをバックアップします。
(しなくても構いませんが、元に戻したい際、Minecraftを再インストールする必要があります)
`C:\Program Files\WindowsApps\Microsoft.MinecraftUWP_[version]\data\renderer\materials\RenderChunk.material.bin` をドラッグしてIOBit Unlockerに追加します。

:::message
`Micorsoft.MinecraftUWP` から始まるフォルダが複数ある場合、最新バージョンのフォルダを選択してください。
:::

解除の右のプルダウンから**解除&コピー**します。
![IOBit Unlockerでバックアップする](/images/minecraft-win10-shader/iobit-backup.png)
「コピーしたオブジェクトの転送先フォルダを選択してください。」と表示されるので、適当な場所に保存してください。

## 元ファイルの削除

次に、元ファイルを削除します。
同様にファイルをIOBit Unlockerに追加し、解除の右のプルダウンから**解除&削除**します。
![IOBit Unlockerで削除する](/images/minecraft-win10-shader/iobit-delete.png)

一度IOBit Unlockerを**終了**して再度起動してください。

## シェーダーの適用

最後に、Useless Shaderのファイルを元のファイルを置き換えるようにコピーします。
ダウンロードした `RenderChunk.material.bin` をIOBit Unlockerに追加します。

解除の右のプルダウンから**解除&コピー**します。
![IOBit Unlockerでコピーする](/images/minecraft-win10-shader/iobit-copy-1.png)

「コピーしたオブジェクトの転送先フォルダを選択してください。」と表示されるので、`C:\Program Files\WindowsApps\Microsoft.MinecraftUWP_[version]\data\renderer\materials` を選択してください。
![IOBit Unlockerでコピーする](/images/minecraft-win10-shader/iobit-copy-2.png)

:::message
先に削除していない場合、コピーに失敗します。削除してからやり直してください。
:::

# Minecraftの起動

以上でシェーダーの導入は完了です。
BEを通常通りの方法で起動してください。機能が反映されているはずです。
描画エンジンを直接編集しているので、シングル、マルチともに機能します。

:::message alert
Minecraftのバージョンアップが行われるとこのシェーダーは消えてしまいます。
バージョンアップの後には同様の操作をしてください。
:::

:::message alert
オンオフを切り替えることはできません。
元に戻す際は最初にバックアップしたファイルを同様の方法で戻すか、Minecraftを再インストールしてください。
再インストールすると全てのデータが消えるので、アンインストールの前に必要なファイルはバックアップしてください。
:::

# 他のシェーダー

同様の方法でRender Dragon向けに開発されたシェーダーもこの方法で入れることができます。(複数のシェーダーは基本的に同時に使用できません)
シェーダーによっては編集する `.material.bin` ファイルが複数あることもあるので、全て削除してから移動するよう注意してください。(IOBit Unlockerは複数ファイルを同時に選択して操作できます)

## [Musk Rose RD](https://github.com/Rinloid/musk_rose_rd)

日本のRinさんが開発されたシェーダーです。Render Dragon導入前からこの方の他のシェーダーを使用していましたがとても綺麗です。

同様に[Releases](https://github.com/Rinloid/musk_rose_rd/releases)からダウンロードできます。
**Musk_Rose_RD_Base.mcpack**も適用する必要があるので注意してください。
https://github.com/Rinloid/musk_rose_rd

# 参考

Elsa55さんの動画を参考に、というか全く同じ方法です。ありがとうございました。
英語ですが文章で分かりにくい部分があれば見てみてください。
https://www.youtube.com/watch?v=qe7m0YRGHs8&t=279s

また、上記の動画は先程紹介したシェーダーの説明で見つけました。それまで何してもダメだったのでありがたい限りです…
(Android/iOS向けの解説動画のリンクもあります)
https://github.com/Rinloid/musk_rose_rd

# 最後に

何か分からない部分やエラーなどがあればできる限り対応しますのでコメントしてください。
