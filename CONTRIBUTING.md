# Contributing to Valley

Welcome to **Valley**! We're excited that you're interested in contributing. As a community & club project, we welcome contributions of all kinds—whether you are fixing a bug, adding a new feature, improving game assets, or refining the documentation.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
3. [How Can I Contribute?](#how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Submitting Pull Requests](#submitting-pull-requests)
4. [Development Setup](#development-setup)
5. [Code Guidelines & Standards](#code-guidelines--standards)
6. [Commit Conventions](#commit-conventions)

---

## Code of Conduct

To foster an inclusive, welcoming, and collaborative environment for all club members and open-source contributors, please ensure your interactions remain respectful, friendly, and constructive.

---

## Contributor License Agreement (CLA)

By contributing to this repository, you agree that:
1. Your contributions are made under the project's open-source **MIT License**.
2. You grant the Valley project maintainers and community an irrevocable, perpetual, royalty-free license to use, modify, distribute, and sublicense your submitted code, assets, and documentation.
3. You represent that your contribution is your original work (or you have the rights to submit it under MIT terms).

---

## How Can I Contribute?

### Reporting Bugs
If you encounter a bug or unexpected behavior:
1. Search existing issues to verify it hasn't already been reported.
2. Open a new issue with a clear title, description, steps to reproduce, and any relevant error logs or screenshots.

### Suggesting Enhancements
We welcome ideas for new features, game mechanics, or UI improvements!
1. Open an issue describing the feature request and how it benefits the game.
2. Discuss the design approach with club maintainers before starting heavy implementation.

### Submitting Pull Requests
1. Fork the repository and create your feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and test locally (`npm run dev` and `npm run lint`).
3. Ensure your commits are clear and concise.
4. Push your branch to GitHub and submit a Pull Request (PR).
5. Link any related issues in your PR description.

---

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/valley.git
   cd valley
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run local dev server:**
   ```bash
   npm run dev
   ```

4. **Lint your code:**
   ```bash
   npm run lint
   ```

---

## Code Guidelines & Standards

- **React & JS:** Follow modern ES6+ JavaScript and React functional component patterns.
- **Canvas Engine:** Keep game engine logic clean and decoupled from UI where possible.
- **Formatting:** Ensure clean indentation, clear variable naming, and standard formatting matching the existing repository style.
- **No Broken Builds:** Run `npm run lint` and verify build success before opening a PR.

---

## Commit Conventions

Keep commit messages descriptive and clear. Example format:
- `feat: add player interaction with signs`
- `fix: resolve collision boundary issue near nexus`
- `docs: update setup instructions in README`
- `style: update dialogue box colors`

---

Thank you for contributing to Valley! 🚀
