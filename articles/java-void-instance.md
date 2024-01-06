---
title: "Java 20 で java.lang.Void をインスタンス化する"
emoji: "🕳️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["java"]
published: true
---

# はじめに

以下の記事を見て自分でもやってみようと思い立ちました。ありがとうございます。

https://qiita.com/momosetkn/items/57e814088026dbd4480c

# Void クラスとは

`void` を表す `Class` オブジェクト、`Void.TYPE` を持った一般にはインスタンス化できないクラスです。

`Integer.TYPE` と似た感じですね。

> The Void class is an uninstantiable placeholder class to hold a reference to the Class object representing the Java keyword void.

https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Void.html

# インスタンス化する

インスタンス化は前述のとおりできないようになっているのですが、リフレクションを使えば可能です。

```shell
java --add-opens java.base/java.lang=ALL-UNNAMED Main.java
```

```java:Main.java
package io.github.risu729.getvoid;

import java.lang.reflect.InvocationTargetException;

class Main {

    public static void main(String[] args) throws Exception {
        System.out.println(getVoid());
        // java.lang.Void@23a5fd2
    }

    private static Void getVoid() throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        var constructor = Void.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }
}
```

この取得したインスタンスは何か特別なわけではなく、`Object` のインスタンスとほとんど変わりません。
使われないので当たり前ですが、一切オーバーライドがなされていないので。

## java コマンドの解説

### `java Main.java` について

Java 11 の [JEP 330: Launch Single-File Source-Code Programs](https://openjdk.org/jeps/330) によって、単一の java ファイルの実行であれば、`javac` でコンパイルする必要がなくなりました。`java` コマンドで java ファイルを指定すればそのまま実行できます。

[JEP draft: Launch Multi-File Source-Code Programs](https://openjdk.org/jeps/8304400) にこれを複数ファイルでも使えるようにする提案も上がっています。

### `--add-opens` について

Java 17 の [JEP 403: Strongly Encapsulate JDK Internals](https://openjdk.org/jeps/403) によって、JDK内部APIへのアクセスが制限が強化されました。

上のコードでは `module-info.java` を用意していないので、`Main` クラスは無名モジュールとなっています。 `--add-opens java.base/java.lang=ALL-UNNAMED` とすることで、`java.base/java.lang` モジュールへのアクセスを `ALL-UNNAMED` (無名モジュール) に許可します。

[java コマンドのドキュメント](https://docs.oracle.com/en/java/javase/20/docs/specs/man/java.html#extra-options-for-java) に `--add-opens` について記載されています。`--add-exports` というオプションもありますが、こちらは `public` なメンバーにのみアクセスできるようにするものでリフレクションは使うことができません。

これらのオプションは Java 9 の [JEP 261: Module System](https://openjdk.org/jeps/261) から導入されています。

ちなみにこのオプションがないと以下のように `InaccessibleObjectException` が発生します。

```shell-session
Exception in thread "main" java.lang.reflect.InaccessibleObjectException: Unable to make private java.lang.Void() accessible: module java.base does not "opens java.lang" to unnamed module @78a2da20
        at java.base/java.lang.reflect.AccessibleObject.throwInaccessibleObjectException(AccessibleObject.java:387)
        at java.base/java.lang.reflect.AccessibleObject.checkCanSetAccessible(AccessibleObject.java:363)
        at java.base/java.lang.reflect.AccessibleObject.checkCanSetAccessible(AccessibleObject.java:311)
        at java.base/java.lang.reflect.Constructor.checkCanSetAccessible(Constructor.java:192)
        at java.base/java.lang.reflect.Constructor.setAccessible(Constructor.java:185)
        at io.github.risu729.getvoid.Main.getVoid(Main.java:13)
        at io.github.risu729.getvoid.Main.main(Main.java:7)
```

### `--illegal-access` について

Java 9 の [JEP 261: Module System](https://openjdk.org/jeps/261) で [`--illegal-access`](https://openjdk.org/jeps/261#Relaxed-strong-encapsulation) も追加されていました。 [JEP 260: Encapsulate Most Internal APIs](https://openjdk.org/jeps/260) でカプセル化された内部APIにアクセスできるようにするオプションです。

`permit`, `warn`, `debug`, `deny` のいずれかを指定でき、Java 9～15では `permit` がデフォルトでした。

Java 16 では [JEP 396: Strongly Encapsulate JDK Internals by Default](https://openjdk.org/jeps/396) によって `deny` がデフォルトになりました。

そして、Java 17 の [JEP 403: Strongly Encapsulate JDK Internals](https://openjdk.org/jeps/403) によって、`--illegal-access` 自体がサポートされなくなり、使用すると以下のような警告が表示されるようになりました。

```shell-session
Java HotSpot(TM) 64-Bit Server VM warning: Ignoring option --illegal-access=permit; support was removed in 17.0
```

## `Main` の解説

`Void` クラスは以下のように定義されています。`Void.TYPE` 以外持たずインスタンス化もできないシンプルなクラスです。

https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/lang/Void.java#L26-L49

コンストラクタは `private` なので、インスタンス化するにはコンストラクタを取得、アクセス可能にして、インスタンスを作成する必要があります。

```java
var constructor = Void.class.getDeclaredConstructor();
constructor.setAccessible(true);
return constructor.newInstance();
```

### `Class<T>::getDeclaredConstructor`

[`Class<T>::getDeclaredConstructor`](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Class.html#getDeclaredConstructor(java.lang.Class...)) は [`Class<T>::getConstructor`](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Class.html#getConstructor(java.lang.Class...)) と異なり、`public` でないコンストラクタも取得できます。
このメソッドの引数は、`Class<?>... parameterTypes` とコンストラクタの引数の配列になっていますが、可変長引数なので何も渡さなければ自動的に空の配列が渡されます。

また、[`Class<T>::getDeclaredConstructors`](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Class.html#getDeclaredConstructors()) と [`Class<T>::getConstructors`](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/lang/Class.html#getConstructors()) は、それぞれ単にすべてのコンストラクタ、すべての `public` なコンストラクタを返すメソッドです。
ただし、この2つのメソッドは`Constructor<T>[]` を返すべきですが、`Constructor<?>[]` を返します。

> While this method returns an array of Constructor<T> objects (that is an array of constructors from this class), the return type of this method is Constructor<?>[] and not Constructor<T>[] as might be expected. This less informative return type is necessary since after being returned from this method, the array could be modified to hold Constructor objects for different classes, which would violate the type guarantees of Constructor<T>[].

> このメソッドは Constructor<T> オブジェクトの配列（このクラスのコンストラクタの配列）を返しますが、このメソッドの戻り値は Constructor<?>[] であり、期待されるような Constructor<T>[] ではありません。このメソッドから返された後、配列は異なるクラスのコンストラクタオブジェクトを保持するように変更される可能性があり、Constructor<T>[]の型保証に違反するため、この情報量の少ない戻り値の型が必要です。

とある通り、返された配列に他のコンストラクタが入る可能性があり、入ったときに `Constructor<T>[]` だと型が合わなくなるのでダメらしいです…… ちょっと厳しすぎでは

# おわりに

元の記事を少し簡略化しただけですが、モジュールシステムによって内部APIへのアクセスが厳しくなっていて大変でした。いや普通にコード書く分には影響ないはずなのでむしろ良いことなはずなんですが。
