---
title: Computing percentiles in SQL
description: Using window functions over SQL arrays is hard but powerful.
date: 2023-02-11
snippet:
  lang: sql
  code: |
    SELECT id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY unnest) AS p50 FROM (
      SELECT id, UNNEST(durations) FROM table
    ) t GROUP BY id
---

SQL is a language that never stops giving, I'll probably never stop learning new things about it. I recently stumbled upon the following problem: **how to compute the median value of a float array?**

Given the following table:

|  id | site          | durations         |
| --: | ------------- | ----------------- |
|   1 | example.com   | `[0.2, 0.4]`      |
|   2 | gautier.dev   | `[0.3, 0.2, 0.6]` |
|   3 | wikipedia.org | `[]`              |

Is there a way to compute the p50 (median value) of the durations array in pure SQL for Postgres?

## `PERCENTILE_CONT`

PostgreSQL features a `PERCENTILE_CONT` function that computes the percentile of a set of values. Unfortunately, it is a window function, meant to be used over numeric columns.

If `duration` was a numeric column, we could use the following query:

|  id | site          | duration |
| --: | ------------- | -------- |
|   1 | example.com   | `0.5`    |
|   2 | gautier.dev   | `0.6`    |
|   3 | wikipedia.org | `0.7`    |

```sql
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) AS p50
FROM table
```

This would return `p50 = 0.6`.

## `UNNEST`
