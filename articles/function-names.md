---
title: "【Java】関数型インターフェースの覚え方 Consumer<T> = Function<T, Void>"
emoji: "🔗"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["java"]
published: true
---

# はじめに

Javaの関数型インターフェースの名前って覚えにくいですよね。
Function, Supplier, Consumer, Predicate... しかもプリミティブ型はそれぞれ型がありますし、Biとかもあります。
ということで、私なりの覚え方を文章化してみました。お役に立てば幸いです。

# 関数型インターフェースとは

`java.util.function` パッケージ下のインターフェースだったり、`@FunctionalInterface` アノテーションがついたインターフェースだったりと言われていますが、実はどちらも不正確です。

[Java Language Specification 9.8 Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se17/html/jls-9.html#jls-9.8)に定義が記されています。
> A functional interface is an interface that is not declared sealed and has just one abstract method (aside from the methods of Object), and thus represents a single function contract.
> This "single" method may take the form of multiple abstract methods with override-equivalent signatures inherited from superinterfaces; in this case, the inherited methods logically represent a single method.

2文目は細かい条件を定義しているだけなので無視して(詳細は上のリンクに記載されています)、1文目をDeepL先生に訳してもらったのがこちらです。
> 関数型インターフェースとは、sealed宣言されておらず、（Objectのメソッドは別として）ただ1つのabstractメソッドを持つインターフェースであり、したがって単一の関数契約を表しているものである。

つまり、abstractメソッドが1つだけ含まれているインターフェースです。
`java.util.function` パッケージは良く使う形の関数型インターフェースを集めたに過ぎず、`@FunctionalInterface` アノテーションは関数型インターフェースであると示しているに過ぎません。
(`@FunctionalInterface` をつけていて関数型インターフェースでないとコンパイルエラーになります。`@Override` みたいな感じですね)

`abstract`メソッドがただ1つなら良いので、`default`, `static`, `private`メソッドは含まれていても問題ありません。実際、[`Function`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/function/Function.html) は`default`メソッドを、[`Predicate`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/function/Predicate.html) は `default`, `static` メソッドを含んでいます。

ラムダ式を使って表されることが多いですが、実態は上記の通りなので普通に関数型インターフェースを実装したクラスを作っても動きます。

:::details 詳細

- 「`sealed`宣言されていない」は、実装できる型を制限していないという意味です。(Java 17で追加された機能)
- 「`Object` のメソッドは別にして」は、`Object` クラスのメソッド(`equals`, `hashCode`, `toString`, etc...)は含まないという意味ですが、`abstract` メソッドはそもそも `Object` クラス(というか具象クラス)に含まれていないので意味がないような気がします。
:::

以下2記事がシンタックスシュガー(?)についてわかりやすいです。
https://qiita.com/sano1202/items/64593e8e981e8d6439d3
https://qiita.com/sano1202/items/40cc8a0e29def0c76fa8

# 覚え方

**全ての関数型インターフェースは `Function<T,R>` の派生であると考えます。**

例えば、`Consumer<T>` は `Function<T,R>` の仮型引数Rが `Void` である場合、という感じです。
こうすると、ラムダ式の `(String a) -> {return Integer.valueOf(a)}` という表記の左側をT、右側の `return` を `R` と考えられます。

:::message
実際とは異なります。`Consumer<T>` は `Function<T, Void>` を継承していないので、親子関係にはありません。
※`UnaryOperator<T>` は例外的に `Function<T, T>` を継承しています。
:::

[`java.util.function`パッケージ](https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/function/package-summary.html)の関数型インターフェースをこの考え方で表すと以下のようになります。

- `Function<T,R>`
- `Predicate<T>` => `Function<T, Boolean>`
- `Consumer<T>` => `Function<T, Void>`
- `Supplier<T>` => `Function<Void, T>`
- `UnaryOperator<T>` => `Function<T, T>`
- `IntFunction<R>` => `Function<Integer, R>`
- `ToIntFunction<T>` => `Function<T, Integer>`
- `BiFunction<T, U, R>` => `Function<Pair<T, U>, R>`
  (`Pair<A, B>` は AとBのフィールドを1つずつ持ったレコードのようなものです)

このように整理するとまだ覚えやすいのではないでしょうか。
他の関数型インターフェースも同様に考えられます。

- `ObjDoubleConsumer<T>` => `Function<Pair<T, Double>, Void>`
- `IntToLongFunction` => `Function<Integer, Long>`
- `BooleanSupplier` => `Function<Void, Boolean>`
- `IntPredicate` => `Function<Integer, Boolean>`
- `Runnable` => `Function<Void, Void>`

# なぜプリミティブ型には専用のインターフェースが用意されているか

パフォーマンスのため、らしいです。
`List<Integer>` には配列(`int[]`)があるとはいえ `IntList` が用意されていないですから、Stream APIが速度重視なんでしょう、多分。

ちなみに `CharFunction<R>` とか `FloatFunction<R>` はそもそもないですし、`BooleanSupplier` はあっても `BooleanConsumer` はありません。
使用頻度が低いものはFunction + ラッパークラスを使えばいいのでわざわざ用意されていないということですね。

# おわりに

以上、私なりの覚え方というか整理方法でした。
プリミティブ型のとか `UnaryOperator` とかはパフォーマンスを気にしなければ無理に使わなくてもいいので、とりあえず適当に書いて後から修正するって感じでいいのかなと。
ちなみに、Project Valhallaっていうプリミティブ型を楽に扱えるようにするJavaのプロジェクトがあるので、早く実装されると嬉しいですね。願わくば次のLTS (Java 21)までには…
