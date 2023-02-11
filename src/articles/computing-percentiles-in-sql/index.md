---
title: Computing percentiles in SQL
description: Using window functions over SQL arrays is hard but powerful
date: 2023-02-11
snippet:
  lang: sql
  code: |
    SELECT id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY unnest) AS p50 FROM (
      SELECT id, UNNEST(durations) FROM table
    ) t GROUP BY id
---

:)
