# Generates branded 1280x800 store screenshot canvases for Gitlift.
# Drop your captured screenshots into the white frame area in any image editor.
Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'store-assets'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$W = 1280; $H = 800

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90)
    $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

function New-Canvas([string]$name, [string]$title, [string]$subtitle, [bool]$frame) {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background gradient.
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $c1 = [System.Drawing.Color]::FromArgb(248, 250, 252)
    $c2 = [System.Drawing.Color]::FromArgb(226, 232, 240)
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 90)
    $g.FillRectangle($bg, $rect)

    # Logo tile.
    $green = [System.Drawing.Color]::FromArgb(22, 163, 74)
    $greenBrush = New-Object System.Drawing.SolidBrush($green)
    $logo = New-RoundedPath 64 56 60 60 14
    $g.FillPath($greenBrush, $logo)
    $arrowFont = New-Object System.Drawing.Font('Segoe UI Symbol', 34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString([char]0x21E1, $arrowFont, $white, (New-Object System.Drawing.RectangleF(64, 56, 60, 60)), $fmt)

    # Wordmark.
    $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $brand = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString('Gitlift', $brand, $dark, 140, 68)

    # Title + subtitle.
    $titleFont = New-Object System.Drawing.Font('Segoe UI', 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($title, $titleFont, $dark, 64, 150)
    $slate = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $subFont = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($subtitle, $subFont, $slate, 66, 214)

    if ($frame) {
        # Drop-zone frame (paste your screenshot here).
        $fx = 160; $fy = 280; $fw = 960; $fh = 470
        $shadow = New-RoundedPath ($fx + 6) ($fy + 10) $fw $fh 18
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 15, 23, 42))
        $g.FillPath($shadowBrush, $shadow)
        $card = New-RoundedPath $fx $fy $fw $fh 18
        $g.FillPath($white, $card)
        $penColor = [System.Drawing.Color]::FromArgb(203, 213, 225)
        $pen = New-Object System.Drawing.Pen($penColor, 2)
        $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $g.DrawPath($pen, $card)
        $hintFont = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $g.DrawString('Paste your screenshot here', $hintFont, $slate, (New-Object System.Drawing.RectangleF($fx, $fy, $fw, $fh)), $fmt)
    }

    $g.Dispose()
    $out = Join-Path $outDir $name
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $out"
}

New-Canvas 'screenshot-1.png' 'Solve. Commit. Done.' 'Every accepted solution, automatically on GitHub.' $true
New-Canvas 'screenshot-2.png' 'One commit per solve' 'Organized by site and problem, with code and notes.' $true
New-Canvas 'screenshot-3.png' 'Connect in seconds' 'GitHub OAuth or a personal access token.' $true
