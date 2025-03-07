/**
 * Build script for PromptNova
 * 
 * This script handles the build process for the PromptNova application.
 * It's responsible for:
 * - Cleaning the dist directory
 * - Building the renderer process
 * - Building the main process
 * - Preparing resources for packaging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  distDir: path.resolve(__dirname, '../dist'),
  resourcesDir: path.resolve(__dirname, '../build/resources'),
  packageJson: path.resolve(__dirname, '../package.json'),
};

/**
 * Clean the distribution directory
 */
function cleanDist() {
  console.log('Cleaning dist directory...');
  if (fs.existsSync(config.distDir)) {
    fs.rmSync(config.distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.distDir, { recursive: true });
  console.log('Dist directory cleaned.');
}

/**
 * Build the application
 */
function buildApp() {
  console.log('Building application...');
  try {
    // Build renderer and main processes
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Application built successfully.');
  } catch (error) {
    console.error('Error building application:', error);
    process.exit(1);
  }
}

/**
 * Prepare resources for packaging
 */
function prepareResources() {
  console.log('Preparing resources...');
  
  // Ensure resources directory exists
  if (!fs.existsSync(config.resourcesDir)) {
    fs.mkdirSync(config.resourcesDir, { recursive: true });
  }
  
  // Create subdirectories for icons if they don't exist
  const iconDirs = ['win', 'mac', 'linux'].map(platform => 
    path.join(config.resourcesDir, 'icons', platform)
  );
  
  iconDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('Resources prepared.');
}

/**
 * Main build process
 */
function main() {
  console.log('Starting build process...');
  
  // Read package.json to get version
  const packageJson = JSON.parse(fs.readFileSync(config.packageJson, 'utf8'));
  console.log(`Building PromptNova v${packageJson.version}`);
  
  // Execute build steps
  cleanDist();
  prepareResources();
  buildApp();
  
  console.log('Build process completed successfully.');
}

// Run the build process
main();