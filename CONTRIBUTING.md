# Contributing to DevHance

First off, thank you for considering contributing to DevHance! 🎉

It's people like you that make DevHance such a great tool for developers everywhere.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- PostgreSQL database
- Git

### Local Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/devhance.git
   cd devhance
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/devhance/devhance.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Fill in your credentials
   ```

6. **Set up database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

7. **Start development server**:
   ```bash
   pnpm dev
   ```

---

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-pdf-export` — New features
- `fix/login-redirect-bug` — Bug fixes
- `docs/update-api-reference` — Documentation
- `refactor/optimize-ai-prompts` — Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, no code change
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding tests
- `chore` — Maintenance tasks

**Examples:**
```
feat(case-study): add PDF export functionality
fix(auth): resolve redirect loop on sign-out
docs(readme): update installation instructions
```

---

## Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them

4. **Run tests and linting**:
   ```bash
   pnpm lint
   pnpm build
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against `main`

### PR Requirements

- [ ] Code builds without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] PR description explains the changes
- [ ] Screenshots included for UI changes
- [ ] Documentation updated if needed

---

## Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for complex functions

```javascript
// ✅ Good
const getCaseStudyBySlug = async (slug) => {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug },
  });
  return caseStudy;
};

// ❌ Bad
const get = async (s) => {
  return await prisma.caseStudy.findUnique({ where: { slug: s } });
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Extract repeated patterns to components
- Follow mobile-first responsive design

### File Organization

- Components in `components/`
- UI primitives in `components/ui/`
- Page-specific components in `components/[page-name]/`
- Utilities in `lib/`

---

## Reporting Bugs

### Before Reporting

1. Check existing issues to avoid duplicates
2. Update to the latest version
3. Try to reproduce with minimal setup

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.19.0]

**Screenshots**
If applicable, add screenshots.
```

---

## Suggesting Features

We love feature suggestions! Please include:

1. **Problem Statement** — What problem does this solve?
2. **Proposed Solution** — How would you like it to work?
3. **Alternatives Considered** — Other approaches you thought of
4. **Additional Context** — Mockups, examples, etc.

---

## Questions?

Feel free to reach out:

- **Email**: [shreyas@devhance.in](mailto:shreyas@devhance.in)
- **Twitter**: [@devhance](https://twitter.com/devhance)
- **Discussions**: Open a GitHub Discussion

---

Thank you for contributing! 🚀
