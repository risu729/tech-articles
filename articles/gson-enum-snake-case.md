---
title: "【Java】GsonでEnumをsnake_caseに変換する"
emoji: "🐍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["java", "gson"]
published: true
---

# はじめに

JavaでGsonを用いてjsonへシリアライズする際、`SCREAMING_SNAKE_CASE` のEnum定数(Enum Constant)を、jsonで一般的な形式である `snake_case` に変換したいことがあります。
実際にGsonのJavadocにも例として記載されているのですが、シリアライズ/デシリアライズ時の名前を指定できる`@SerializedName` アノテーションに対応していなかったので対応させたものを残しておきます。
また、`Enum::toString` をオーバーライドしていても問題ないようにもしています。

# コード

`@SerializedName` に対応させたものです。(対応していない簡略化したものは[↓](#簡易ver))

```java
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.annotations.SerializedName;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.util.*;
import java.io.IOException;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;

final class SnakeCaseEnumTypeAdapterFactory implements TypeAdapterFactory {

  @Override
  @SuppressWarnings({"unchecked", "rawtypes"})
  public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> typeToken) {

    // キャストしないとClass<? super T>となる
    var rawType = (Class<T>) typeToken.getRawType();

    // Enumでなければ何もしない(nullを返すことで無視)
    if (!rawType.isEnum()) {
      return null;
    }

    // リフレクションでEnum定数を全て取得
    List<T> enumConstants = List.of(rawType.getEnumConstants());

    Map<T, SerializedName> serializedNameMap = enumConstants.stream()
        // mapMultiでアノテーションが存在する場合のみStreamに追加 
        .<Map.Entry<T, SerializedName>>mapMulti((constant, consumer) -> {
          try {
            // Enum定数に付与されている@SerializedNameアノテーションを取得
            Optional.ofNullable(rawType.getField(((Enum) constant).name()).getAnnotation(SerializedName.class))
                .ifPresent(serializedName -> consumer.accept(Map.entry(constant, serializedName)));
          } catch (NoSuchFieldException e) {
            // Enum定数の名前から取得しているので必ず存在する
            throw new AssertionError(e);
          }
        }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<T, String> constantToName = enumConstants.stream()
        .collect(Collectors.toMap(UnaryOperator.identity(),
            constant -> ((Enum) constant).name().toLowerCase(Locale.ENGLISH)));

    Map<T, String> constantToJson = enumConstants.stream()
        .collect(Collectors.toMap(UnaryOperator.identity(),
            constant -> Optional.ofNullable(serializedNameMap.get(constant))
                .map(SerializedName::value)
                .orElseGet(() -> constantToName.get(constant))));

    Map<String, T> jsonToConstant = new HashMap<>();
    for (var constant : enumConstants) {
      jsonToConstant.put(constantToName.get(constant), constant);
      Optional.ofNullable(serializedNameMap.get(constant))
          .ifPresent(serializedName -> {
            jsonToConstant.put(serializedName.value(), constant);
            Arrays.stream(serializedName.alternate())
                .forEach(alternate -> jsonToConstant.put(alternate, constant));
          });
    }

    return new TypeAdapter<T>() {
      public T read(JsonReader jsonReader) throws IOException {
        return jsonToConstant.get(jsonReader.nextString());
      }

      public void write(JsonWriter jsonWriter, T value) throws IOException {
        jsonWriter.value(constantToJson.get(value));
      }
    }.nullSafe();
  }
}
```

# 変換の仕様

## シリアライズ (Enum定数→json)

以下の順に優先してjsonへと変換します。

1. [`@SerializedName`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/annotations/SerializedName.html) の `value`
2. `Enum::name`

## デシリアライズ (json→Enum定数)

以下全てをEnum定数に変換します。

- `Enum::name`
- [`@SerializedName`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/annotations/SerializedName.html) の `value`
- [`@SerializedName`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/annotations/SerializedName.html) の `alternate`

名前が複数のEnum定数で衝突した場合の動作は不確かですが、Gson自体の `@SerializedName` も同様に不確かなのでおそらく大丈夫なのでしょう。

# 解説

[`TypeAdapterFactory`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/TypeAdapterFactory.html) というインターフェースを用います。
`Gson` が変換しようとしたクラスの [`TypeToken`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/reflect/TypeToken.html) が `create` メソッドに渡されるので、特別な処理をしたい場合は [`TypeAdapter`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/TypeAdapter.html) を、特別な処理をしない場合は `null` を返します。

今回は `Enum` が渡された場合にEnum定数とjsonを変換する `TypeAdapter` を返すようにします。
`null` については、`TypeAdapter::nullsafe` を用いているので特に気にせずとも良いです。
また、Javadocにも記載されている通り、リフレクションなどの負荷の大きい処理は `TypeAdapter` のインスタンスを生成するときに行うべきなので、変換するための `Map` を先に生成します。

## Enum へのキャストについて

```java
((Enum) constant).name()
```

Enum定数の名前を取得するときに `unchecked` & `rawtypes` の警告が出るにもかかわらず、このような方法を用いています。
`unchecked` は、 `constant` の型が仮型引数 `T` になっており、キャストしないと呼び出せません。
`rawtypes` は、Enumの型定義が `Enum<E extends Enum<E>>` となっているので、キャストする際に `Enum<T>` とすると `T` が `Enum` を継承しているかわからなくコンパイルエラーとなります。
Enumでない場合は先に `return` しているので問題ないのですが、あまり綺麗ではないので仮型引数をもう少し自由に操作したいですね…

# 簡易ver

`@SerializedName` に対応していないものです。
`Enum::toString` をオーバーライドしていても問題ないように、`Enum::name` を使用するようJavadocのものから改変しています。

```java
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.util.*;
import java.io.IOException;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;

public final class SnakeCaseEnumTypeAdapterFactory implements TypeAdapterFactory {

  @Override
  @SuppressWarnings({"unchecked", "rawtypes"})
  public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> typeToken) {

    // キャストしないとClass<? super T>となる
    var rawType = (Class<T>) typeToken.getRawType();

    // Enumでなければ何もしない(nullを返すことで無視)
    if (!rawType.isEnum()) {
      return null;
    }

    // リフレクションでEnum定数を全て取得
    List<T> enumConstants = List.of(rawType.getEnumConstants());

    Map<T, String> constantToJson = enumConstants.stream()
        .collect(Collectors.toMap(UnaryOperator.identity(),
            constant -> ((Enum) constant).name().toLowerCase(Locale.ENGLISH)));

    Map<String, T> jsonToConstant = constantToJson.entrySet()
        .stream()
        .collect(Collectors.toMap(Map.Entry::getValue, Map.Entry::getKey));

    return new TypeAdapter<T>() {
      public void write(JsonWriter jsonWriter, T value) throws IOException {
        jsonWriter.value(constantToJson.get(value));
      }

      public T read(JsonReader jsonReader) throws IOException {
        return jsonToConstant.get(jsonReader.nextString());
      }
    }.nullSafe();
  }
}
```

# `Gson` への適用

```java
var gson = new GsonBuilder()
    .registerTypeAdapterFactory(new SnakeCaseEnumTypeAdapterFactory())
    .build();
```

このように `GsonBuilder` に適用することで使用できます。詳しくはJavadocを参照してください。