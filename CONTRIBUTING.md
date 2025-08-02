# Contributing to TeslaCam Video Player

Thank you for your interest in contributing to TeslaCam Video Player! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include details about your configuration and environment**

### Suggesting Enhancements

If you have a suggestion for a new feature or enhancement, please:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**

### Pull Requests

- Fork the repo and create your branch from `main`
- If you've added code that should be tested, add tests
- Ensure the test suite passes
- Make sure your code follows the existing code style
- Issue that pull request!

## Development Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Modern web browser (Safari or Firefox recommended)

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/teslaview.git
   cd teslaview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Project Structure

```
teslaview/
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── README.md             # Project documentation
├── LICENSE               # MIT License
├── CONTRIBUTING.md       # This file
├── .gitignore           # Git ignore rules
└── public/              # Static files
    ├── index.html       # Main HTML page
    ├── css/
    │   └── styles.css   # Application styles
    └── js/
        └── app.js       # Main application logic
```

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the version** in package.json if you're making significant changes
3. **Ensure all tests pass** (if applicable)
4. **Follow the existing code style** and formatting
5. **Add comments** to your code where necessary
6. **Test your changes** thoroughly in different browsers
7. **Update documentation** if you've changed functionality

## Style Guides

### JavaScript

- Use 4 spaces for indentation
- Use camelCase for variable and function names
- Use descriptive variable names
- Add comments for complex logic
- Use ES6+ features when appropriate

### CSS

- Use 4 spaces for indentation
- Use kebab-case for class names
- Group related styles together
- Use meaningful class names
- Add comments for complex selectors

### HTML

- Use 4 spaces for indentation
- Use semantic HTML elements
- Include alt attributes for images
- Use descriptive class names
- Validate HTML structure

## Testing

Before submitting a pull request, please test your changes:

1. **Test in multiple browsers** (Chrome, Firefox, Safari, Edge)
2. **Test with different TeslaCam file formats** (H.264, H.265)
3. **Test video splicing and combining features**
4. **Test responsive design** on different screen sizes
5. **Test file upload and drag-and-drop functionality**

## Reporting Bugs

When reporting bugs, please include:

- **Browser and version**
- **Operating system**
- **TeslaCam file format** (H.264/H.265)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (if any)

## Suggesting Enhancements

When suggesting enhancements, please consider:

- **User experience impact**
- **Browser compatibility**
- **Performance implications**
- **Accessibility considerations**
- **Mobile responsiveness**

## Questions or Need Help?

If you have questions or need help with contributing:

1. Check the existing issues and discussions
2. Create a new issue with the "question" label
3. Join our community discussions

## License

By contributing to TeslaCam Video Player, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TeslaCam Video Player! 🚗📹 