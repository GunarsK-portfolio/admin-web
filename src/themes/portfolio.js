/**
 * Portfolio theme overrides for Naive UI
 *
 * Light mode: Warm off-white backgrounds with carmine accents
 * Dark mode: Warm dark grays with softer red accents
 */

const primary = {
  base: '#9E1B34',
  hover: '#B42A45',
  pressed: '#7A1528',
  // Lighter variant for dark mode (WCAG 2.1 AA compliant - 3.5:1 contrast on #2A2928)
  light: '#D4566C',
  lightHover: '#E06B80',
}

/**
 * Light theme overrides
 */
export const lightOverrides = {
  common: {
    // Primary accent
    primaryColor: primary.base,
    primaryColorHover: primary.hover,
    primaryColorPressed: primary.pressed,

    // Success - warm forest green
    successColor: '#2E7D4A',
    successColorHover: '#3A9A5C',
    successColorPressed: '#24633B',

    // Warm backgrounds
    bodyColor: '#FAF9F7',
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',

    // Warm borders
    borderColor: '#D9D4CD',
    dividerColor: '#E8E4DF',
  },
}

/**
 * Dark theme overrides
 */
export const darkOverrides = {
  common: {
    // Primary accent (lighter for dark mode contrast)
    primaryColor: primary.light,
    primaryColorHover: primary.lightHover,
    primaryColorPressed: primary.hover,

    // Success - lighter forest green for dark mode
    successColor: '#4CAF6A',
    successColorHover: '#5FBF7A',
    successColorPressed: '#3A9A5C',

    // Warm dark backgrounds
    bodyColor: '#1A1918',
    cardColor: '#2A2928',
    modalColor: '#2E2D2B',
    popoverColor: '#333231',

    // Warm dark borders
    borderColor: '#4A4745',
    dividerColor: '#3D3B39',
  },
}
