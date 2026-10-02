$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 24 or newer first.' }
if (-not (Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) {
    & npm.cmd ci --registry=https://registry.npmjs.org
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
Write-Host 'PromoCheck: http://127.0.0.1:5193/ — keep this terminal open. Ctrl+C stops it.'
& npm.cmd run dev
exit $LASTEXITCODE
