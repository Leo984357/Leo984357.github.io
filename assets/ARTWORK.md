# ASCII artwork credit

The banner is **colored ASCII art**, built from a regular grid of 160 columns × 28 rows. Every visible mark is a monospace ASCII character from ` .:-=+*#%@` on a dark background. The SVG contains text elements and no embedded raster image.

- Original painting: Vincent van Gogh, *The Starry Night* (1889).
- Source: https://commons.wikimedia.org/wiki/File:VanGogh-starry_night.jpg
- Original image: https://upload.wikimedia.org/wikipedia/commons/c/cd/VanGogh-starry_night.jpg
- The source identifies the artwork and reproduction as public domain.
- Interpretation: a panoramic sky detail, sampled into character density and color. The complete character grid is displayed without stretching or additional cropping.
- Generator: https://github.com/Leo984357/Leo984357/blob/main/scripts/build_ascii_banner.py (Python + Pillow).

The website also uses a browser-rendered PNG of the same character SVG for social link previews.

## Looping character animation

The animation uses 48 deterministic frames at 8 fps (6 seconds per loop), stored in [starry-night-frames.json](starry-night-frames.json). Two local flow fields move the nebula while preserving the moon and outer regions. Characters stay on a fixed monospace grid; color and character density are sampled for each frame. The first frame preserves the static SVG's character grid.

Frame generator: [build_ascii_animation.py](https://github.com/Leo984357/Leo984357/blob/main/scripts/build_ascii_animation.py). Playback pauses off screen or in a hidden tab; the pause button holds the current frame, and reduced-motion preferences show a still frame.
