# Generates Gitlift extension icons (16/48/128 px) using .NET System.Drawing.
Add-Type -AssemblyName System.Drawing

$sizes = 16, 48, 128
$outDir = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    # Rounded green background.
    $green = [System.Drawing.Color]::FromArgb(22, 163, 74)
    $brush = New-Object System.Drawing.SolidBrush($green)
    $radius = [Math]::Max(2, [int]($size * 0.22))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)

    # Upward arrow glyph "⇡".
    $fontSize = [int]($size * 0.62)
    $font = New-Object System.Drawing.Font('Segoe UI Symbol', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString([char]0x21E1, $font, $white, $rect, $fmt)

    $g.Dispose()
    $outPath = Join-Path $outDir ("icon{0}.png" -f $size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $outPath"
}
