# Character Data Schema

Source file: `src/data/characters.json`

## Character

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Display name. |
| `slug` | string | yes | URL-safe unique id. |
| `aliases` | string[] | yes | Empty array if none. |
| `franchise` | string | yes | Main franchise or series. |
| `games` | string[] | yes | At least one notable game. |
| `publisher` | string | yes | Current or best-known publisher. |
| `developer` | string | yes | Original or best-known developer. |
| `role` | string | yes | Protagonist, antagonist, mascot, fighter, etc. |
| `popularityTier` | enum | yes | `Iconic`, `Mainstream`, `Cult`, or `Emerging`. |
| `summary` | string | yes | Short catalog description. |
| `popularitySignals` | object[] | yes | At least one signal. |
| `visualTags` | object | yes | Clothing, colors, accessories, silhouette. |
| `analysisNotes` | string[] | yes | Data caveats or future analysis ideas. |
| `citations` | object[] | yes | At least one citation. |

## Popularity Signal

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `source` | string | yes | Human-readable source name. |
| `metricType` | string | yes | What the value measures. |
| `value` | number | yes | Must be between 0 and `maxValue`. |
| `maxValue` | number | yes | Must be greater than 0. |
| `collectedAt` | date string | yes | `YYYY-MM-DD`. |
| `confidence` | enum | yes | `high`, `medium`, or `low`. |
| `notes` | string | yes | Explain source quality and caveats. |

## Citation

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Display label. |
| `url` | URL | yes | Source URL. |
| `sourceType` | enum | yes | `official`, `encyclopedia`, `database`, or `curated`. |
| `retrievedAt` | date string | yes | `YYYY-MM-DD`. |
| `notes` | string | yes | Why this source matters. |
