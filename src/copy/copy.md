# Yu-Gi-Oh! OCG Secret Rare Effect with CSS

## Background

This project was first published in January 2021. In March 2025, I re-evaluated my past projects and found this one as the most in need of a revamp.

Remembering Simon Goellner's amazing [Pokémon Cards Holographic Effect in CSS](https://poke-holo.simey.me/) from 2022, I decided to explore and apply his technique.

If you have any suggestions for improvements, do leave a comment on the [Github Repo](https://github.com/jialiang/ygo-ocg-secret-rare).

## Spotlight Layer

The Spotlight layer features a dark noise texture over a white-to-transparent radial gradient. It blends with the content below using the Plus-Lighter blend mode. Plus-Lighter sums the pixel values of the top and bottom layers.

This [Plus-Lighter vs Color Dodge vs Screen Output Comparison Graph](https://www.desmos.com/calculator/g8wmd3dsak) compares Plus-Lighter with other similar blend modes.

Plus-Lighter can simulate a bright light even at low strength, which preserves contrast and thereby details. It does so by enforcing a value floor and allowing overexposure. The former delineates the light spot and the latter conveys brightness.

## Holographic Foil Layer

In the Holographic Foil layer, a rainbow linear gradient blends with a black-white layer mask using the Color blend mode. The output has the former's hue and saturation, and the latter's lightness.

This output is then blended with the content below using the Color Dodge blend mode. Color Dodge works like a highlighter. It brightens the bottom layer based on the top layer's values. If the top layer is black, the bottom layer stays the same.

On Safari 18.2 and earlier, 2 bugs were encountered:

1. Blending with Color fails between elements on different composition layers. Since CSS transform promotes elements to their own composition layer, CPU-heavy background position changes were used for animations instead. [Bug report on Webkit Bugzilla](https://bugs.webkit.org/show_bug.cgi?id=196303).
2. Elements on composition layers that underwent tiling also fail to blend. Tiling is when browsers split layers into distinct regions to be rendered progressively. This issue was happening to the rainbow gradient, setting it no-repeat solved the problem. [Bug report on Webkit Bugzilla](https://bugs.webkit.org/show_bug.cgi?id=250828).

On the latest version of Firefox, 2 different bugs were encountered:

1. On Intel GPUs, blending with Color Dodge wrongly outputs a dark color when the top layer is white and has a specific opacity. In my case, the issue occurs only at 90% opacity, sidestepping this value avoids the issue. [Bug report on Mozilla Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1591918).
2. Perspective transformed elements can appear blurry from being rendered at an incorrectly low internal resolution. To fix this, the card was made 25% larger and scaled back to the intended size using CSS transform. [Bug report on Mozilla Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1806281).

## Name and Hologram Layer

The shininess of the Name and Hologram is created by applying a CSS mask on an element containing a white-to-transparent radial gradient.

## Other Implementation Details

The Japanese texts were meant to be actual text instead of SVG images. Because browsers avoid blurring text for legibility, the small font sizes made them harsh and overly bold: [Comparison of 9px text (top) vs image (bottom)](./images/linked/text%20vs%20image%20rendering.png). Also, Chrome 117 and earlier have a 10px minimum font size default for Japanese. The card would need to be huge to accommodate such a minimum.

For raster images, the WEBP and AVIF formats are used. To balance file size and quality, an SSIM score above 0.99 is targeted.

The [Official Proxy](./images/linked/official%20proxy.png) from the [Infinity Chasers announcement page](https://yu-gi-oh.jp/news_detail.php?page=details&&id=497) is used as reference. For fans, I also found an official [Madame Verre 9/17 Cute Day Promotional Image](./images/linked/cute%20day.png).

## Accessibility

I've tested this webpage with NVDA (Non-Visual Desktop Access) and found all text and key elements to make sense to non-screen users.

This webpage should be compatible with major browsers released in the last year or maybe older. The oldest browser I have available for testing is Safari 15.4 released in March 2022.

## Credits

- The [artwork for the card](https://www.deviantart.com/alanmac95/art/Witchcraft-Master-Verre-Full-Artwork-775338144) was created by Alan.
- The card stock was sourced from Alixsep's [Ultimate HQ Yu-Gi-Oh! Series 10 Card Template](https://www.deviantart.com/alixsep/art/Ultimate-HQ-Yu-Gi-Oh-Series-10-Card-Template-845251557).
- The hologram was taken from Icycatelf's [YGO Series 10 Master PSD](https://www.deviantart.com/icycatelf/art/YGO-Series-10-Master-PSD-676448168).
- The [attribute icon](https://yugipedia.com/wiki/File:LIGHT.svg) was made by Falzar FZ.
