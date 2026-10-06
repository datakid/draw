# Draw — instant charts from any data file

Not Power BI, not Tableau. Drop a file and have a good chart within about 10 seconds. Then keep working with it: look at the rows, clean and derive columns, build a dashboard, save it as a view, and present it.

## Features
- Load data by drag and drop, pasting a table, a file picker, typing it in, or a sample dataset
- Reads CSV/TSV (large files are parsed in a Web Worker), XLSX (with a sheet picker), Parquet and JSON
- Picks a sensible chart automatically, and you can switch to another type
- Chart types: bar, line, area, scatter, histogram, pie, **KPI card**, ECDF, density, strip, boxplot, heatmap, treemap, violin, correlation, pair plot, ridgeline, funnel, radar, sunburst, sankey, parallel, calendar, combo, candlestick and QQ plot
- Cross-filtering, facets, an inspector panel, undo/redo, CSV export and local persistence
- Share link (`#draw=…`, deflate-compressed). Data over about 120 KB is left out and the link carries charts only
- Export: PNG, SVG, copy image, dashboard PNG, `.draw.json`

### Pro layer (`js/pro.js`)
- **Data panel** (table icon or `D`)
  - **Rows**: a searchable, sortable table of the rows that pass the current dashboard filters. Loads 500 rows at a time, and you can download exactly those rows as CSV
  - **Profile**: for each column, its type, distinct count, how complete it is, and a summary (min/median/mean/max, date range, or top values). "Chart it" adds a chart for that column
  - **Calculated column**: formulas such as `ROUND([Revenue] / [Units], 2)` or `IF([Revenue] > 20000, "Big", "Small")`, with a live preview. Available functions: `IF ROUND ABS LOG UPPER LOWER YEAR MONTH CONCAT BUCKET`. Formulas are sandboxed: no statements, assignments or globals. The new column becomes part of the dataset, so it persists, can be undone, and is included in share links
  - **Saved views**: save the charts, layout and filters under a name in localStorage, then apply them to any file that has the same columns
- **KPI card** chart: a big number (sum/avg/count) with an optional date trend sparkline and a change against the previous period
- **Command palette** (`Ctrl/Cmd+K` or `?`): every action, plus the suggested charts for the current data
- **Duplicate chart** button on each card, and commands to move the active chart earlier or later
- **Presentation mode** (`P`): the dashboard in full screen
- Dashboards now hold up to 12 charts (previously 6)
- Shortcuts: `D` data, `N` new chart, `E` edit, `P` present, `Ctrl/Cmd+Z` undo

## Structure
```
index.html        core app (single file, no build step)
js/pro.js         pro layer: data panel, formulas, views, KPI, palette, present
vendor/           echarts, papaparse, xlsx, hyparquet (+compressors)
fonts/            DM Sans, Instrument Serif (woff2), optional; falls back to system fonts
```

## Entry
- `/index.html`
- `/index.html#draw=<z|j><base64url>` opens a shared dashboard

## Data
Everything runs client-side, with no backend. The dataset is stored in IndexedDB (`draw-store`), the dashboard in localStorage (`draw-dashboard`), and saved views in localStorage (`draw-pro-views`).

## Not yet implemented / next steps
- Filter controls you can place directly (date range slider, dropdown) as dashboard widgets
- Drag-and-drop reordering of cards (for now, use the palette commands)
- Joining or appending a second file; pivot and group-by transforms
- Reference lines, targets and annotations on charts
- Dashboard export as PDF; short links for large datasets
- `fonts/` folder was not uploaded. Add the woff2 files there for the intended typography
