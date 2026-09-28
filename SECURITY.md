# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Do not** open a public issue for security vulnerabilities
2. Email security reports to the maintainers
3. Include detailed information about the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

- Initial response within 48 hours
- Resolution within 7 days for critical vulnerabilities
- Regular updates if additional time is needed

## x402-Specific Security Considerations

When integrating with the x402 payment protocol:

- Ensure proper validation of payment signatures
- Use the latest version of `@coinbase/x402` SDK
- Verify merchant and facilitator contracts
- Follow Coinbase's security best practices for x402 implementations

## Security Best Practices

- Keep dependencies updated via Dependabot
- Review pull requests for security implications
- Use branch protection rules to prevent direct pushes to main
- Enable secret scanning (already enabled by default)
- Use secure coding practices

Thank you for helping keep this project secure!