# Contributing to Mining Marketplace

Thank you for your interest in contributing to the Mining Marketplace project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mining-marketplace.git
cd mining-marketplace

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Project Structure

```
mining-marketplace/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── index.ts          # Main application
│   └── index.test.ts     # Unit tests
├── dist/                 # Compiled JavaScript
├── .eslintrc.js         # ESLint configuration
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
├── package.json
└── README.md
```

## Contributing Guidelines

### Coding Standards

- Use TypeScript for type safety
- Follow consistent naming conventions
- Write clean, documented code
- Use async/await for asynchronous operations
- Handle errors appropriately

### x402 Integration

When adding x402 payment functionality:

1. Use `@coinbase/x402` SDK
2. Define clear prices for each endpoint
3. Test payment flows thoroughly
4. Document payment requirements

## Pull Request Process

1. Update the README.md with details of changes to the interface if applicable
2. Update the CHANGELOG.md if applicable
3. Ensure all CI checks pass
4. Add tests for new functionality
5. Request review from maintainers

### PR Requirements

- Minimum 1 approving review from maintainers
- All CI checks must pass
- Code must pass linting
- Test coverage must meet threshold (70%)

## Commit Messages

Use conventional commit format:

```
type: scope: description

type: feat, fix, docs, style, refactor, test, chore
scope: optional component name
description: brief description
```

Examples:
- `feat(api): add mining rig inventory endpoint`
- `fix(payment): resolve x402 signature validation issue`
- `docs(readme): update API documentation`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

Target minimum coverage: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **Lint**: ESLint code quality checks
- **Build**: TypeScript compilation
- **Test**: Unit tests with coverage
- **x402 Integration Test**: Verify x402 payment integration
- **Security Scan**: npm audit security checks
- **Deploy**: Automatic deployment to Fly.io on main branch

## Questions or Issues?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed reproduction steps for bugs