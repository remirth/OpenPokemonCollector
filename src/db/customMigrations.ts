export namespace CustomMigrations {
	export const sqlToNgrams3 = `
CREATE OR REPLACE FUNCTION to_ngrams3(s text)
RETURNS tsvector
LANGUAGE sql IMMUTABLE AS $$
  SELECT to_tsvector('simple',
    string_agg(substr(lower(s), g, 3), ' '))
  FROM generate_series(1, GREATEST(length(s) - 3 + 1, 0)) g
$$;
`;

	export const sqlNgramTsquery = `
CREATE OR REPLACE FUNCTION ngram_tsquery(q text)
RETURNS tsquery
LANGUAGE sql IMMUTABLE AS $$
  WITH norm AS (
    SELECT lower(q) AS s, length(q) AS n
  ),
  grams AS (
    SELECT
      CASE
        WHEN n >= 3 THEN (
          SELECT string_agg(substr(s, g, 3), ' & ')
          FROM generate_series(1, n - 3 + 1) g
        )
        WHEN n = 2 THEN substr(s, 1, 2)
        WHEN n = 1 THEN s
        ELSE ''
      END AS expr
    FROM norm
  )
  SELECT to_tsquery('simple', coalesce(expr, ''))
  FROM grams;
$$;
`;
}
