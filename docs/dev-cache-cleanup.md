# Next.js dev cache cleanup

`.next/dev` can grow quickly during local development because Next.js stores incremental build artifacts, route/type validators, and module graph cache for fast HMR and repeated rebuilds.

## Check cache size (PowerShell)

```powershell
# .next/dev size (MB)
if (Test-Path .next/dev) {
  $devBytes = (Get-ChildItem .next/dev -Recurse -File | Measure-Object -Property Length -Sum).Sum
  "{0:N2} MB" -f ($devBytes / 1MB)
} else {
  ".next/dev not found"
}

# .next total size (MB)
if (Test-Path .next) {
  $nextBytes = (Get-ChildItem .next -Recurse -File | Measure-Object -Property Length -Sum).Sum
  "{0:N2} MB" -f ($nextBytes / 1MB)
} else {
  ".next not found"
}
```

## Cleanup scripts

- `npm run clean`: remove all `.next`
- `npm run clean:dev`: remove only `.next/dev`
- `npm run dev:clean`: remove `.next` and start dev server

## Notes

- These are local cache cleanups only; source code and production behavior are unaffected.
- Use `clean:dev` first for lightweight cleanup.
- Use `clean` or `dev:clean` when route/type cache is stale or after major branch switches.
