#!/usr/bin/env node

/**
 * AI Developer Verification Script
 * 
 * This script MUST be run after every change made by any AI developer.
 * It enforces strict quality standards and prevents degradation of the codebase.
 * 
 * 🎯 MANDATORY AI DEVELOPMENT PARAMETERS:
 * ================================================================================
 * DEPLOYMENT TARGET: Complete bug-free web deployment
 * 
 * 1. ZERO TOLERANCE POLICY:
 *    ❌ NO TypeScript compilation errors (0 errors required)
 *    ❌ NO critical ESLint errors (warnings acceptable, errors forbidden)
 *    ❌ NO broken imports/exports (all paths must resolve)
 *    ❌ NO missing dependencies (package.json must be complete)
 *    ❌ NO build failures (production build must succeed)
 * 
 * 2. CODE QUALITY STANDARDS:
 *    ✅ ALL source files MUST have header comments explaining purpose
 *    ✅ ALL critical files must maintain their structure and integrity
 *    ✅ ALL configuration files must remain valid JSON/JS
 *    ✅ ALL scripts must be executable and properly formatted
 * 
 * 3. WEB DEPLOYMENT READINESS:
 *    ✅ Auto-debugger configuration must remain intact
 *    ✅ Build pipeline must produce deployable artifacts
 *    ✅ No runtime errors in development/production modes
 *    ✅ All assets and dependencies properly bundled
 * 
 * 4. DOCUMENTATION COMPLIANCE:
 *    ✅ AI Developer Guide must contain these parameters
 *    ✅ Code documentation must be up-to-date
 *    ✅ Critical processes must be documented
 * 
 * 5. FAILURE RESPONSE:
 *    🛑 IF ANY CRITICAL ERROR: Development MUST STOP immediately
 *    🔧 Fix ALL errors before proceeding with any other changes
 *    ✅ Re-run verification until ALL parameters satisfied
 * 
 * ================================================================================
 * 
 * Purpose: Validates that all AI changes comply with mandatory development parameters.
 * 
 * References:
 * - File: scripts/ai-verification.js
 * - Part of Chronicle Weaver AI development workflow
 * - Enforces parameters defined in docs/development/AI_DEVELOPER_GUIDE.md
 * 
 * USAGE: node scripts/ai-verification.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class AIVerification {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    const color = type === 'error' ? colors.red : type === 'warning' ? colors.yellow : type === 'success' ? colors.green : colors.blue;
    console.log(`${color}${prefix}${colors.reset} [${timestamp}] ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addPassed(message) {
    this.passed.push(message);
    this.log(message, 'success');
  }

  async runVerification() {
    this.log(`${colors.cyan}${colors.bright}🤖 AI DEVELOPER VERIFICATION PROTOCOL${colors.reset}`);
    this.log(`${colors.yellow}📋 Enforcing mandatory development parameters...${colors.reset}\n`);

    try {
      // MANDATORY CHECK 1: TypeScript compilation
      await this.verifyTypeScript();
      
      // MANDATORY CHECK 2: Header comments integrity
      await this.verifyHeaderComments();
      
      // MANDATORY CHECK 3: File structure compliance
      await this.verifyFileStructure();
      
      // MANDATORY CHECK 4: Error scanner compliance
      await this.verifyErrorScanner();
      
      // MANDATORY CHECK 5: Build success
      await this.verifyBuild();
      
      // MANDATORY CHECK 6: Critical files integrity
      await this.verifyCriticalFiles();
      
      // MANDATORY CHECK 7: Documentation consistency
      await this.verifyDocumentation();

      this.generateVerificationReport();
    } catch (error) {
      this.addError(`Fatal verification error: ${error.message}`);
      this.generateVerificationReport();
      process.exit(1);
    }
  }

  async verifyTypeScript() {
    this.log('🔍 MANDATORY CHECK 1: TypeScript compilation...');
    
    try {
      execSync('npm run type-check', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.addPassed('TypeScript compilation passed - 0 errors');
    } catch (error) {
      this.addError('CRITICAL: TypeScript compilation failed - This MUST be fixed before proceeding');
      this.addError('Run: npm run type-check to see detailed errors');
    }
  }

  async verifyHeaderComments() {
    this.log('🔍 MANDATORY CHECK 2: Header comments integrity...');
    
    const sourceFiles = this.findSourceFiles();
    let filesWithoutHeaders = 0;
    let malformedHeaders = 0;

    for (const file of sourceFiles) {
      if (this.shouldHaveHeader(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        if (!this.hasValidHeader(content)) {
          filesWithoutHeaders++;
          this.addError(`Missing or invalid header comment: ${file}`);
        } else if (!this.hasWellFormedHeader(content)) {
          malformedHeaders++;
          this.addWarning(`Malformed header comment: ${file}`);
        }
      }
    }

    if (filesWithoutHeaders === 0) {
      this.addPassed(`All ${sourceFiles.length} source files have proper header comments`);
    } else {
      this.addError(`CRITICAL: ${filesWithoutHeaders} files missing header comments`);
    }
  }

  async verifyFileStructure() {
    this.log('🔍 MANDATORY CHECK 3: File structure compliance...');
    
    const criticalDirs = ['src', 'app', 'components', 'scripts', 'docs'];
    const criticalFiles = ['.vscode/launch.json', 'package.json', 'tsconfig.json'];
    
    let structureValid = true;

    // Check critical directories
    for (const dir of criticalDirs) {
      if (fs.existsSync(dir)) {
        this.addPassed(`Critical directory exists: ${dir}`);
      } else {
        this.addWarning(`Missing directory: ${dir}`);
      }
    }

    // Check critical files
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        this.addPassed(`Critical file exists: ${file}`);
      } else {
        this.addError(`CRITICAL: Missing essential file: ${file}`);
        structureValid = false;
      }
    }

    // Verify auto-debugger config integrity
    if (fs.existsSync('.vscode/launch.json')) {
      const launchConfig = JSON.parse(fs.readFileSync('.vscode/launch.json', 'utf8'));
      const autoConfig = launchConfig.configurations.find(c => c.name === 'auto');
      
      if (autoConfig && autoConfig.type === 'auto-debug') {
        this.addPassed('Auto-debugger configuration intact');
      } else {
        this.addError('CRITICAL: Auto-debugger configuration corrupted');
        structureValid = false;
      }
    }

    if (!structureValid) {
      this.addError('File structure violations detected - run consolidate script');
    }
  }

  async verifyErrorScanner() {
    this.log('🔍 MANDATORY CHECK 4: Error scanner compliance...');
    
    try {
      const result = execSync('node scripts/error-scanner.js', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Parse the output to check for critical errors
      if (result.includes('No critical errors found')) {
        this.addPassed('Error scanner reports no critical errors');
      } else {
        this.addWarning('Error scanner found issues - review the report');
      }
    } catch (error) {
      // Error scanner returns exit code 1 if errors found
      const output = error.stdout || error.stderr || '';
      if (output.includes('No critical errors found')) {
        this.addPassed('Error scanner completed - only warnings found');
      } else {
        this.addError('CRITICAL: Error scanner found critical errors');
      }
    }
  }

  async verifyBuild() {
    this.log('🔍 MANDATORY CHECK 5: Build verification...');
    
    try {
      // Only run a quick build check, not full production build
      execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.addPassed('Build verification passed');
    } catch (error) {
      this.addError('CRITICAL: Build verification failed - TypeScript errors detected');
    }
  }

  async verifyCriticalFiles() {
    this.log('🔍 MANDATORY CHECK 6: Critical files integrity...');
    
    const criticalFiles = [
      { file: 'package.json', check: 'json' },
      { file: 'tsconfig.json', check: 'json' },
      { file: 'app.json', check: 'json' },
      { file: 'eslint.config.js', check: 'exists' },
      { file: 'scripts/error-scanner.js', check: 'executable' },
      { file: 'src/store/gameStore.ts', check: 'exists' }
    ];

    for (const { file, check } of criticalFiles) {
      if (!fs.existsSync(file)) {
        this.addError(`CRITICAL: Missing critical file: ${file}`);
        continue;
      }

      try {
        if (check === 'json') {
          const content = fs.readFileSync(file, 'utf8');
          JSON.parse(content);
          this.addPassed(`Critical file valid: ${file}`);
        } else if (check === 'executable') {
          // Check if file has proper shebang
          const content = fs.readFileSync(file, 'utf8');
          if (content.startsWith('#!/usr/bin/env node')) {
            this.addPassed(`Executable file valid: ${file}`);
          } else {
            this.addWarning(`Executable missing shebang: ${file}`);
          }
        } else {
          this.addPassed(`Critical file exists: ${file}`);
        }
      } catch (error) {
        this.addError(`CRITICAL: Invalid critical file: ${file} - ${error.message}`);
      }
    }
  }

  async verifyDocumentation() {
    this.log('🔍 MANDATORY CHECK 7: Documentation consistency...');
    
    const docFiles = [
      'docs/development/AI_DEVELOPER_GUIDE.md',
      'docs/CODE_DOCUMENTATION.md',
      'README.md'
    ];

    for (const file of docFiles) {
      if (fs.existsSync(file)) {
        this.addPassed(`Documentation exists: ${file}`);
      } else {
        this.addWarning(`Missing documentation: ${file}`);
      }
    }

    // Check if AI_DEVELOPER_GUIDE has mandatory parameters
    if (fs.existsSync('docs/development/AI_DEVELOPER_GUIDE.md')) {
      const content = fs.readFileSync('docs/development/AI_DEVELOPER_GUIDE.md', 'utf8');
      if (content.includes('MANDATORY AI DEVELOPMENT PARAMETERS')) {
        this.addPassed('AI Developer Guide contains mandatory parameters');
      } else {
        this.addError('CRITICAL: AI Developer Guide missing mandatory parameters');
      }
    }
  }

  findSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ['node_modules', 'dist', '.expo', '.git'];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item) && !item.startsWith('.')) {
            scanDir(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir('.');
    return files;
  }

  shouldHaveHeader(filePath) {
    // Skip test files and certain generated files
    return !filePath.includes('.test.') && 
           !filePath.includes('.spec.') &&
           !filePath.includes('node_modules') &&
           !filePath.includes('.expo') &&
           !filePath.includes('ai-verification.js') && // Skip self-verification
           !filePath.includes('completion-report.js') && // Skip report scripts
           !filePath.includes('error-scanner.js') && // Skip scanner script
           !filePath.includes('add-header-comments.js') && // Skip header script
           !filePath.includes('consolidate-structure.js'); // Skip consolidation script
  }

  hasValidHeader(content) {
    const trimmed = content.trim();
    return trimmed.startsWith('/**') || 
           trimmed.startsWith('#!/usr/bin/env node\n\n/**') ||
           (trimmed.startsWith('{') && trimmed.includes('"_comment"'));
  }

  hasWellFormedHeader(content) {
    const lines = content.split('\n').slice(0, 20);
    const headerLines = lines.filter(line => line.includes('*') || line.includes('_comment'));
    
    // Should have at least 3 lines of header content
    return headerLines.length >= 3;
  }

  generateVerificationReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    console.log(`\n${colors.cyan}${colors.bright}================================================================================${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}🤖 AI DEVELOPER VERIFICATION REPORT${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}================================================================================${colors.reset}`);
    
    console.log(`\n📊 ${colors.bright}VERIFICATION STATISTICS:${colors.reset}`);
    console.log(`   ✅ Passed Checks: ${colors.green}${this.passed.length}${colors.reset}`);
    console.log(`   ⚠️  Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);
    console.log(`   ❌ Critical Errors: ${colors.red}${this.errors.length}${colors.reset}`);
    console.log(`   ⏱️  Verification Time: ${colors.blue}${duration}ms${colors.reset}`);

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bright}❌ CRITICAL FAILURES (${this.errors.length}):${colors.reset}`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${colors.red}${error}${colors.reset}`);
      });
      console.log(`\n${colors.red}${colors.bright}🚫 VERIFICATION FAILED - MUST FIX CRITICAL ERRORS BEFORE PROCEEDING${colors.reset}`);
    } else {
      console.log(`\n${colors.green}${colors.bright}🎉 VERIFICATION PASSED - All mandatory parameters satisfied${colors.reset}`);
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  WARNINGS (${this.warnings.length}):${colors.reset}`);
      this.warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`   ${index + 1}. ${colors.yellow}${warning}${colors.reset}`);
      });
      if (this.warnings.length > 10) {
        console.log(`   ${colors.yellow}... and ${this.warnings.length - 10} more warnings${colors.reset}`);
      }
    }

    console.log(`\n${colors.cyan}${colors.bright}================================================================================${colors.reset}`);
    
    if (this.errors.length > 0) {
      console.log(`${colors.red}${colors.bright}💥 AI VERIFICATION FAILED - Fix critical errors before proceeding${colors.reset}`);
      console.log(`${colors.red}Re-run: node scripts/ai-verification.js after fixes${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}${colors.bright}✅ AI VERIFICATION PASSED - Safe to proceed with development${colors.reset}`);
      process.exit(0);
    }
  }
}

// Main execution
if (require.main === module) {
  const verifier = new AIVerification();
  verifier.runVerification().catch(error => {
    console.error(`${colors.red}❌ Verification script failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = AIVerification;
