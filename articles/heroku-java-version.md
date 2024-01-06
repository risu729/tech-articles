---
title: "【Heroku】Java/Maven のデフォルトバージョンと変更方法"
emoji: "🍵"
type: "tech"
topics: ["heroku", "java", "maven"]
published: true
---

:::message alert
この記事は2022/07/25時点の情報です。
:::

# デフォルトバージョン

Java: OpenJDK 8 (1.8.0_332)
Maven: 3.6.2

# 変更方法

`system.properties` というファイルをルートディレクトリに作成します。
(ルートディレクトリ以外に置いても認識しませんでした。)

### Java

```:system.properties
java.runtime.version={version}
```

1.7, 1.8, 11, 13, 15, 17, 18 が選択できます。(LTSは1.8, 11, 17)
:::message
他のバージョンは 14, 16のみ、Stack (HerokuでのOSイメージ)が `Heroku-18` か `Heroku-20` の場合は選択できますが、`Heroku-22` の場合は選択できません。(ただし共にサポート終了済)
:::

`{version}` では `1.8.0_202` のようにマイナーバージョンも指定できます。ただし、指定しなければ自動で最新のものに更新されるので、セキュリティ上指定しない方が好ましいようです。

---

### Maven

```:system.properties
maven.version={version}
```

3.2.5, 3.3.9, 3.5.4, 3.6.2 が選択できます。
:::message
Mavenのバージョンは、HerokuのAppを作成した時点のものが使用されデフォルトバージョンに自動でアップデートされることはないようです。
よって、最新版に更新したい場合は(たとえ指定するバージョンがデフォルトでも)指定する必要があります。
(長く運用していると引っかかりそう)
:::

---
Java/Mavenを共に変更する場合は、両方を `system.properties` 内に記載すれば良いです。

# 参考元 (Heroku Dev Center)

最新情報は以下のリンクを参照してください。

https://devcenter.heroku.com/articles/java-support#specifying-a-java-version
https://devcenter.heroku.com/articles/java-support#specifying-a-maven-version
