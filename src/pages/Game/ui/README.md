# Game UI Structure

The Game UI has been organized into a modular structure for better maintainability and scalability.

## Folder Structure

```
ui/
├── index.ts              # Main UI export file
├── ui.css                # Shared UI styles (glass theme)
├── screens/              # Screen components (full page views)
│   ├── StartScreen.tsx   # Game start screen
│   ├── WinScreen.tsx     # Level win screen
│   └── index.ts
├── loaders/              # Loader/input components
│   ├── LevelLoader.tsx   # Level JSON loader
│   └── index.ts
└── shared/               # Shared/reusable UI components
    ├── FpsCounter.tsx    # FPS display overlay
    ├── FpsCounter.css
    └── index.ts
```

## Usage

### Importing Components

```typescript
// From main UI index
import { StartScreen, WinScreen, LevelLoader, FpsCounter } from './ui';

// Or from specific folders
import { StartScreen } from './ui/screens';
import { FpsCounter } from './ui/shared';
```

### Component Details

#### Screens
- **StartScreen** - Displays game introduction and start button
- **WinScreen** - Displays win message and play again button

#### Loaders
- **LevelLoader** - Handles JSON level loading from paste input

#### Shared
- **FpsCounter** - Displays real-time FPS counter (top-right overlay)

## Styling

All UI components use the shared glass-morphism theme defined in `ui.css`:
- `.glass-card` - Card with frosted glass effect
- `.glass-button` - Button with frosted glass effect
- Core page styles and colors

Specific component styles are in their respective CSS files:
- `FpsCounter.css` - FPS counter overlay styling

## Adding New Components

1. Create component in appropriate subfolder:
   - **Screens** - For full-page or modal components
   - **Loaders** - For data input/loading components
   - **Shared** - For reusable UI elements

2. Import `ui.css` for glass theme styles
3. Export from folder's `index.ts`
4. Export from main `ui/index.ts`

## Backward Compatibility

The original `components/` folder still exports all components via re-exports, allowing existing code to continue working.
