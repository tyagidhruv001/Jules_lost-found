# Contributing to GLA Lost & Found Portal

Thank you for your interest in contributing to the GLA Lost & Found Portal! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- Firebase account (for testing)
- Cloudinary account (for image uploads)

### Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lost-found.git
   cd lost-found
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend (optional)
   cd ../backend
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/`
   - Fill in your Firebase and Cloudinary credentials
   - See README.md for detailed configuration instructions

4. **Start Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

## 📋 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests

**Examples:**
- `feature/add-notification-system`
- `fix/login-redirect-issue`
- `docs/update-setup-guide`

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add email verification step
fix(upload): resolve cloudinary timeout issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run the dev server and test manually
   npm run dev
   
   # Build to check for errors
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers
     - Screenshots (if UI changes)
     - Testing steps

## 🎨 Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Use meaningful variable and function names
- Keep components small and focused
- Use PropTypes or TypeScript for type checking
- Follow ESLint rules (if configured)

**Example:**
```javascript
// Good
const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// Avoid
const UP = (props) => {
  const [u, setU] = useState(null);
  // ...
};
```

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow the existing glassmorphism design system
- Ensure responsive design (mobile-first)
- Test on different screen sizes

### File Organization
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── pages/             # Page components
├── services/          # API and service functions
├── config/            # Configuration files
└── utils/             # Utility functions
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test on Chrome, Firefox, and Safari
- [ ] Test on mobile devices (responsive design)
- [ ] Test authentication flow
- [ ] Test image uploads
- [ ] Test form validations
- [ ] Check console for errors
- [ ] Verify Firebase security rules

### Before Submitting PR
- [ ] Code builds without errors
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] All new features are documented
- [ ] Environment variables are in `.env.example`

## 🐛 Reporting Bugs

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version
- **Console Logs**: Any error messages

## 💡 Suggesting Features

Feature suggestions are welcome! Please include:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Additional Context**: Mockups, examples, etc.

## 📚 Documentation

When adding new features:
- Update README.md if needed
- Add JSDoc comments for functions
- Update `.env.example` for new environment variables
- Create or update relevant documentation

## 🔒 Security

- **Never commit** `.env` files or credentials
- **Always use** environment variables for sensitive data
- **Report security vulnerabilities** privately via email
- **Follow** Firebase security best practices

## ❓ Questions?

- Open an issue for general questions
- Check existing issues and documentation first
- Be specific and provide context

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GLA Lost & Found Portal! 🎉
