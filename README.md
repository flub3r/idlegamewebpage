# HASHNOVA

Public GitHub Pages deployment for HASHNOVA, an installable crypto-mining idle game built with React, TypeScript, Motion, and a mobile-first PWA layer.

## Play

The game is published at:

`https://flub3r.github.io/idlegamewebpage/`

## Install on iPhone

1. Open the game URL in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Launch HASHNOVA from its Home Screen icon for standalone app-style play.

## Deployment

`main` contains a checksum-verified compressed source bundle. `.github/workflows/pages.yml` reconstructs it, runs TypeScript checks and tests, builds with the `/idlegamewebpage/` base path, and deploys the resulting `dist` directory to GitHub Pages.

Pages source was enabled for GitHub Actions on 2026-08-20.
