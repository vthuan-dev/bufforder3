param(
    [string]$OutputPath = "greeting-message-source.zip"
)

$ErrorActionPreference = "Stop"
$root = (Get-Item .).FullName
$zipFullPath = [System.IO.Path]::GetFullPath((Join-Path $root $OutputPath))

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📦 DONG GOI MA NGUON DU AN (CLEAN ZIP)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Root: $root"
Write-Host "Output File:  $zipFullPath"

# Danh sach thu muc bo qua
$excludeFolders = @(
    'node_modules',
    '.git',
    '.history',
    '.kiro',
    '.vscode',
    'build',
    'dist',
    '.vite',
    'coverage'
)

# Danh sach phan mo rong bo qua
$excludeExtensions = @(
    '.zip',
    '.log'
)

# Danh sach file bo qua
$excludeFiles = @(
    '.DS_Store',
    'Thumbs.db'
)

Write-Host "`nDang quet danh sach file..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
    $relPath = $_.FullName.Substring($root.Length + 1)
    $parts = $relPath.Split([System.IO.Path]::DirectorySeparatorChar)
    
    # Kiem tra thu muc cha
    foreach ($part in $parts[0..($parts.Length - 2)]) {
        if ($excludeFolders -contains $part) {
            return $false
        }
    }
    
    # Kiem tra extension
    if ($excludeExtensions -contains $_.Extension.ToLower()) {
        return $false
    }
    
    # Kiem tra ten file
    if ($excludeFiles -contains $_.Name) {
        return $false
    }
    
    return $true
}

$fileCount = $allFiles.Count
$rawBytes = ($allFiles | Measure-Object -Property Length -Sum).Sum
$rawMB = [math]::Round($rawBytes / 1MB, 2)

Write-Host "-> Tim thay $fileCount file hop le (Tong dung luong: $rawMB MB)" -ForegroundColor Green
Write-Host "`nDang tien hanh nen zip..." -ForegroundColor Yellow

# Xoa file cu neu ton tai
if (Test-Path $zipFullPath) {
    Remove-Item $zipFullPath -Force
}

Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

$zipStream = [System.IO.File]::Open($zipFullPath, [System.IO.FileMode]::CreateNew)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

$counter = 0
$step = [math]::Max(1, [math]::Floor($fileCount / 10))

foreach ($file in $allFiles) {
    $counter++
    $relPath = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    
    if ($counter % $step -eq 0 -or $counter -eq $fileCount) {
        $percent = [math]::Round(($counter / $fileCount) * 100)
        Write-Host "   Tien trinh: $percent% ($counter / $fileCount files)" -ForegroundColor Gray
    }
}

$archive.Dispose()
$zipStream.Dispose()

$zipItem = Get-Item $zipFullPath
$zipMB = [math]::Round($zipItem.Length / 1MB, 2)
$ratio = [math]::Round((1 - ($zipItem.Length / $rawBytes)) * 100, 1)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " HOAN TAT DONG GOI THANH CONG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "File dong goi : $zipFullPath"
Write-Host "So luong file : $fileCount files"
Write-Host "Dung luong goc: $rawMB MB"
Write-Host "Dung luong zip: $zipMB MB (Giam $ratio%)"
