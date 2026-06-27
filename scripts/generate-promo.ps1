# Generates branded 1280x800 store screenshots for Gitlift by compositing the
# real captured extension UI (store-assets/raw-*.png) onto a branded canvas.
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

function New-Graphics($bmp) {
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    return $g
}

function Draw-Base($g, [string]$title, [string]$subtitle) {
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $c1 = [System.Drawing.Color]::FromArgb(248, 250, 252)
    $c2 = [System.Drawing.Color]::FromArgb(224, 231, 240)
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 90)
    $g.FillRectangle($bg, $rect)

    $green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 163, 74))
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $logo = New-RoundedPath 64 56 60 60 14
    $g.FillPath($green, $logo)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $arrowFont = New-Object System.Drawing.Font('Segoe UI Symbol', 34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString([char]0x21E1, $arrowFont, $white, (New-Object System.Drawing.RectangleF(64, 56, 60, 60)), $fmt)

    $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $brand = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString('Gitlift', $brand, $dark, 140, 68)

    $titleFont = New-Object System.Drawing.Font('Segoe UI', 46, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($title, $titleFont, $dark, 64, 150)
    $slate = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $subFont = New-Object System.Drawing.Font('Segoe UI', 23, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($subtitle, $subFont, $slate, 66, 216)
}

function Draw-Window($g, [float]$x, [float]$y, [float]$w, [float]$h) {
    $shadow = New-RoundedPath ($x + 8) ($y + 12) $w $h 18
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 15, 23, 42))
    $g.FillPath($shadowBrush, $shadow)
    $card = New-RoundedPath $x $y $w $h 18
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($white, $card)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)
    $g.DrawPath($pen, $card)
}

function Composite-Shot([string]$name, [string]$title, [string]$subtitle, [string]$imagePath) {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = New-Graphics $bmp
    Draw-Base $g $title $subtitle

    $img = [System.Drawing.Image]::FromFile($imagePath)
    $targetH = 432.0
    $scale = $targetH / $img.Height
    $w2 = [float]($img.Width * $scale)
    $h2 = $targetH
    $cx = ($W - $w2) / 2
    $cy = 322.0

    Draw-Window $g $cx $cy $w2 $h2
    $clip = New-RoundedPath $cx $cy $w2 $h2 18
    $g.SetClip($clip)
    $g.DrawImage($img, $cx, $cy, $w2, $h2)
    $g.ResetClip()
    $img.Dispose()

    $g.Dispose()
    $out = Join-Path $outDir $name
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $out"
}

function Composite-Result([string]$name, [string]$title, [string]$subtitle) {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = New-Graphics $bmp
    Draw-Base $g $title $subtitle

    $x = 290.0; $y = 322.0; $w = 700.0; $h = 432.0
    Draw-Window $g $x $y $w $h

    $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $slate = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $mono = New-Object System.Drawing.Font('Consolas', 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $monoR = New-Object System.Drawing.Font('Consolas', 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $blue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))

    # Breadcrumb header.
    $g.DrawString('coding-solutions', $mono, $blue, ($x + 28), ($y + 26))
    $g.DrawString(' / leetcode / 1-two-sum', $mono, $slate, ($x + 213), ($y + 26))
    $line = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)
    $g.DrawLine($line, ($x + 24), ($y + 64), ($x + $w - 24), ($y + 64))

    $rows = @(
        @{ icon = 'PY'; ic = [System.Drawing.Color]::FromArgb(56, 132, 255); fname = 'two-sum.py'; msg = '1. Two Sum (124 ms, 16.8 MB)' },
        @{ icon = 'MD'; ic = [System.Drawing.Color]::FromArgb(100, 116, 139); fname = 'README.md'; msg = 'Add notes for 1. Two Sum' }
    )
    $ry = $y + 92
    foreach ($r in $rows) {
        $badge = New-RoundedPath ($x + 28) $ry 44 30 7
        $g.FillPath((New-Object System.Drawing.SolidBrush($r.ic)), $badge)
        $bf = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $cfmt = New-Object System.Drawing.StringFormat
        $cfmt.Alignment = [System.Drawing.StringAlignment]::Center
        $cfmt.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString($r.icon, $bf, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), (New-Object System.Drawing.RectangleF(($x + 28), $ry, 44, 30)), $cfmt)
        $g.DrawString($r.fname, $mono, $dark, ($x + 90), ($ry + 3))
        $g.DrawString($r.msg, $monoR, $slate, ($x + 300), ($ry + 4))
        $g.DrawString('just now', $monoR, $slate, ($x + $w - 110), ($ry + 4))
        $ry += 54
    }

    # Green "Pushed" toast overlapping the bottom-right.
    $tw = 360.0; $th = 52.0
    $tx = $x + $w - $tw - 26; $ty = $y + $h - $th - 26
    $tShadow = New-RoundedPath ($tx + 4) ($ty + 6) $tw $th 12
    $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 15, 23, 42))), $tShadow)
    $toast = New-RoundedPath $tx $ty $tw $th 12
    $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 163, 74))), $toast)
    $tf = New-Object System.Drawing.Font('Segoe UI', 19, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $tfmt = New-Object System.Drawing.StringFormat
    $tfmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $toastText = [string][char]0x21E1 + ' Gitlift ' + [char]0x2014 + ' Pushed "1. Two Sum" ' + [char]0x2713
    $g.DrawString($toastText, $tf, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), (New-Object System.Drawing.RectangleF(($tx + 16), $ty, ($tw - 16), $th)), $tfmt)

    $g.Dispose()
    $out = Join-Path $outDir $name
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $out"
}

Composite-Shot 'screenshot-1.png' 'Connect in seconds' 'GitHub OAuth or a personal access token.' (Join-Path $outDir 'raw-options.png')
Composite-Shot 'screenshot-2.png' 'Track every solve' 'See your synced solutions at a glance.' (Join-Path $outDir 'raw-popup.png')
Composite-Result 'screenshot-3.png' 'One commit per solve' 'Organized by site and problem, with code and notes.'
