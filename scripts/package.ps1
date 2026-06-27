# Packages the Gitlift extension into a Chrome Web Store upload ZIP.
# Reads the version from manifest.json and writes dist/gitlift-<version>.zip
# containing only the runtime files (manifest, icons, src).

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version

$distDir = Join-Path $root 'dist'
New-Item -ItemType Directory -Force -Path $distDir | Out-Null

$zipPath = Join-Path $distDir ("gitlift-{0}.zip" -f $version)
if (Test-Path $zipPath) { Remove-Item $zipPath }

Compress-Archive -Path 'manifest.json', 'icons', 'src' -DestinationPath $zipPath

$size = [Math]::Round((Get-Item $zipPath).Length / 1KB, 1)
Write-Host "Packaged $zipPath ($size KB)" -ForegroundColor Green
