# Draw — instant charts from any data file

Not Power BI, not Tableau. Drop a file and have a good chart within about 10 seconds.

## Features
- Load data by drag and drop, pasting a table, a file picker, typing it in, or a sample dataset
- Reads CSV/TSV (large files are parsed in a Web Worker), XLSX (with a sheet picker) and Parquet
- Picks a sensible chart automatically, and you can switch to another type
- Chart types: bar, line, area, scatter, histogram, pie, ECDF, density, strip, boxplot, heatmap, treemap, violin, correlation, pair plot, ridgeline, funnel, radar, sunburst, sankey, parallel, calendar, combo, candlestick and QQ plot
- Cross-filtering, facets, an inspector panel, undo, CSV export and local persistence
- **Share link** (link icon in the top bar): the charts, filters and data are compressed (deflate) into `#draw=…`. Data over about 120 KB is left out and the link carries charts only. When someone opens it and drops a file with the same columns, the charts are applied
- **Export toolbar** (download icon in the top bar): active chart as PNG or SVG, copy the chart image, whole dashboard as PNG, save a `.draw.json` file, copy the share link. Each chart card also has its own export menu
- One set of custom controls everywhere: dropdowns (keyboard support and type-ahead), pill toggles, styled sliders and focus rings

## Structure
```
index.html        whole app (single file, no build step)
vendor/           echarts, papaparse, xlsx, hyparquet (+compressors)
fonts/            DM Sans, Instrument Serif (woff2)
```
If a local vendor file fails to load, the libraries fall back to jsDelivr: echarts, papaparse and xlsx as scripts, hyparquet as ESM `+esm`.

## Entry
- `/index.html`
- `/index.html#draw=<z|j><base64url>` opens a shared dashboard. `z` means deflate-raw and `j` means plain JSON. The hash is cleared after it loads.

## Data
Everything runs client-side. There is no backend and no tables.

## Next steps
- Short links through an optional paste service for large datasets
- Export the dashboard as SVG or PDF
