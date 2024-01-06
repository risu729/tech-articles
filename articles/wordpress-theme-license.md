---
title: "WordPressテーマのライセンスはGPLである必要があるのか？"
emoji: "🤔"
type: "idea" # tech: 技術記事 / idea: アイデア
topics: ["wordpress", "license", "gpl"]
published: true
---

# はじめに

:::message alert
この記事は法学なんもわからん一般人によって書かれています。法的に間違ったことが書かれている可能性も多分にありますし、間違っていても責任は取れません。
:::

WordPress テーマを開発するにあたり、ライセンスについて調べていたのですがかなり複雑だったのでまとめました。

ネットの情報を元にしており、法律家に相談したわけではありません。何か小さなことでも間違っていたら/他の解釈があったら教えていただけると嬉しいです。

# WordPress のライセンス

**GPLv2** (or later) です。
https://wordpress.org/about/license/

# GPL とは？

**GNU General Public License** の略です。

Free Software License で、自由なソフトウェアを広めることを目的としています。GPL汚染という言葉もあるように、GPLライセンスのソフトウェアを使ったソフトウェア(派生著作物, derivative work)はGPLで再配布しなければなりません。

https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html

GPL について詳しくは以下のサイトがわかりやすくおすすめです。
https://wa3.i-3-i.info/word13200.html

# WordPress テーマは派生著作物なのか？

派生著作物です。WordPress 公式がそう言及しています。

> Part of this license outlines requirements for derivative works, such as plugins or themes. Derivatives of WordPress code inherit the GPL license.

> このライセンスには、プラグインやテーマなどの派生著作物に対する必要事項が含まれています。WordPressのコードの派生著作物は、GPLライセンスを継承します。

https://wordpress.org/about/license/

ただし、以下のように法的にグレーであるとも示されています。個人的には書かれている通り、グレーな部分を突いてまでGPLにしたくないのなら WordPress を使わない方がいいと思いますが…

> There is some legal grey area regarding what is considered a derivative work, but we feel strongly that plugins and themes are derivative work and thus inherit the GPL license. If you disagree, you might want to consider a non-GPL platform such as Serendipity (BSD license) instead.

> 何が派生著作物と捉えられるかは、法的にグレーな部分があります。しかし、私たちはプラグインやテーマが派生著作物でありGPLライセンスを継承しなければならないと強く考えています。もしこの考えに賛同できないなら、GPLでないプラットフォーム、例えばBSDライセンスのSerendipityなどを使用することを推奨します。

:::message
日本語訳は適当で公式のものではありません。
:::

# 画像・CSSについて

https://wordpress.org/news/2009/07/themes-are-gpl-too/

画像とCSSは WordPress のプログラムから直接読み取られるわけではなく、単にデータとして公開されているのでGPLにおける派生著作物にあたらないという解釈が示されています。

> In conclusion, the WordPress themes supplied contain elements that are derivative of WordPress’s copyrighted code. These themes, being collections of distinct works (images, CSS files, PHP files), need not be GPL-licensed as a whole. Rather, the PHP files are subject to the requirements of the GPL while the images and CSS are not. Third-party developers of such themes may apply restrictive copyrights to these elements if they wish.

> WordPressの著作権で保護されたコードから派生した要素が含まれているのテーマは、異なる著作物(画像、CSSファイル、PHPファイル)の集合体であり、全体としてGPLライセンスを適用する必要はありません。PHPファイルはGPLライセンスの対象になりますが、画像とCSSはなりません。サードパーティの開発者が望むなら、これらに制限的な著作権を適用することができます。

ただし、WordPress.org 公式のプラグイン/テーマディレクトリで配布するためには、100%GPL、つまり画像やCSSもGPLライセンスで配布されている必要があります。(GPLでないと審査に通りません。)

以下の記事で日本語で解説されています。
https://ja.wordpress.org/about/license/100-percent-gpl/

# 公開は義務ではない

https://www.gnu.org/licenses/gpl-faq.en.html#GPLRequireSourcePostedPublic

公開は、そのプログラムを渡す際に義務が発生します。なので、有償でテーマを販売した場合でもそのテーマはGPLになるので、購入者は自由に(有償でも無償でも)再配布できます。

ただ、例えばテーマを特定のWebサイトのために開発した場合は、その運営者のみに渡すことになるので、GPLライセンスでもその運営者が再配布しなければ公開はされません。

もし自分(もしくは所属している組織)でテーマを使用するなら、そもそもプログラムを渡すことがないので、公開する義務ももちろんありません。

また、テーマは WordPress の一部としてサーバー上で動作します。この際、ソフトウェア自体がWebサイトの閲覧者に提供されているわけではないので、閲覧者に対しての公開義務は発生しません。

# GPL違反のテーマがたくさんある件

この記事がわかりやすく世知辛い現況を解説していました。ぜひ読んでみてください。

https://capitalp.jp/2018/02/07/how-is-gpl-busness/

# おまけ

WordPress とあんまり関係ないです。

## AGPL について

**GNU Affero General Public License** の略です。

https://www.gnu.org/licenses/agpl-3.0.en.html

前述したテーマはサーバー上で動作するのでソースコードの公開義務がない、というGPLの抜け穴を塞ぐための条項が追加されたライセンスです。サーバー上で動作するプログラムに関しても、動作しているバージョンに対応したソースコードを利用者が入手できるようにする義務が定められています。

https://www.gnu.org/licenses/why-affero-gpl.en.html

## GPL のバージョンについて

WordPress など、GPLv2 or later として配布されている場合は、GPLv3 を用いても問題ありません。特許に関する部分が明確に示されているようですが、WordPressテーマにおいては関係ないかもしれません。私は新しいもの好きなのでv3にしています()

https://www.gnu.org/licenses/gpl-faq.en.html#v2v3Compatibility
