/**
 * consolidate-structure.js
 * 
 * Source file for Chronicle Weaver application.
 * 
 * Purpose: Implements functionality for consolidate-structure.
 * 
 * References:
 * - File: scripts/consolidate-structure.js
 * - Part of Chronicle Weaver application
 */

#!/usr/bin/env node

/**
 * Chronicle Weaver File Structure Consolidation Script
 * 
 * Purpose: Analyzes and consolidates the project file structure for optimal organization
 * - Identifies duplicate files and directories
 * - Removes unnecessary files and empty directories
 * - Reorganizes files into logical groupings
 * - Adds header comments to all files explaining their purpose and dependencies
 * 
 * Referenced by: None (standalone utility script)
 * References: All project files for analysis
 */

const fs = require('fs');
const path = require('path');

class FileStructureConsolidator {
  constructor() {
    this.duplicates = [];
    this.unnecessary = [];
    this.reorganizations = [];
    this.fileReferences = new Map();
    this.consolidationPlan = {
      moves: [],
      deletions: [],
      merges: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing file structure...');
    
    // 1. Find duplicates
    await this.findDuplicates();
    
    // 2. Identify unnecessary files
    await this.identifyUnnecessaryFiles();
    
    // 3. Map file references
    await this.mapFileReferences();
    
    // 4. Generate consolidation plan
    await this.generateConsolidationPlan();
    
    // 5. Execute safe consolidations
    await this.executeConsolidation();
  }

  async findDuplicates() {
    console.log('📂 Finding duplicate files...');
    
    const duplicatePatterns = [
      // Config files in multiple locations
      { pattern: '**/tsconfig.json', keep: './tsconfig.json' },
      { pattern: '**/jest.config.js', keep: './config/jest.config.js' },
      { pattern: '**/metro.config.js', keep: './metro.config.js' },
      { pattern: '**/webpack.config.js', keep: './webpack.config.js' },
      
      // Type definitions
      { pattern: '**/global.d.ts', keep: './src/types/global.d.ts' },
      { pattern: '**/game.ts', keep: './src/types/game.ts' },
      
      // Component duplicates
      { pattern: '**/DebugPanel.tsx', keep: './src/components/DebugPanel.tsx' }
    ];

    for (const dup of duplicatePatterns) {
      const files = this.globSearch(dup.pattern);
      if (files.length > 1) {
        this.duplicates.push({
          pattern: dup.pattern,
          files: files,
          keep: dup.keep,
          remove: files.filter(f => f !== dup.keep)
        });
      }
    }
  }

  async identifyUnnecessaryFiles() {
    console.log('🗑️ Identifying unnecessary files...');
    
    const unnecessaryPatterns = [
      // Build artifacts that shouldn't be in source
      'dist/**/*',
      '.expo/**/*',
      'node_modules/**/*',
      
      // Temporary files
      '*.tmp',
      '*.temp',
      '.DS_Store',
      'Thumbs.db',
      
      // Duplicate configs in wrong locations
      'config/tsconfig.json', // Should be in root
      'config/package.json',  // Should be in root
      'config/app.json',     // Should be in root
      
      // Empty or template files
      'rork-chronicle-weaver/**/*' // This appears to be an empty duplicate folder
    ];

    for (const pattern of unnecessaryPatterns) {
      const files = this.globSearch(pattern);
      this.unnecessary.push(...files);
    }
  }

  async mapFileReferences() {
    console.log('🔗 Mapping file references...');
    
    const sourceFiles = this.globSearch('**/*.{ts,tsx,js,jsx}', ['node_modules', 'dist', '.expo']);
    
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const references = this.extractReferences(content);
      this.fileReferences.set(file, references);
    }
  }

  extractReferences(content) {
    const references = {
      imports: [],
      exports: [],
      requires: [],
      comments: []
    };

    // Extract import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      references.imports.push(match[1]);
    }

    // Extract require statements
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      references.requires.push(match[1]);
    }

    // Extract export statements
    const exportRegex = /export\s+.*?from\s+['"]([^'"]+)['"]/g;
    while ((match = exportRegex.exec(content)) !== null) {
      references.exports.push(match[1]);
    }

    return references;
  }

  async generateConsolidationPlan() {
    console.log('📋 Generating consolidation plan...');
    
    // Plan 1: Remove duplicates (keep the canonical location)
    for (const dup of this.duplicates) {
      for (const file of dup.remove) {
        if (fs.existsSync(file)) {
          this.consolidationPlan.deletions.push({
            file: file,
            reason: `Duplicate of ${dup.keep}`,
            safe: true
          });
        }
      }
    }

    // Plan 2: Move misplaced config files
    const configMoves = [
      { from: 'config/jest.config.js', to: 'jest.config.js' },
      { from: 'config/metro.config.js', to: 'metro.config.js' },
      { from: 'config/webpack.config.js', to: 'webpack.config.js' }
    ];

    for (const move of configMoves) {
      if (fs.existsSync(move.from) && !fs.existsSync(move.to)) {
        this.consolidationPlan.moves.push({
          from: move.from,
          to: move.to,
          reason: 'Config files should be in root',
          safe: true
        });
      }
    }

    // Plan 3: Remove unnecessary files
    for (const file of this.unnecessary) {
      if (fs.existsSync(file)) {
        this.consolidationPlan.deletions.push({
          file: file,
          reason: 'Unnecessary file',
          safe: this.isSafeToDelete(file)
        });
      }
    }
  }

  isSafeToDelete(file) {
    // Don't delete if file is referenced by others
    for (const [sourceFile, refs] of this.fileReferences) {
      const relativePath = path.relative(path.dirname(sourceFile), file);
      if (refs.imports.includes(relativePath) || 
          refs.requires.includes(relativePath)) {
        return false;
      }
    }
    return true;
  }

  async executeConsolidation() {
    console.log('🔧 Executing safe consolidations...');
    
    let moved = 0;
    let deleted = 0;

    // Execute safe moves
    for (const move of this.consolidationPlan.moves) {
      if (move.safe) {
        try {
          fs.renameSync(move.from, move.to);
          console.log(`✅ Moved ${move.from} → ${move.to}`);
          moved++;
        } catch (error) {
          console.log(`❌ Failed to move ${move.from}: ${error.message}`);
        }
      }
    }

    // Execute safe deletions
    for (const deletion of this.consolidationPlan.deletions) {
      if (deletion.safe) {
        try {
          if (fs.statSync(deletion.file).isDirectory()) {
            fs.rmSync(deletion.file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(deletion.file);
          }
          console.log(`🗑️ Deleted ${deletion.file} (${deletion.reason})`);
          deleted++;
        } catch (error) {
          console.log(`❌ Failed to delete ${deletion.file}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Consolidation Summary:`);
    console.log(`   Files moved: ${moved}`);
    console.log(`   Files deleted: ${deleted}`);
    console.log(`   Duplicates found: ${this.duplicates.length}`);
    console.log(`   Unnecessary files identified: ${this.unnecessary.length}`);
  }

  async addHeaderComments() {
    console.log('📝 Adding header comments to files...');
    
    const sourceFiles = this.globSearch('**/*.{ts,tsx,js,jsx}', ['node_modules', 'dist', '.expo']);
    
    for (const file of sourceFiles) {
      await this.addFileHeader(file);
    }
  }

  async addFileHeader(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has header comment
    if (content.startsWith('/**') || content.startsWith('/*')) {
      return;
    }

    const relativePath = path.relative('.', filePath);
    const fileName = path.basename(filePath);
    const fileType = this.determineFileType(filePath);
    const references = this.getFileReferences(filePath);
    
    const header = this.generateFileHeader(fileName, fileType, relativePath, references);
    const newContent = header + '\n\n' + content;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added header to ${relativePath}`);
  }

  generateFileHeader(fileName, fileType, relativePath, references) {
    return `/**
 * ${fileName} - ${fileType}
 * 
 * Purpose: ${this.generatePurposeDescription(fileName, fileType)}
 * Location: ${relativePath}
 * 
 * Referenced by: ${references.referencedBy.length > 0 ? references.referencedBy.join(', ') : 'None'}
 * References: ${references.references.length > 0 ? references.references.join(', ') : 'None'}
 * 
 * Last updated: ${new Date().toISOString().split('T')[0]}
 */`;
  }

  generatePurposeDescription(fileName, fileType) {
    const purposeMap = {
      'package.json': 'Project dependencies and scripts configuration',
      'tsconfig.json': 'TypeScript compiler configuration',
      'jest.config.js': 'Jest testing framework configuration',
      'eslint.config.js': 'ESLint code quality rules configuration',
      'metro.config.js': 'Metro bundler configuration for React Native',
      'webpack.config.js': 'Webpack build configuration',
      'app.json': 'Expo application configuration',
      'firebase.json': 'Firebase services configuration',
      '_layout.tsx': 'Root layout component for Expo Router',
      'index.tsx': 'Main entry point component',
      'gameStore.ts': 'Zustand game state management store',
      'aiService.ts': 'AI/LLM integration service for narrative generation',
      'firebaseUtils.ts': 'Firebase utility functions and helpers'
    };

    return purposeMap[fileName] || `${fileType} component/module for Chronicle Weaver`;
  }

  determineFileType(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'Test file';
    if (fileName.includes('.config.')) return 'Configuration file';
    if (fileName.includes('.d.ts')) return 'TypeScript type definitions';
    if (filePath.includes('/components/')) return 'React component';
    if (filePath.includes('/services/')) return 'Service module';
    if (filePath.includes('/store/')) return 'State management store';
    if (filePath.includes('/utils/')) return 'Utility functions';
    if (filePath.includes('/types/')) return 'Type definitions';
    if (filePath.includes('/app/')) return 'Expo Router page component';
    if (filePath.includes('/scripts/')) return 'Build/utility script';
    
    switch (ext) {
      case '.tsx': return 'React TypeScript component';
      case '.ts': return 'TypeScript module';
      case '.jsx': return 'React JavaScript component';
      case '.js': return 'JavaScript module';
      default: return 'Source file';
    }
  }

  getFileReferences(filePath) {
    const references = this.fileReferences.get(filePath) || { imports: [], exports: [], requires: [] };
    const referencedBy = [];
    
    // Find files that reference this file
    for (const [sourceFile, refs] of this.fileReferences) {
      const relativePath = path.relative(path.dirname(sourceFile), filePath);
      const withoutExt = relativePath.replace(/\.[^/.]+$/, "");
      
      if (refs.imports.some(imp => imp.includes(withoutExt)) ||
          refs.requires.some(req => req.includes(withoutExt))) {
        referencedBy.push(path.relative('.', sourceFile));
      }
    }

    return {
      references: [...references.imports, ...references.requires, ...references.exports],
      referencedBy: referencedBy
    };
  }

  globSearch(pattern, excludes = []) {
    // Simple glob implementation for this script
    const files = [];
    
    const searchDir = (dir) => {
      if (excludes.some(exclude => dir.includes(exclude))) return;
      
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            searchDir(fullPath);
          } else {
            // Simple pattern matching
            if (this.matchesPattern(fullPath, pattern)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir('.');
    return files;
  }

  matchesPattern(filePath, pattern) {
    // Simple glob pattern matching
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    
    return new RegExp(regex).test(filePath);
  }
}

// Main execution
if (require.main === module) {
  const consolidator = new FileStructureConsolidator();
  
  console.log('🚀 Starting Chronicle Weaver file structure consolidation...');
  
  consolidator.analyze()
    .then(() => consolidator.addHeaderComments())
    .then(() => {
      console.log('✅ File structure consolidation complete!');
    })
    .catch(error => {
      console.error('❌ Consolidation failed:', error);
      process.exit(1);
    });
}

module.exports = FileStructureConsolidator;
