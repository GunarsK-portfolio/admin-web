# GitHub Actions CI/CD

## Workflows

### CI Pipeline (`ci.yml`)

Comprehensive continuous integration pipeline that runs on:

- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

1. **Lint** - ESLint and Prettier formatting checks
2. **Build** - Build production bundle with Vite
3. **Security Audit** - npm audit for dependency vulnerabilities
4. **Docker Build & Scan** - Build image and scan with Trivy for vulnerabilities

**Security Features:**

- Results uploaded to GitHub Security tab (SARIF format)
- Fails on CRITICAL/HIGH vulnerabilities
- npm audit for known vulnerabilities

## Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/GunarsK-portfolio/admin-web/workflows/CI/badge.svg)
```

## Local Testing

Using Task:

```bash
task lint           # Run ESLint
task format-check   # Check Prettier formatting
task build          # Build for production
task audit          # Run security audit
task ci             # Run all CI checks locally
```

## Configuration Files

- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.dockerignore` - Files excluded from Docker builds
