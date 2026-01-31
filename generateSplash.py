#!/usr/bin/env python3

from PIL import Image
import os
from pathlib import Path

output_dir = './public/assets/icon'
Path(output_dir).mkdir(parents=True, exist_ok=True)

# Splash screen sizes (common splash screen dimensions for mobile apps)
splash_sizes = [
    (1280, 720, 'splash-1280x720.png'),   # landscape
    (720, 1280, 'splash-720x1280.png'),   # portrait
    (2048, 1536, 'splash-2048x1536.png'), # iPad landscape
    (1536, 2048, 'splash-1536x2048.png'), # iPad portrait
]

try:
    print('Generating splash screens...')
    
    # Load the favicon and nuon.png
    favicon = Image.open('./public/favicon.png').convert('RGBA')
    nuon = Image.open('./public/nuon.png').convert('RGBA')
    
    for width, height, name in splash_sizes:
        # Create dark background (almost black with slight gradient effect)
        splash = Image.new('RGB', (width, height), (20, 20, 25))  # Very dark background
        
        # Determine layout - portrait or landscape
        is_portrait = height > width
        
        if is_portrait:
            # Portrait layout: favicon at top, nuon in center
            # Favicon size (smaller, at top)
            favicon_size = int(height * 0.15)
            favicon_resized = favicon.resize((favicon_size, favicon_size), Image.Resampling.LANCZOS)
            favicon_x = (width - favicon_size) // 2
            favicon_y = int(height * 0.15)
            splash.paste(favicon_resized, (favicon_x, favicon_y), favicon_resized)
            
            # Nuon size (larger, centered)
            nuon_size = int(height * 0.5)
            nuon_resized = nuon.resize((nuon_size, nuon_size), Image.Resampling.LANCZOS)
            nuon_x = (width - nuon_size) // 2
            nuon_y = int(height * 0.35)
            splash.paste(nuon_resized, (nuon_x, nuon_y), nuon_resized)
        else:
            # Landscape layout: favicon and nuon side by side
            # Favicon (left side)
            favicon_size = int(height * 0.4)
            favicon_resized = favicon.resize((favicon_size, favicon_size), Image.Resampling.LANCZOS)
            favicon_x = int(width * 0.15)
            favicon_y = (height - favicon_size) // 2
            splash.paste(favicon_resized, (favicon_x, favicon_y), favicon_resized)
            
            # Nuon (right side)
            nuon_size = int(height * 0.6)
            nuon_resized = nuon.resize((nuon_size, nuon_size), Image.Resampling.LANCZOS)
            nuon_x = int(width * 0.55)
            nuon_y = (height - nuon_size) // 2
            splash.paste(nuon_resized, (nuon_x, nuon_y), nuon_resized)
        
        output_path = os.path.join(output_dir, name)
        splash.save(output_path, 'PNG')
        print(f'✓ Generated {name}')
    
    print('✓ All splash screens generated successfully!')

except Exception as e:
    print(f'Error generating splash screens: {e}')
    exit(1)
