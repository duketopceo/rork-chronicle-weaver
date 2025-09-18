const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const BACKUP_DIR = path.join(ROOT_DIR, 'docs_archive');
const WORK_HISTORY_FILE = path.join(DOCS_DIR, 'WORK_HISTORY_DIARY.md');
const PROJECT_CONTEXT_FILE = path.join(DOCS_DIR, 'PROJECT_CONTEXT.md');
const AI_DEVELOPER_GUIDE = path.join(DOCS_DIR, 'development', 'AI_DEVELOPER_GUIDE.md');
const CONSOLIDATED_DOCS = path.join(DOCS_DIR, 'CONSOLIDATED_DEVELOPER_GUIDE.md');

// Create backup of existing docs
function backupExistingDocs() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `docs_backup_${timestamp}`);
  fs.mkdirSync(backupPath);
  
  // Copy all docs to backup
  const files = fs.readdirSync(DOCS_DIR);
  files.forEach(file => {
    const src = path.join(DOCS_DIR, file);
    const dest = path.join(backupPath, file);
    if (fs.lstatSync(src).isDirectory()) {
      execSync(`xcopy "${src}" "${path.join(dest, path.basename(src))}\" /E /I /Y`);
    } else {
      fs.copyFileSync(src, dest);
    }
  });
  
  console.log(`Backup created at: ${backupPath}`);
}

// Read and parse markdown file
function readMarkdownFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

// Consolidate documentation
function consolidateDocumentation() {
  console.log('Consolidating documentation...');
  
  // Read all source files
  const workHistory = readMarkdownFile(WORK_HISTORY_FILE);
  const projectContext = readMarkdownFile(PROJECT_CONTEXT_FILE);
  const aiGuide = readMarkdownFile(AI_DEVELOPER_GUIDE);
  
  // Create consolidated content
  const consolidatedContent = `# Chronicle Weaver - Consolidated Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Development Workflow](#development-workflow)
4. [Error Tracking](#error-tracking)
5. [Work History](#work-history)
6. [AI Developer Guide](#ai-developer-guide)

## Project Overview
${extractSection(projectContext, 'PROJECT OVERVIEW')}

## Technical Architecture
${extractSection(projectContext, 'TECHNICAL ARCHITECTURE')}

## Development Workflow
${extractSection(aiGuide, 'DEVELOPMENT WORKFLOW')}

## Error Tracking
${extractSection(workHistory, 'ERROR TRACKING')}

## Work History
${workHistory}

## AI Developer Guide
${aiGuide}
`;

  // Write consolidated file
  fs.writeFileSync(CONSOLIDATED_DOCS, consolidatedContent);
  console.log(`Consolidated documentation created at: ${CONSOLIDATED_DOCS}`);
}

// Extract section from markdown content
function extractSection(content, sectionTitle) {
  if (!content) return '';
  const regex = new RegExp(`##?\\s*${sectionTitle}[\s\S]*?(?=##?\\s*\w|$)`);
  const match = content.match(regex);
  return match ? match[0] : '';
}

// Main function
async function main() {
  try {
    console.log('Starting documentation organization...');
    
    // 1. Backup existing docs
    backupExistingDocs();
    
    // 2. Consolidate documentation
    consolidateDocumentation();
    
    console.log('Documentation organization complete!');
  } catch (error) {
    console.error('Error organizing documentation:', error);
    process.exit(1);
  }
}

// Run the script
main();
