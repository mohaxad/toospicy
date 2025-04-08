# Contributing to SpicyAccessibility

Thank you for considering contributing to SpicyAccessibility! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for SpicyAccessibility. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- **Use the GitHub issue tracker**. Submit bugs on the [issue tracker](https://github.com/spicydonut/spicy-accessibility/issues).
- **Use the bug report template** if available.
- **Provide detailed information** about the bug, including:
  - A clear and descriptive title
  - Exact steps to reproduce the behavior
  - Expected behavior vs actual behavior
  - Screenshots if applicable
  - Browser and OS details
  - Any console errors

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for SpicyAccessibility.

- **Use the GitHub issue tracker**.
- **Use the feature request template** if available.
- **Provide detailed information** about the enhancement, including:
  - A clear and descriptive title
  - Detailed description of the proposed functionality
  - Explanation of why this enhancement would be useful
  - Mock-ups or examples if applicable

### Pull Requests

- **Fill in the pull request template** if available.
- **Make sure all tests pass**.
- **Update documentation** if necessary.
- **Follow the coding style guide** (see below).
- **Write meaningful commit messages**.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Make your changes
6. Test your changes: `npm test`
7. Commit your changes
8. Push to your fork
9. Submit a pull request

## Coding Style Guide

### JavaScript

- Use ES6+ features.
- Follow the ESLint configuration for the project.
- Use meaningful variable and function names.
- Add JSDoc comments for functions and classes.
- Keep functions small and focused on a single task.

### CSS

- Follow BEM naming convention.
- Use CSS variables for colors and common values.
- Ensure all interactive elements have proper focus states.
- Ensure contrast ratios follow WCAG 2.1 AA guidelines.

### Accessibility

- All features should be keyboard accessible.
- Ensure all interactive elements have appropriate aria attributes.
- Test features with screen readers.
- Follow WCAG 2.1 AA guidelines.

## Project Structure

```
spicy-accessibility/
│
├── src/                      # Source code
│   ├── core/                 # Core functionality
│   ├── features/             # Feature modules
│   ├── utils/                # Utility functions
│   ├── main.js               # Main entry point
│   └── styles/               # Stylesheets
│
├── dist/                     # Distribution files
├── examples/                 # Example implementations
├── tests/                    # Tests
└── docs/                     # Documentation
```

## Adding a New Feature

1. Create a new feature module in the appropriate directory.
2. Add the feature to the main feature registry if needed.
3. Add styles for the feature.
4. Add tests for the feature.
5. Update documentation to include the new feature.

## Testing

- Run tests with `npm test`.
- Ensure your changes work in all supported browsers.
- Test with keyboard navigation.
- Test with screen readers if applicable.

## Documentation

- Update the README.md if necessary.
- Add JSDoc comments to your code.
- Update the documentation site if applicable.

## Questions?

If you have any questions about contributing, feel free to open an issue asking for clarification.

Thank you for contributing to make the web more accessible!
