# Security Policy

## Supported Versions

We actively support the following versions of the project:

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |
| Older   | :x:                |

Please ensure you are using the latest version for security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do not disclose publicly**: Avoid sharing details of the vulnerability in public forums or repositories.
2. **Contact us directly**: Create a private security advisory in the GitHub repository with the following details:
   - A clear description of the vulnerability.
   - Steps to reproduce the issue.
   - Any potential impact or risk.
3. **Wait for a response**: We aim to respond within 48 hours and will work with you to resolve the issue promptly.

## Security Best Practices

To ensure the security of your deployment:

- Keep dependencies up-to-date.
- Use strong passwords and secure authentication methods.
- Regularly review and audit your codebase.
- Enable HTTPS for all communications.
- **NEVER commit .env files or API keys to version control**
- Use environment variables for all sensitive configuration
- Configure Firebase Security Rules appropriately
- Implement proper input validation and sanitization
- Enable Content Security Policy (CSP) headers
- Disable debug mode in production environments

## Environment Variable Security

**Critical**: All sensitive data must be stored in environment variables:
- Firebase API keys and configuration
- AI service credentials
- Custom domain settings
- Debug and analytics flags

Copy `.env.example` to `.env` and configure your values. The `.env` file is ignored by Git and should never be committed.

Thank you for helping us keep this project secure!
