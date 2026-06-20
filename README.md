# snnbench

This site hosts benchmarked results of Spiking Neural Networks (SNNs) from leading
research papers. The goal is to track the leading approaches and the current state of
the art in spiking neural networks.

The site is live at [snnbench.com](https://snnbench.com) (also
[snnbenchmarks.com](https://snnbenchmarks.com)). If you would like to contribute, please
reach out — contact details are on my personal site [daniellong.co](https://daniellong.co/).

## Structure

- `index.html` — the benchmarks table, populated by `script.js` from `data/`.
- `background.html` + `background/` — explanatory pages about SNNs.
- `contact.html` — contact form (web3forms).
- `data/papers.json`, `data/datasets.json` — the benchmark data.
- `css/` — stylesheets.
- `partials/` — shared `<head>` and `<header>` markup (see Build).

## Build

The shared `<head>` and `<header>` are defined once in `partials/` and injected into
every page by `build.js`. The HTML files are committed fully-rendered, so the site works
when served directly with no build step.

After editing anything in `partials/`, or the per-page titles/descriptions in the `PAGES`
config in `build.js`, re-sync all pages with:

```sh
node build.js
```

This rewrites the `<head>` and `<header>` of every page listed in `PAGES`. It is
idempotent — running it without changes leaves the files untouched.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```
