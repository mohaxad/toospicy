# SpicyAccessibility

A comprehensive, modular web accessibility toolkit designed to make websites more accessible to users with various needs and preferences.

## Features

- **Text Adjustments**: Font size, dyslexia-friendly font, line/letter spacing
- **Visual Adaptations**: High contrast, dark mode, grayscale, color filters
- **Reading Aids**: Reading guide, focus mode, link highlighting
- **Navigation Support**: Page structure viewer, keyboard navigation helpers
- **Multimedia Controls**: Screen reader integration, media playback controls
- **Profiles**: Save and load accessibility configurations

## Quick Start

### CDN Usage

```html
<!-- Add to your HTML -->
<script src="https://cdn.jsdelivr.net/npm/spicy-accessibility@1.0.0/dist/spicy-accessibility.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spicy-accessibility@1.0.0/dist/spicy-accessibility.min.css">

<script>
  document.addEventListener('DOMContentLoaded', () => {
    SpicyAccessibility.init();
  });
</script>
```

### NPM Installation

```bash
npm install spicy-accessibility
```

```javascript
// In your JavaScript file
import { SpicyAccessibility } from 'spicy-accessibility';
import 'spicy-accessibility/dist/spicy-accessibility.min.css';

document.addEventListener('DOMContentLoaded', () => {
  SpicyAccessibility.init();
});
```

## Configuration

You can customize the widget's behavior with options:

```javascript
SpicyAccessibility.init({
  position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  features: ['textSize', 'contrast', 'dyslexia', 'readingGuide'], // only include specific features
  initialProfile: 'highContrast', // start with a specific profile
  language: 'en', // widget language
  theme: 'light', // 'light', 'dark', or 'auto'
  keyboardShortcut: 'alt+a', // keyboard shortcut to open widget
  autoSave: true, // save settings between sessions
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- Font Awesome for icons
- OpenDyslexic font
- Contributors and supporters
