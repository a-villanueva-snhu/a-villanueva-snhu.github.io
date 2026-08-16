$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$artifactsDir = Join-Path $repoRoot "artifacts"
$manifestPath = Join-Path $artifactsDir "manifest.json"

if (-not (Test-Path $artifactsDir)) {
  throw "Artifacts directory not found: $artifactsDir"
}

$excluded = @(
  "index.md",
  "readme.md",
  "manifest.json",
  "layout.json"
)

$files = Get-ChildItem -Path $artifactsDir -Recurse -File |
  Where-Object { $excluded -notcontains $_.Name.ToLowerInvariant() } |
  ForEach-Object {
    $_.FullName.Substring($artifactsDir.Length).TrimStart('\\') -replace '\\', '/'
  } |
  Sort-Object

$manifest = [ordered]@{
  files = $files
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "Updated $manifestPath with $($files.Count) file entries."
