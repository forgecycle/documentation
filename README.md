# ForgeCycle documentation

The source of <https://forgecycle.github.io/documentation/>, built with
[Astro Starlight](https://starlight.astro.build/) and deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

## What is generated

The documentation itself lives in the private `forgecycle/forgecycle`
repository, next to the code it describes. `scripts/import.mjs` copies an
allowlisted set of its files into this site, rewrites their links to site
URLs, drops references to the unpublished ADRs, and generates the CLI
reference from the binary's help. It owns, and replaces on every run:

- `src/content/docs/{start,concepts,guides,reference}/`
- `public/schemas/`
- `src/generated/`

Do not edit those by hand; change the source repository instead. The
landing page (`src/content/docs/index.mdx`), the site configuration, and the
import script itself are maintained here.

The source repository's docs workflow runs the import for each release tag
and commits the result here with the message `Docs for vX.Y.Z`.

## Working locally

```bash
npm ci
cd ../forgecycle && make build-go && cd -
node scripts/import.mjs --source ../forgecycle --bin ../forgecycle/.build/forgecycle
npm run dev     # http://localhost:4321/documentation/
npm run build   # also fails on any broken internal link
```

To publish another page, add it to `PAGES` in `scripts/import.mjs`. A link
from a published page to a file that is not published fails the import.
