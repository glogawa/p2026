#!/usr/bin/env python3

from PIL import Image
import os
from pathlib import Path

input_icon = './public/favicon.png'
output_dir = './public/assets/icon'

# Create output directory if it doesn't exist
Path(output_dir).mkdir(parents=True, exist_ok=True)

sizes = [
    (72, 'icon-72x72.png'),
    (96, 'icon-96x96.png'),
    (128, 'icon-128x128.png'),
    (144, 'icon-144x144.png'),
    (152, 'icon-152x152.png'),
    (192, 'icon-192x192.png'),
    (384, 'icon-384x384.png'),
    (512, 'icon-512x512.png'),
]

try:
    print('Generating PWA icons from favicon...')
    
    # Open the input icon
    img = Image.open(input_icon)
    
    # Generate all sizes
    for size, name in sizes:
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Resize with white background
        resized = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.paste(img_resized, (0, 0), img_resized)
        
        output_path = os.path.join(output_dir, name)
        resized.save(output_path, 'PNG')
        print(f'✓ Generated {name}')
    
    # Create favicon.png
    favicon_img = Image.open(input_icon)
    if favicon_img.mode != 'RGBA':
        favicon_img = favicon_img.convert('RGBA')
    
    favicon_resized = Image.new('RGBA', (64, 64), (255, 255, 255, 255))
    favicon_img_resized = favicon_img.resize((64, 64), Image.Resampling.LANCZOS)
    favicon_resized.paste(favicon_img_resized, (0, 0), favicon_img_resized)
    
    favicon_path = os.path.join(output_dir, 'favicon.png')
    favicon_resized.save(favicon_path, 'PNG')
    print('✓ Generated favicon.png')
    
    print('✓ All icons generated successfully!')

except Exception as e:
    print(f'Error generating icons: {e}')
    exit(1)
