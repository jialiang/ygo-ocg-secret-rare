"%~dp0magick.exe" ../source/artwork.png -colorspace RGB -filter Lanczos -resize 540x540 -colorspace sRGB artwork.png
"%~dp0magick.exe" ../artwork-mask.png -colorspace RGB -filter Lanczos -resize 540x540 -colorspace sRGB artwork-mask.png
"%~dp0magick.exe" ../stock.png -colorspace RGB -filter Lanczos -resize 354x516 -colorspace sRGB stock.png
"%~dp0magick.exe" ../particles.png particles.png

"%~dp0cwebp.exe" -m 6 -pass 10 -mt -sharp_yuv -lossless artwork.png -o artwork.webp
"%~dp0cwebp.exe" -m 6 -pass 10 -mt -sharp_yuv -lossless stock.png -o stock.webp

"%~dp0avifenc.exe" -s 0 --min 0 --max 63 -a end-usage=q -a cq-level=16 -a tune=ssim -a color:enable-chroma-deltaq=1 -a color:enable-qm=1 -a color:deltaq-mode=3 -a tune=ssim artwork.png artwork.avif
"%~dp0avifenc.exe" -s 0 --min 0 --max 63 -a end-usage=q -a cq-level=16 -a tune=ssim -a color:enable-chroma-deltaq=1 -a color:enable-qm=1 -a color:deltaq-mode=3 stock.png stock.avif
