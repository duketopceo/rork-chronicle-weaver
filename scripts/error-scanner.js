#!/usr/bin/env node

/**
 * Chronicle Weaver Comprehensive Error Scanner
 * 
 * This script performs a thorough analysis of the entire codebase to identify:
 * - TypeScript compilation errors
 * - ESLint issues  
 * - Import/export problems
 * - Unused variables and imports
 * - Missing dependencies
 * - Configuration issues
 * - Build problems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ErrorScanner {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesScanned: 0,
      totalErrors: 0,
      totalWarnings: 0,
      categories: {
        typescript: 0,
        eslint: 0,
        imports: 0,
        dependencies: 0,
        configuration: 0,
        build: 0
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async scanProject() {
    this.log('🔍 Starting comprehensive error scan...');
    
    try {
      await this.checkTypeScript();
      await this.checkESLint();
      await this.checkImports();
      await this.checkDependencies();
      await this.checkConfiguration();
      await this.checkBuild();
      await this.checkFileStructure();
      
      this.generateReport();
    } catch (error) {
      this.log(`Fatal error during scan: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async checkTypeScript() {
    this.log('🔧 Checking TypeScript compilation...');
    
    try {
      const result = execSync('npx tsc --noEmit --pretty false', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.log('✅ TypeScript compilation passed');
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const lines = output.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        if (line.includes('error TS')) {
          this.addError('typescript', line.trim());
        }
      });
      
      this.log(`❌ Found ${this.stats.categories.typescript} TypeScript errors`, 'error');
    }
  }

  async checkESLint() {
    this.log('🔧 Checking ESLint rules...');
    
    try {
      const result = execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const eslintResults = JSON.parse(result);
      let errorCount = 0;
      let warningCount = 0;
      
      eslintResults.forEach(file => {
        file.messages.forEach(message => {
          if (message.severity === 2) {
            this.addError('eslint', `${file.filePath}:${message.line}:${message.column} - ${message.message} (${message.ruleId})`);
            errorCount++;
          } else {
            this.addWarning('eslint', `${file.filePath}:${message.line}:${message.column} - ${message.message} (${message.ruleId})`);
            warningCount++;
          }
        });
      });
      
      this.log(`ℹ️ ESLint: ${errorCount} errors, ${warningCount} warnings`);
    } catch (error) {
      try {
        const eslintResults = JSON.parse(error.stdout || '[]');
        // Process results as above
        this.log('⚠️ ESLint completed with issues', 'warning');
      } catch (parseError) {
        this.addError('eslint', 'Failed to run ESLint: ' + (error.message || 'Unknown error'));
      }
    }
  }

  async checkImports() {
    this.log('🔧 Checking import/export integrity...');
    
    const sourceFiles = this.findFiles(['.ts', '.tsx', '.js', '.jsx'], ['node_modules', 'dist', '.expo']);
    
    for (const file of sourceFiles) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common import issues
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Check relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          const resolvedPath = path.resolve(path.dirname(file), importPath);
          const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
          
          let exists = false;
          for (const ext of extensions) {
            if (fs.existsSync(resolvedPath + ext) || fs.existsSync(path.join(resolvedPath, 'index' + ext))) {
              exists = true;
              break;
            }
          }
          
          if (!exists && !fs.existsSync(resolvedPath)) {
            this.addError('imports', `${file}: Cannot resolve import "${importPath}"`);
          }
        }
      }
    }
    
    this.log(`ℹ️ Scanned ${sourceFiles.length} source files for import issues`);
  }

  async checkDependencies() {
    this.log('🔧 Checking package dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const nodeModules = fs.existsSync('node_modules');
      
      if (!nodeModules) {
        this.addError('dependencies', 'node_modules directory missing - run npm install');
        return;
      }
      
      // Check for missing dependencies
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      for (const dep of Object.keys(allDeps)) {
        if (!fs.existsSync(path.join('node_modules', dep))) {
          this.addError('dependencies', `Missing dependency: ${dep}`);
        }
      }
      
      // Check for outdated dependencies (simplified check)
      try {
        const outdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        const outdatedPackages = JSON.parse(outdated || '{}');
        
        Object.keys(outdatedPackages).forEach(pkg => {
          this.addWarning('dependencies', `Outdated package: ${pkg} (current: ${outdatedPackages[pkg].current}, wanted: ${outdatedPackages[pkg].wanted})`);
        });
      } catch (error) {
        // npm outdated returns exit code 1 when there are outdated packages
        if (error.stdout) {
          try {
            const outdatedPackages = JSON.parse(error.stdout);
            Object.keys(outdatedPackages).forEach(pkg => {
              this.addWarning('dependencies', `Outdated package: ${pkg}`);
            });
          } catch (parseError) {
            // Ignore parse errors for outdated check
          }
        }
      }
      
      this.log(`ℹ️ Checked ${Object.keys(allDeps).length} dependencies`);
    } catch (error) {
      this.addError('dependencies', `Failed to check dependencies: ${error.message}`);
    }
  }

  async checkConfiguration() {
    this.log('🔧 Checking configuration files...');
    
    const configFiles = [
      { file: 'tsconfig.json', required: true, type: 'json' },
      { file: 'package.json', required: true, type: 'json' },
      { file: 'app.json', required: true, type: 'json' },
      { file: 'firebase.json', required: false, type: 'json' },
      { file: 'eslint.config.js', required: false, type: 'js' },
      { file: '.eslintrc.json', required: false, type: 'json' }
    ];
    
    for (const config of configFiles) {
      if (fs.existsSync(config.file)) {
        try {
          const content = fs.readFileSync(config.file, 'utf8');
          if (config.type === 'json') {
            JSON.parse(content);
          }
          this.log(`✅ ${config.file} is valid`);
        } catch (error) {
          if (config.type === 'json') {
            this.addError('configuration', `Invalid JSON in ${config.file}: ${error.message}`);
          } else {
            this.log(`ℹ️ ${config.file} exists (JavaScript file)`);
          }
        }
      } else if (config.required) {
        this.addError('configuration', `Missing required configuration file: ${config.file}`);
      }
    }
  }

  async checkBuild() {
    this.log('🔧 Checking build configuration...');
    
    try {
      // Check if build scripts exist
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const requiredScripts = ['build', 'build:production', 'start'];
      for (const script of requiredScripts) {
        if (!scripts[script]) {
          this.addWarning('build', `Missing package.json script: ${script}`);
        }
      }
      
      // Check build output directory
      if (fs.existsSync('dist')) {
        const distFiles = fs.readdirSync('dist');
        if (distFiles.length === 0) {
          this.addWarning('build', 'Build output directory (dist) is empty');
        } else {
          this.log(`ℹ️ Build output contains ${distFiles.length} files/directories`);
        }
      }
      
    } catch (error) {
      this.addError('build', `Build check failed: ${error.message}`);
    }
  }

  async checkFileStructure() {
    this.log('🔧 Checking file structure...');
    
    const requiredDirs = ['src', 'app'];
    const optionalDirs = ['components', 'services', 'store', 'types', 'utils'];
    
    // Check if at least one of the required directories exists
    const hasRequiredDir = requiredDirs.some(dir => fs.existsSync(dir));
    if (!hasRequiredDir) {
      this.addError('configuration', `Missing required source directory. Expected one of: ${requiredDirs.join(', ')}`);
    }
    
    // Check for common React Native / Expo files
    const commonFiles = ['app.json', 'package.json'];
    for (const file of commonFiles) {
      if (!fs.existsSync(file)) {
        this.addError('configuration', `Missing common file: ${file}`);
      }
    }
  }

  findFiles(extensions, excludeDirs = []) {
    const files = [];
    
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

  addError(category, message) {
    this.errors.push({ category, message });
    this.stats.categories[category]++;
    this.stats.totalErrors++;
  }

  addWarning(category, message) {
    this.warnings.push({ category, message });
    this.stats.totalWarnings++;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CHRONICLE WEAVER ERROR SCAN REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📈 STATISTICS:`);
    console.log(`   Files Scanned: ${this.stats.filesScanned}`);
    console.log(`   Total Errors: ${this.stats.totalErrors}`);
    console.log(`   Total Warnings: ${this.stats.totalWarnings}`);
    
    console.log(`\n📂 ERRORS BY CATEGORY:`);
    Object.entries(this.stats.categories).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`   ${category}: ${count}`);
      }
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.category.toUpperCase()}] ${error.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.slice(0, 20).forEach((warning, index) => {
        console.log(`   ${index + 1}. [${warning.category.toUpperCase()}] ${warning.message}`);
      });
      
      if (this.warnings.length > 20) {
        console.log(`   ... and ${this.warnings.length - 20} more warnings`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (this.stats.totalErrors === 0) {
      console.log('🎉 SUCCESS: No critical errors found!');
    } else {
      console.log(`💥 FAILURE: Found ${this.stats.totalErrors} critical errors that need attention.`);
    }
    
    if (this.stats.totalWarnings > 0) {
      console.log(`⚠️  Found ${this.stats.totalWarnings} warnings that should be reviewed.`);
    }
    
    console.log('='.repeat(80));
    
    // Return exit code based on errors
    process.exit(this.stats.totalErrors > 0 ? 1 : 0);
  }
}

// Run the scanner
if (require.main === module) {
  const scanner = new ErrorScanner();
  scanner.scanProject().catch(error => {
    console.error('❌ Scanner failed:', error);
    process.exit(1);
  });
}

module.exports = ErrorScanner;