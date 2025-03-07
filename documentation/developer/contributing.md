# Contributing to PromptNova

## Introduction

Thank you for considering contributing to PromptNova! This document provides guidelines and instructions for contributing to the project. By following these guidelines, you help maintain the quality and consistency of the codebase.

## Code of Conduct

All contributors are expected to adhere to our Code of Conduct. Please read and follow it to ensure a positive and respectful environment for everyone.

## Getting Started

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/ewertonleonardo/promptnova.git`
3. Install dependencies: `npm install`
4. Set up Husky hooks: `npm run setup-husky`
5. Start the development server: `npm run dev`

### Project Structure

Familiarize yourself with the project structure as described in the [Architecture Documentation](./architecture.md).

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent fixes for production

### Creating a New Feature or Fix

1. Create a new branch from `develop`:

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Implement your changes
3. Write or update tests
4. Ensure all tests pass: `npm test`
5. Commit your changes following the commit guidelines

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:

```bash
feat(prompt): add support for nested placeholders

Implements nested placeholder functionality to allow for more complex prompt structures.

Closes #123
```

## Pull Request Process

1. Update your branch with the latest changes from `develop`
2. Push your branch to your fork
3. Create a pull request to the `develop` branch of the main repository
4. Ensure the PR description clearly describes the changes and references any related issues
5. Wait for code review and address any feedback

## Code Standards

### TypeScript

- Follow the TypeScript best practices
- Use proper typing and avoid `any` when possible
- Document complex functions and components with JSDoc comments

### React

- Use functional components and hooks
- Follow the component structure as defined in the project
- Ensure components are properly typed

### Testing

- Write unit tests for new functionality
- Update existing tests when modifying code
- Aim for good test coverage

### Accessibility

- Ensure all UI components are accessible
- Follow WCAG 2.1 AA standards
- Test with screen readers and keyboard navigation

## Documentation

- Update documentation when adding or changing features
- Document APIs, components, and important functions
- Keep the README and other documentation up to date

## Release Process

1. The release manager will merge `develop` into `main`
2. A new version will be created following semantic versioning
3. Release notes will be generated from commit messages
4. The new version will be built and distributed

## Getting Help

If you need help or have questions:

1. Check the existing documentation
2. Look for similar issues in the issue tracker
3. Ask in the community forum
4. Create a new issue with the "question" label

Thank you for contributing to PromptNova! Your efforts help make this project better for everyone.
