/**
 * Font Utilities
 * Helpers for font loading and management
 */

// Cache for loaded fonts
const loadedFonts = new Set();

/**
 * Load a font dynamically
 * @param {string} fontFamily - Font family name
 * @param {string} fontUrl - URL to the font file
 * @param {Object} [options] - Font options
 * @param {string} [options.fontStyle='normal'] - Font style
 * @param {string} [options.fontWeight='normal'] - Font weight
 * @param {string} [options.fontDisplay='swap'] - Font display strategy
 * @returns {Promise<void>} Promise that resolves when the font is loaded
 */
export function loadFont(fontFamily, fontUrl, options = {}) {
  // Return early if font already loaded
  const fontKey = `${fontFamily}-${fontUrl}`;
  if (loadedFonts.has(fontKey)) {
    return Promise.resolve();
  }
  
  // Set default options
  const {
    fontStyle = 'normal',
    fontWeight = 'normal',
    fontDisplay = 'swap'
  } = options;
  
  // Create @font-face declaration
  const fontFace = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('woff2'),
           url('${fontUrl}') format('woff');
      font-style: ${fontStyle};
      font-weight: ${fontWeight};
      font-display: ${fontDisplay};
    }
  `;
  
  // Add style element
  const style = document.createElement('style');
  style.textContent = fontFace;
  document.head.appendChild(style);
  
  // Load font using FontFace API if available
  if ('FontFace' in window) {
    const font = new FontFace(
      fontFamily,
      `url(${fontUrl})`,
      {
        style: fontStyle,
        weight: fontWeight,
        display: fontDisplay
      }
    );
    
    return font.load()
      .then(loadedFont => {
        document.fonts.add(loadedFont);
        loadedFonts.add(fontKey);
      })
      .catch(error => {
        console.error(`Error loading font ${fontFamily}:`, error);
      });
  }
  
  // Fallback to simpler approach
  return new Promise(resolve => {
    // Create test element
    const testElement = document.createElement('span');
    testElement.style.fontFamily = `'${fontFamily}', monospace`;
    testElement.style.fontSize = '0';
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'Font loaded test';
    document.body.appendChild(testElement);
    
    // Set timeout to allow font to load
    setTimeout(() => {
      document.body.removeChild(testElement);
      loadedFonts.add(fontKey);
      resolve();
    }, 50);
  });
}

/**
 * Check if a font is available in the browser
 * @param {string} fontFamily - Font family to check
 * @returns {boolean} Whether the font is available
 */
export function isFontAvailable(fontFamily) {
  // Use font detection technique
  const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const testSize = '72px';
  const testFonts = [`${fontFamily}`, 'monospace'];
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return false;
  
  canvas.width = 500;
  canvas.height = 100;
  
  let baseFontWidth;
  
  // Measure with monospace font
  context.font = `${testSize} monospace`;
  baseFontWidth = context.measureText(testString).width;
  
  // Measure with requested font family
  context.font = `${testSize} ${fontFamily}, monospace`;
  const testFontWidth = context.measureText(testString).width;
  
  // If widths are different, font is probably loaded
  return testFontWidth !== baseFontWidth;
}

/**
 * Get a list of system fonts available on the device
 * @returns {Promise<string[]>} Promise that resolves with available fonts
 */
export function getAvailableFonts() {
  if (!('queryLocalFonts' in window)) {
    return Promise.reject(new Error('queryLocalFonts API not available'));
  }
  
  return window.queryLocalFonts()
    .then(fontData => {
      return [...new Set(fontData.map(font => font.family))];
    })
    .catch(error => {
      console.error('Error querying local fonts:', error);
      return [];
    });
}

/**
 * Get common dyslexia-friendly fonts available on the system
 * @returns {string[]} List of dyslexia-friendly fonts
 */
export function getDyslexiaFriendlyFonts() {
  const dyslexiaFonts = [
    'OpenDyslexic',
    'Comic Sans MS',
    'Lexie Readable',
    'Sylexiad',
    'Dyslexie',
    'Read Regular',
    'Verdana',
    'Tahoma',
    'Century Gothic',
    'Trebuchet MS',
    'Arial'
  ];
  
  return dyslexiaFonts;
}