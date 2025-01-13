---
title: Computing percentiles in SQL
description: Composing window functions with UNNEST to compute percentiles of arrays in SQL.
snippet:
  lang: sql
  code: |
    SELECT id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) AS p50 FROM (
      SELECT id, UNNEST(durations) AS duration FROM websites
    ) t GROUP BY id
---

<script>
  import {Example, Tldr} from '$lib/markdown';
</script>

<Tldr>
  <code>UNNEST</code> allows splatting arrays into rows, which can then be used in window functions like <code>PERCENTILE_CONT</code>.
</Tldr>

SQL is a language that never stops giving, and I'll probably never stop learning new things about it. I recently stumbled upon the following problem: **how to compute the median value of a float array?**

Given the following _websites_ table:

<Example>

|  id | name          | durations         |
| --: | ------------- | ----------------- |
|   1 | example.com   | `{0.2, 0.4}`      |
|   2 | gautier.dev   | `{0.3, 0.2, 0.6}` |
|   3 | wikipedia.org | `{}`              |

</Example>

Note: I'll use Postgres syntax to represent arrays, with the rather unconventional curly brackets for people used to web languages. You can also use `ARRAY[0.2, 0.4]` to declare arrays.

Is there a way to compute the p50 (median value) of the durations arrays in pure SQL for Postgres?

## `PERCENTILE_CONT`

PostgreSQL features a `PERCENTILE_CONT` function that computes the percentile of a set of values. Unfortunately, it is a window function, meant to be used over numeric columns.

If _duration_ was a numeric column, we could use the following query:

<Example>

|  id | name          | duration |
| --: | ------------- | -------: |
|   1 | example.com   |      0.6 |
|   2 | gautier.dev   |      0.7 |
|   3 | wikipedia.org |   _null_ |

</Example>

```sql
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) AS p50
FROM websites
```

This would return:

<Example title="Result">

|                p50 |
| -----------------: |
| 0.6499999999999999 |

</Example>

The _null_ value is properly ignored, and rounding is still hard for computers in 2023.

## `UNNEST`

In our original problem we have arrays of floats. To compute the median value of each array, the solution is to use the `UNNEST` function, which allows [splatting](https://stackoverflow.com/a/2322384/4888395)/[spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) arrays into rows.

```sql
SELECT id, name, UNNEST(durations) AS duration FROM sites
```

<Example title="Result">

|  id | name        | duration |
| --: | ----------- | -------: |
|   1 | example.com |      0.2 |
|   1 | example.com |      0.4 |
|   2 | gautier.dev |      0.3 |
|   2 | gautier.dev |      0.2 |
|   2 | gautier.dev |      0.6 |

</Example>

It's worth noting that _id_ is no longer unique and that empty arrays produce no rows.

We now have a virtual table on which we can use [any window function](https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-HYPOTHETICAL-TABLE):

```sql
SELECT id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) AS p50
FROM (
  SELECT id, UNNEST(durations) AS duration FROM sites
) t
GROUP BY id
```

<Example title="Result">

|  id |                 p50 |
| --: | ------------------: |
|   1 | 0.30000000000000004 |
|   2 |                 0.3 |

</Example>

And then we can `LEFT JOIN` the _websites_ table to retrieve other details:

```sql
SELECT websites.id, name, p50
FROM websites
LEFT JOIN (
	SELECT id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) AS p50
	FROM (SELECT id, UNNEST(durations) AS duration FROM sites) t
	GROUP BY id
) t ON t.id = websites.id
```

<Example title="Result">

|  id | name          |                 p50 |
| --: | ------------- | ------------------: |
|   1 | example.com   | 0.30000000000000004 |
|   2 | gautier.dev   |                 0.3 |
|   3 | wikipedia.org |              _null_ |

</Example>

Using `LEFT JOIN` rather than `(INNER) JOIN` allows us to keep all the websites, even those with an empty array.
