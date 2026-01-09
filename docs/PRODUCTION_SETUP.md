# Production Setup Guide

This guide covers setting up Rainy Day for production deployment.

## Prerequisites

- Node.js 20+
- Rust (latest stable)
- pnpm 9+

## Environment Variables

### Frontend (Vite)

Create `.env` in the root directory:

```bash
# Production backend URL
VITE_API_URL=https://your-api.run.app
```

### GitHub Secrets

For GitHub Actions releases, configure these secrets:

| Secret                       | Description                                                    | Required              |
| ---------------------------- | -------------------------------------------------------------- | --------------------- |
| `VITE_API_URL`               | Production backend URL                                         | ✅                    |
| `APPLE_CERTIFICATE`          | Base64-encoded .p12 certificate                                | ❌ (for signing)      |
| `APPLE_CERTIFICATE_PASSWORD` | Certificate password                                           | ❌ (for signing)      |
| `APPLE_SIGNING_IDENTITY`     | Certificate name (e.g., "Developer ID Application: Your Name") | ❌ (for signing)      |
| `APPLE_ID`                   | Apple ID email                                                 | ❌ (for notarization) |
| `APPLE_PASSWORD`             | App-specific password                                          | ❌ (for notarization) |
| `APPLE_TEAM_ID`              | Apple Developer Team ID                                        | ❌ (for notarization) |

## Creating a Release

### Option 1: Git Tag (Recommended)

```bash
# Update version in all files
# - src-tauri/tauri.conf.json
# - package.json
# - src-tauri/Cargo.toml

# Commit and tag
git add -A
git commit -m "chore: bump version to 0.3.0"
git tag v0.3.0
git push origin main --tags
```

### Option 2: Manual Trigger

Go to Actions → Release → Run workflow → Enter version.

## Build Artifacts

After the workflow completes, you'll have:

- **macOS**: `.dmg` for Apple Silicon and Intel
- **Windows**: `.msi` and `.exe` installers
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

## Local Development Build

```bash
# Build production bundle locally
VITE_API_URL=https://your-api.run.app pnpm tauri build
```

Output: `src-tauri/target/release/bundle/`

## Apple Code Signing (Future)

When you have an Apple Developer account:

1. Create "Developer ID Application" certificate
2. Export as .p12 and base64 encode: `base64 -i cert.p12 -o cert.txt`
3. Add to GitHub Secrets
4. Uncomment signing env vars in `.github/workflows/release.yml`

## Troubleshooting

### macOS: "App is damaged" error

Without code signing, users need to:

```bash
xattr -cr /Applications/Rainy\ Day.app
```

### Windows SmartScreen warning

Without code signing, users click "More info" → "Run anyway"
