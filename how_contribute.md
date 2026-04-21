# Contributing to FrameWeb Writer Tool

Thank you for your interest in contributing to FrameWeb Writer Tool! 🎉

We welcome contributions of all kinds - from bug reports and feature suggestions to code improvements and documentation updates.

## 🗣️ Ways to Contribute

### 1. Join the Discussion

Have ideas, questions, or want to discuss the project?

- **Start a [Discussion](https://github.com/alekswheeler/frameweb-writer-tool/discussions)** - Perfect for general questions, ideas, or conversations about the project
- **Open an [Issue](https://github.com/alekswheeler/frameweb-writer-tool/issues)** - Best for bug reports or specific feature requests

**When opening an issue:**

- 🐛 **Bug Report**: Describe what happened, what you expected, and steps to reproduce
- 💡 **Feature Request**: Explain the feature and why it would be valuable
- 📝 Include your environment (VS Code version, OS, FWT version)

### 2. Contribute Code

Want to fix a bug or add a feature? Follow these steps:

#### Setup Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/frameweb-writer-tool.git
   cd frameweb-writer-tool
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Generate language files**

   ```bash
   npm run langium:generate
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Test your changes**
   - Press `F5` in VS Code to open a new Extension Development Host window
   - Open any `.fwt` file from the `examples/` folder
   - Make changes and save to see the generated diagrams

#### Making Changes

1. **Create a new branch** for your feature or fix

   ```bash
   git checkout -b feature/your-feature-name
   ```

   or

   ```bash
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

3. **Test thoroughly**
   - Test your changes with various `.fwt` files
   - Ensure existing functionality still works
   - Check for console errors

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "Add/Fix: Brief description of changes"
   ```

   **Commit message guidelines:**
   - Use clear, descriptive messages
   - Start with a verb (Add, Fix, Update, Remove, etc.)
   - Keep the first line under 72 characters

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue number (if applicable)
     - Screenshots (if UI changes)
     - Testing done

## 📋 Pull Request Guidelines

- ✅ Link related issues in your PR description
- ✅ Provide a clear description of what changed and why
- ✅ Include screenshots for visual changes
- ✅ Make sure all builds pass
- ✅ Keep PRs focused - one feature/fix per PR when possible
- ✅ Be responsive to feedback and questions

## 🏗️ Project Structure

```
frameweb-writer-tool/
├── src/               # Source code
│   ├── language/      # Langium grammar and validators
│   ├── cli/          # CLI tools
│   └── extension/    # VS Code extension code
├── examples/         # Example .fwt files
└── package.json      # Extension manifest
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the project
- Help newcomers feel welcome

## ❓ Questions?

Not sure where to start? Feel free to:

- Open a [Discussion](https://github.com/alekswheeler/frameweb-writer-tool/discussions)
- Ask in an existing issue

**Thank you for contributing to FrameWeb Writer Tool! 🚀**
