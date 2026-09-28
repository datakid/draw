# Draw — instant charts from any data file

Not Power BI, not Tableau. Drop a file and have a good chart within about 10 seconds.

## Features
- Load data by drag and drop, pasting a table, a file picker, typing it in, or a sample dataset
- Reads CSV/TSV (large files are parsed in a Web Worker), XLSX (with a sheet picker) and Parquet
- Picks a sensible chart automatically, and you can switch to another type
- Chart types: bar, line, area, scatter, histogram, pie, ECDF, density, strip, boxplot, heatmap, treemap, violin, correlation, pair plot, ridgeline, funnel, radar, sunburst, sankey, parallel, calendar, combo, candlestick and QQ plot
- Cross-filtering, facets, an inspector panel, undo, CSV export and local persistence

## Structure
```
index.html        whole app (single file, no build step)
vendor/           echarts, papaparse, xlsx, hyparquet (+compressors)
fonts/            DM Sans, Instrument Serif (woff2)
```
If a local vendor file fails to load, the core libraries and XLSX fall back to jsDelivr.

## Entry
- `/index.html`. There are no URL parameters, and all data stays in the browser.

## Data
Everything runs client-side. There is no backend and no tables.

## Next steps
- Share state through a URL hash
- Export charts as PNG/SVG from a toolbar
- Add a Parquet CDN fallback
