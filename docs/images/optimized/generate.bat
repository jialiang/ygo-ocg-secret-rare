"%~dp0magick.exe" ../source/artwork.png -colorspace RGB -filter Lanczos -resize 540x540 -colorspace sRGB artwork.png
"%~dp0magick.exe" ../artwork-mask.png -colorspace RGB -filter Lanczos -resize 540x540 -colorspace sRGB artwork-mask.png
"%~dp0magick.exe" ../stock.png -colorspace RGB -filter Lanczos -resize 354x516 -colorspace sRGB stock.png

"%~dp0cwebp.exe" -q 98 -m 6 -pass 10 -mt -sharp_yuv artwork.png -o artwork.webp
"%~dp0cwebp.exe" -q 97 -m 6 -pass 10 -mt -sharp_yuv stock.png -o stock.webp

"%~dp0avifenc.exe" -q 77 -s 0 --sharpyuv artwork.png artwork.avif
"%~dp0avifenc.exe" -q 82 -s 0 --sharpyuv artwork.png artwork.avif
