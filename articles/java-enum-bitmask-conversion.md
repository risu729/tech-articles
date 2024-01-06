---
title: "【Java】ビットマスクとEnumの変換方法"
emoji: "😷"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["java"]
published: true
---

# ビットマスクとは

ビットマスクとは、2進数の整数の各桁(ビット)をフラグに割り当ててフラグの組み合わせを表現するものです。
型は整数なのでintになります。2進数表記するとフラグの組み合わせになるだけで特殊なデータではありません。

詳しくはこちらの記事がわかりやすくおすすめです。
https://qiita.com/drken/items/7c6ff2aa4d8fce1c9361

# Javaにおけるビットマスクの歴史

元々、Javaでは定数の組み合わせの表現にint定数のビット和(AND)=ビットマップが用いられていました。
しかし、定数を引数とすると任意のintが渡せてしまうなどの問題からJava 5でEnumが導入されたという歴史があります。(なのでJava 5以前に実装された標準ライブラリではint定数が用いられていることがあります)

int定数がEnum定数となったことで、ビットマップは `EnumSet` となりました。
プログラムが明確になる上、パフォーマンスも十分なのでビットマップを使うことは推奨されていません。(Effective Java 項目36)
しかし、外部APIとのデータ受け渡しにおいてなどビットマップが用いられていることがあるので、その際に `EnumSet` とビットマスク(int)の変換が必要になります。

# 方法1. Enumクラスに変換メソッドを定義

Enumクラス自体にstaticな変換メソッドを定義します。
Enum定数に値を定義することで、これを変更しない限りビットマスクの互換性を保つことができます。

```java
public enum EnumExample {

  FLAG_A(0),
  FLAG_B(1),
  FLAG_C(2),
  FLAG_D(3);

  public static EnumSet<EnumExample> getEnumSet(int bitmask) {
    // 全てのEnum定数を取得
    return Arrays.stream(values())
        // ビットフラグと引数のビットマスクのAND演算で0にならないかどうかで含まれているか判定
        .filter(e -> (e.getBitflag() & bitmask) != 0)
        // EnumSetに変換する
        .collect(Collectors.toCollection(() -> EnumSet.noneOf(EnumExample.class)));
  }

  public static int getBitmask(Collection<EnumExample> set) {
    return set.stream()
        .mapToInt(EnumExample::getBitflag)
        // それぞれのビットにOR演算を行う (e.g. (0b100, 0b10) -> 0b100 | 0b10 (= 0b110))
        .reduce(0, (i, j) -> i | j);
  }

  private final int bitflag;

  private EnumExample(int offset) {
    // ビットフラグ(2進数で(offset+1)桁目が1で他が0の整数)に変換
    this.bitflag = 1 << offset; // <=> this.bitflag = (int) Math.pow(2, offset);
  }

  public int getBitflag() {
    return bitflag;
  }
}
```

# 方法2. 変換用ユーティリティクラス

全てのEnumに変換メソッドを定義しなくて良いように、ユーティリティクラスを作成します。
ただし、この実装は `Enum::ordinal` によってEnum定数の宣言順に依存するので並び替え/削除をするとそれ以前に生成したビットマスクと互換性がなくなります。

```java
public class EnumSetBitmaskConverter {

  public static <E extends Enum<E>> int enumSetToBitmask(EnumSet<E> enumSet) {
    return enumSet.stream()
        // Enum定数の序数(宣言順)に変換
        .mapToInt(Enum::ordinal)
        // ビットフラグ(2進数で(i+1)桁目が1で他が0の整数)に変換 (e.g. 2 -> 1<<2 (= 0b100 = 4))
        .map(i -> 1 << i)
        // それぞれのビットにOR演算を行う (e.g. (0b100, 0b10) -> 0b100 | 0b10 (= 0b110))
        .reduce(0, (i, j) -> i | j);
  }

  public static <E extends Enum<E>> EnumSet<E> bitmaskToEnumSet(Class<E> elementType, int bitmask) {
    // elementTypeで指定されたEnum定数を全て取得
    return Arrays.stream(elementType.getEnumConstants())
        // 上と同様にEnum定数をビットフラグに変換し、引数のビットマスクとのAND演算で0にならないかどうかで含まれているか判定
        .filter(e -> (1 << e.ordinal() & bitmask) != 0)
        // EnumSetに変換する
        .collect(Collectors.toCollection(() -> EnumSet.noneOf(elementType)));
  }

  private EnumSetBitmaskConverter() {
    throw new AssertionError();
  }
}
```

# 方法3. ビットフラグ用インターフェース＆変換用ユーティリティクラス

宣言順の変更があっても互換性を保つことができるよう、方法2のユーティリティクラスに方法1のように `bitflag` を定義してあるEnumクラスのみ渡せるようにします。

まず、インターフェースで `offset` を保存することをEnumに強制し、`bitflag` を取得できるようにします。

```java
public interface BitflagGetable {

  protected public int getOffset();

  public default int getBitflag() {
    int offset = getOffset();
    if (offset < 0) {
      throw new IllegalStateException("offset is negative");
    }
    return 1 << offset;
  }
}
```

このインターフェースを実装したEnumは以下のようになります。

```java
public enum BitflagGetableImpl implements BitflagGetable {

  FLAG_A(0),
  FLAG_B(1),
  FLAG_C(2),
  FLAG_D(3);

  private final int offset;

  private BitflagGetableImpl(int offset) {
    this.offset = offset;
  }

  @Override
  public int getOffset() {
    return offset;
  }
}
```

そして、ユーティリティクラスではジェネリクスで引数となるEnumにこのインターフェースを実装していることを要求します。

```java
public class SafeEnumSetBitmaskConverter {

  public static <E extends Enum<E> & BitflagGetable> int enumsetToBitmask(EnumSet<E> enumSet) {
    return enumSet.stream()
        .mapToInt(BitflagGetable::getBitflag)
        .reduce(0, (i, j) -> i | j);
  }

  public static <E extends Enum<E> & BitflagGetable> EnumSet<E> bitmaskToEnumSet(Class<E> elementType, int bitmask) {
    return Arrays.stream(elementType.getEnumConstants())
        .filter(e -> (e.getBitflag() & bitmask) != 0)
        .collect(Collectors.toCollection(() -> EnumSet.noneOf(elementType)));
  }

  private SafeEnumSetBitmaskConverter() {
    throw new AssertionError();
  }
}
```

# 終わりに

Enumが少なければ方法1で良さそうですが、共通化する際に宣言順を変更しても問題ないようにすると方法3のように面倒になってしまいました…
もし何かより良い方法があれば教えていただけると助かります。
