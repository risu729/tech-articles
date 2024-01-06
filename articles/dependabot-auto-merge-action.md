---
title: "【Dependabot】PRを自動でマージする GitHub Actions の紹介"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "dependabot", "githubactions"]
published: false
---

# はじめに

Dependabot 便利ですよね。私はほとんど全てのリポジトリで有効化しています。
ただ、多い時には一日十数件来るPRを一々確認するのはとても面倒なので GitHub Actions を使って自動でマージしています。
この Actions をどのようにすればいいのか、今までの変遷と共に紹介しようと思います。

# GitHub CLI を使う

[GitHub CLI](https://docs.github.com/en/github-cli/github-cli/about-github-cli) という GitHub の操作を CLI からできるのがあります。これは GitHub Actions の実行環境に最初から入っているので、特に設定しなくても使えて便利です。
これを使って自動でPRをマージする方法は GitHub の公式ドキュメントでも紹介されていますし、かなりメジャーなようです。
ただし、同時に複数のPRが作成されたときにコンフリクトが発生してマージできないことがたまによくあります。

GraphQL: refusing to allow a GitHub App to create or update workflow `.github/workflows/deploy.yml` without `workflows` permission (mergePullRequest)

```yaml:.github/auto-merge.yml
name: auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: read
  workflows: write

defaults:
  run:
    shell: bash

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Metadata from Dependabot PRs
        id: metadata
        uses: dependabot/fetch-metadata@v1.6.0
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}

      - name: Merge
        run: gh pr merge "$PR" --squash --auto
        env:
          PR: ${{github.event.pull_request.html_url}}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
        if: |
          steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
          steps.metadata.outputs.update-type == 'version-update:semver-minor'
```

https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions

### permissions

ここで指定した権限は(jobで上書きされない限り) `secrets.GITHUB_TOKEN` で取得できるトークンが持つ権限になります。
デフォルトでは(リポジトリの設定を変更していなければ)すべての読み取り権限が付与されているので、書き込み権限を与えるため、また余計な権限を奪うために設定します。

`contents: write` はマージするため、`pull-requests: read` はPRの情報を取得するためにそれぞれ必要です。

### fetch-metadata

https://github.com/dependabot/fetch-metadata

Dependabot公式から提供されている Dependabot が作成したPRの情報を取得するアクションです。
[Semantic Versioning](https://semver.org/) に則れば Breaking Changes (破壊的変更) が無い**はず**の patch と minor のアップデートのみ自動でマージするために使います。

これは `with` でトークンを渡すのみでよいです。
`id: metadata` は結果を次のステップで参照するために設定してあります。

### GitHub CLI

https://cli.github.com/manual/gh_pr_merge

`gh pr merge "$PR" --squash --auto` のうち、`gh pr merge "$PR"` は固定となります。
`--squash` は `--rebase` か `--merge` に置き換えてマージ戦略を変更できます。(基本的にこれらのいずれか1つが必須です)
その後のオプションは必要に応じて追加してください。

1. `--auto`
CIがパスするまでマージせず、パスした後に自動でマージするようにします。
Breaking Changes は無いはずですが、それでもCIが失敗することもあるので基本的にはオンにした方がいいでしょう。

2. `--delete-branch`
マージした後にPRのブランチを自動で削除します。
リポジトリの設定で [`Automatically delete head branches`](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches) が有効化されている場合(デフォルトでは無効)、このオプションを指定しなくても自動で削除されるので必要ありません。

他の設定は[ドキュメント](https://cli.github.com/manual/gh_pr_merge)に記載されているので確認してください。おそらくあまり使わないとは思います。

## マージ戦略について

マージ戦略(Merge strategy)とは、Merge, Rebase and merge, Squash and merge のどれを使うかです。

Merge だと Dependabot のコミット全てとそのマージコミットで最低でも2、コンフリクトの解消があるとそれ以上のコミットになって履歴が伸びます。
Rebase and merge か Squash and merge なら1つのコミットにまとめられます。
ただし、Rebase and merge だとマージコミットの Author が Dependabot と GitHub Actions 両方になるので個人的には Squash and merge を使っています。
もちろんブランチのマージ戦略に合わせるべきですが、どれでもいい程度の適当なリポジトリなら Squash and merge がいいのではないでしょうか。

PRとそのマージで2commitになるのがうざい
rebase / squash で解決、dependabotのprは常に1commitなのでどちらでもいいが、authorの観点からrebase
squashの方がauthor減る&PRへのリンク残る

fetch-metadataで条件付けできるが、気にしなくて良いのならなし
ついでに、dependabotは時間指定とか頻度とか便利なので指定した方がいい
dependabotのpr limit 0

permissions: contents:write & pr: read

autoかどうかどちらでも良い

html url 使わないとダメ、numberだとcheckout必要

@dependabotのコメントで操作した方が手動と統一されててよさげ、rebaseもできるし


FastifyはOSSとして信頼できるがGitHub API を使うので問題解決しない
[Title](https://github.com/fastify/github-action-merge-dependabot/tree/main)

PATが必要だがコメントできるので便利
npmで働いていた人なので多分安心
[Title](https://github.com/ahmadnassri/action-dependabot-auto-merge)

コメントでpush権限を持っていないと拒否されるのでそれが原因であろう
> Sorry, only users with push access can use that command.

IDK why, PATを Dependabot シークレットに入れないと動かない

これです
[](https://github.blog/changelog/2021-11-30-github-actions-workflows-triggered-by-dependabot-receive-dependabot-secrets/)

[Title](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/configuring-access-to-private-registries-for-dependabot)

pr r & w for pat
 Read access to metadata
 Read and Write access to pull requests
コメントさえできれば権限を持っているかどうかはDependabotがユーザーから判別するのでこれでもんだいない

コメントするのすらPAT使うっぽい

コンフィグファイル使わないならcheckout, contents: read いらない

permissions: {} で全消しできる!
https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs
