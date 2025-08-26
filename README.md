# Label when approved action

[![GitHub Super-Linter](https://github.com/realstealthninja/label-when-approved/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/realstealthninja/label-when-approved/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/realstealthninja/label-when-approved/actions/workflows/check-dist.yml/badge.svg)](https://github.com/realstealthninja/label-when-approved/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/realstealthninja/label-when-approved/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/realstealthninja/label-when-approved/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Adds an approved label when required amount of reviews have approved


Example workflow
```yml
on: pull_request_review
name: Add "approved" label when approved
jobs:
  add_label:
    name: Add "approved" label when approved
    runs-on: ubuntu-latest
    steps:
      - name: Add "approved" label when approved
        uses: realstealthninja/label-when-approved@main
        with:
          approvals: 1
          secret: ${{ secrets.GITHUB_TOKEN }}
          label: "approved"
```