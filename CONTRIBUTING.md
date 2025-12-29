# Contributing to vue-intent

Thank you for your interest in contributing to vue-intent! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/vue-intent.git
   cd vue-intent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Run tests with coverage**
   ```bash
   npm run test:coverage
   ```

5. **Build the package**
   ```bash
   npm run build
   ```

6. **Type checking**
   ```bash
   npm run type-check
   ```

## Project Structure

```
vue-intent/
├── src/
│   ├── composables/        # Vue composables
│   ├── components/         # Vue components
│   ├── directives/         # Vue directives
│   ├── types/              # TypeScript definitions
│   ├── plugin.ts           # Vue plugin
│   └── index.ts            # Main entry point
├── tests/                  # Test files
├── examples/               # Example applications
└── docs/                   # Documentation
```

## Code Style

- Use TypeScript for all new code
- Follow existing code style (enforced by ESLint)
- Write descriptive commit messages
- Add JSDoc comments for public APIs
- Avoid `any` types - use proper TypeScript types

## Testing Requirements

- Write unit tests for all new features
- Ensure existing tests pass
- Aim for >90% code coverage
- Test edge cases and error scenarios
- Use meaningful test descriptions

### Running Specific Tests

```bash
# Run specific test file
npm test -- useIntent.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm test -- --ui
```

## Pull Request Process

1. **Fork the repository** and create your branch from `main`

2. **Make your changes**
   - Write clean, maintainable code
   - Add tests for new features
   - Update documentation as needed

3. **Ensure tests pass**
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add new composable for intent history
     fix: resolve memory leak in useIntent
     docs: update README with new examples
     test: add tests for IntentGuard component
     ```

5. **Push to your fork** and submit a pull request

6. **Wait for review**
   - Address any feedback
   - Keep your branch up to date with main

## Reporting Bugs

When reporting bugs, please include:

- Vue version
- vue-intent version
- Browser/environment
- Minimal reproduction code
- Expected vs actual behavior
- Stack trace (if applicable)

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists
- Describe the use case clearly
- Explain why it would be valuable
- Consider submitting a PR yourself

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

- Open an issue for bugs or features
- Start a discussion for questions
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
