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
  - **Saved views**: save the charts, layout, filters and calculated-column formulas under a name in localStorage, then apply them to any file that has the same source columns. Formula columns are recreated automatically when the view is applied, so a fresh file doesn't need them re-entered
- **KPI card** chart: a big number (sum/avg/count) with an optional date trend sparkline and a change against the previous period
- **Command palette** (`Ctrl/Cmd+K` or `?`): every action, plus the suggested charts for the current data
- **Duplicate chart** button on each card, and commands to move the active chart earlier or later
- **Presentation mode** (`P`): the dashboard in full screen
- Dashboards now hold up to 12 charts (previously 6)
- Shortcuts: `D` data, `N` new chart, `E` edit, `P` present, `Ctrl/Cmd+Z` undo

### Workbench layer (`js/workbench.js`)
- **Dashboard filter bar** above the charts. Add a control for any column:
  - Pick values (searchable checklist with counts, All/None) for category columns
  - From–to range for number and date columns
  - These filters apply to every chart. They are saved with the dashboard and in share links, and can be undone
  - The chosen controls are remembered in localStorage (`draw-wb-controls`)
- **Drag to reorder** charts with the grip handle on each card. On the keyboard, focus the grip and press Alt+←/→
- **Annotations** (inspector → Annotations):
  - Reference/target line with a label
  - Average line (line, area, bar, scatter)
  - A note shown under the chart title, which is also included in the PDF
- **Combine files** (Data panel tab):
  - For multi-sheet XLSX files, a Sheet dropdown chooses which sheet to combine (first sheet by default)
  - Append another file's rows, with an optional "Source" column
  - Or join its columns on a key. You choose left or inner join; matching ignores upper/lower case and extra spaces, and you see a preview of how many rows match
  - Charts are kept, and the change can be undone
- **Group & pivot** (Data panel tab): group by category or date columns (date grouping by day/week/month/quarter/year). Measures are sum, average, median, min, max, count and distinct count. You can pivot one column into columns and choose whether to respect the dashboard filters. The result becomes a new dataset you can chart
- **Dashboard PDF** (Export menu, or the palette): an A4 landscape PDF built in the browser with no library. Up to four charts per page, plus a header with source, date, row count and active filters, and the chart notes. Charts are always drawn in the light theme for print

## Structure
```
index.html        core app (single file, no build step)
js/pro.js         pro layer: data panel, formulas, views, KPI, palette, present
js/workbench.js   filter bar, drag reorder, annotations, combine, group/pivot, PDF
vendor/           echarts, papaparse, xlsx, hyparquet (+compressors)
fonts/            DM Sans 400/500/600, Instrument Serif 400 + italic (woff2, latin subset from Fontsource); falls back to system fonts
```

## Entry
- `/index.html`
- `/index.html#draw=<z|j><base64url>` opens a shared dashboard

## Data
Everything runs client-side, with no backend. The dataset is stored in IndexedDB (`draw-store`), the dashboard in localStorage (`draw-dashboard`), and saved views in localStorage (`draw-pro-views`).

Saved view shape: `{ name, at, source, calc: [{ name, expr }], layout: { v, f, p, fl, a } }`. `calc` is optional (views saved earlier still load).

## Not yet implemented / next steps
- Short links for large datasets: needs a server-side store, which this static site doesn't have
- Calculated columns persist with saved views but not with the plain dashboard autosave. Loading a fresh file without applying a view still drops them
- Formulas can reference earlier formula columns inside one view, but there is no UI yet to edit or delete an existing formula column
- Fonts are latin-only subsets. Add latin-ext files if you need extended characters
