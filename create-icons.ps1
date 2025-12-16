# Create simple PNG icons for PWA
Add-Type -AssemblyName System.Drawing

$sizes = @(192, 512)
$iconFolder = "icons"

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Background gradient (dark)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 21))
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Draw a simple flask shape
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 255, 255), [Math]::Max(2, $size/50))
    
    # Flask body outline
    $scale = $size / 512
    $points = @(
        [System.Drawing.PointF]::new(180*$scale, 140*$scale),
        [System.Drawing.PointF]::new(180*$scale, 280*$scale),
        [System.Drawing.PointF]::new(150*$scale, 380*$scale),
        [System.Drawing.PointF]::new(170*$scale, 420*$scale),
        [System.Drawing.PointF]::new(342*$scale, 420*$scale),
        [System.Drawing.PointF]::new(362*$scale, 380*$scale),
        [System.Drawing.PointF]::new(332*$scale, 280*$scale),
        [System.Drawing.PointF]::new(332*$scale, 140*$scale)
    )
    $graphics.DrawPolygon($pen, $points)
    
    # Flask neck
    $graphics.DrawLine($pen, 180*$scale, 140*$scale, 180*$scale, 100*$scale)
    $graphics.DrawLine($pen, 180*$scale, 100*$scale, 200*$scale, 80*$scale)
    $graphics.DrawLine($pen, 200*$scale, 80*$scale, 312*$scale, 80*$scale)
    $graphics.DrawLine($pen, 312*$scale, 80*$scale, 332*$scale, 100*$scale)
    $graphics.DrawLine($pen, 332*$scale, 100*$scale, 332*$scale, 140*$scale)
    
    # Liquid (magenta)
    $liquidBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 255, 0, 255))
    $liquidPoints = @(
        [System.Drawing.PointF]::new(165*$scale, 350*$scale),
        [System.Drawing.PointF]::new(175*$scale, 410*$scale),
        [System.Drawing.PointF]::new(337*$scale, 410*$scale),
        [System.Drawing.PointF]::new(347*$scale, 350*$scale),
        [System.Drawing.PointF]::new(320*$scale, 300*$scale),
        [System.Drawing.PointF]::new(192*$scale, 300*$scale)
    )
    $graphics.FillPolygon($liquidBrush, $liquidPoints)
    
    # Bubbles
    $pinkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 255, 0, 255))
    $graphics.FillEllipse($pinkBrush, (220-15)*$scale, (350-15)*$scale, 30*$scale, 30*$scale)
    
    $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 0, 255, 255))
    $graphics.FillEllipse($cyanBrush, (280-10)*$scale, (370-10)*$scale, 20*$scale, 20*$scale)
    
    $yellowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 255, 255, 0))
    $graphics.FillEllipse($yellowBrush, (250-12)*$scale, (330-12)*$scale, 24*$scale, 24*$scale)
    
    # Text "LM"
    if ($size -ge 192) {
        $font = New-Object System.Drawing.Font("Arial", (50*$scale), [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 0, 255))
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $graphics.DrawString("LM", $font, $textBrush, ($size/2), (440*$scale), $sf)
    }
    
    $graphics.Dispose()
    
    $filePath = Join-Path $iconFolder "icon-$size.png"
    $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    
    Write-Host "Created: $filePath"
}

Write-Host "Icons created successfully!"







