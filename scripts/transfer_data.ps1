$srcRoot = "C:\IACI-data_transformation"
$dstRoot = "D:\ramsai\IACI-data_transformation"

Write-Output "Starting copy from $srcRoot to $dstRoot..."

# 1. Create target directory
if (!(Test-Path $dstRoot)) {
    New-Item -ItemType Directory -Path $dstRoot -Force | Out-Null
}

# 2. Copy items excluding .venv
$items = Get-ChildItem -Path $srcRoot
foreach ($item in $items) {
    if ($item.Name -eq ".venv") {
        Write-Output "Skipping .venv"
        continue
    }
    
    $dstPath = Join-Path $dstRoot $item.Name
    Write-Output "Copying $($item.Name)..."
    Copy-Item -Path $item.FullName -Destination $dstPath -Recurse -Force
}

Write-Output "Copy completed successfully."

# 3. Extract precipitation zip files
$precipZipDir = "D:\ramsai"
$dstPrecipDir = Join-Path $dstRoot "data\precip"

Write-Output "Creating precipitation directory at $dstPrecipDir..."
if (!(Test-Path $dstPrecipDir)) {
    New-Item -ItemType Directory -Path $dstPrecipDir -Force | Out-Null
}

$zips = Get-ChildItem -Path $precipZipDir -Filter "precip-*.zip"
foreach ($zip in $zips) {
    Write-Output "Extracting $($zip.Name) to $dstPrecipDir..."
    Expand-Archive -Path $zip.FullName -DestinationPath $dstPrecipDir -Force
}

Write-Output "All precipitation zips extracted successfully."
