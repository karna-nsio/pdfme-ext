/**
 * Test WGS Template with HTML Generation
 * Run with: node test-wgs-template.js
 */

const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./packages/generator/dist/node/src/index.js');

console.log('═══════════════════════════════════════════');
console.log('  WGS Template HTML Generation Test');
console.log('═══════════════════════════════════════════\n');

// Load the WGS template
const wgsTemplate = JSON.parse(fs.readFileSync('./wgs-manual-template.json', 'utf-8'));

// Test data for WGS report
const testData = {
  reportTitle: 'Whole Genome Sequencing Report',
  reportSubtitle: 'Rapid Trio Analysis',
  patientName: 'John Doe',
  patientId: 'WGS-1800',
  dateOfBirth: '01/15/1985',
  testType: 'Whole Genome Sequencing: Rapid Trio',
  testDate: '10/13/2025',
  resultStatus: 'POSITIVE',
  phenotypeDescription: 'The analysis reveals a pathogenic variant in the BRCA1 gene (c.68_69delAG) that is associated with increased risk of hereditary breast and ovarian cancer. This variant has been classified as pathogenic based on multiple lines of evidence including functional studies, population frequency data, and clinical correlation.\n\nRecommendations:\n1. Genetic counseling is strongly recommended\n2. Consider increased surveillance protocols\n3. Family members should be offered genetic testing\n4. Regular follow-up with oncology team',
  accessionNumber: '9755658',
  reportDate: '10/13/2025'
};

async function runTest() {
  console.log('📋 Testing WGS Template');
  console.log('──────────────────────────────────────────\n');
  
  try {
    const html = await generateHTML({
      template: wgsTemplate,
      inputs: [testData],
      plugins: {},
      options: {
        title: 'WGS Report - John Doe',
        includeStyles: true,
        printFriendly: true
      }
    });
    
    console.log('✅ HTML generated successfully');
    console.log(`  Length: ${html.length} characters`);
    
    // Check if key elements are present
    const checks = [
      { name: 'Report title', test: html.includes('Whole Genome Sequencing Report') },
      { name: 'Patient name', test: html.includes('John Doe') },
      { name: 'Patient ID', test: html.includes('WGS-1800') },
      { name: 'Test type', test: html.includes('Whole Genome Sequencing: Rapid Trio') },
      { name: 'Result status', test: html.includes('POSITIVE') },
      { name: 'Phenotype description', test: html.includes('pathogenic variant') },
      { name: 'Accession number', test: html.includes('9755658') },
      { name: 'Text wrapping', test: html.includes('word-wrap: break-word') }
    ];
    
    console.log('\n📊 Content Checks:');
    checks.forEach(check => {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    // Save to file
    const outputPath = path.join(__dirname, 'wgs-test-output.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n📁 Saved: wgs-test-output.html`);
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Test Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Open wgs-test-output.html in your browser');
    console.log('   You should see:');
    console.log('   - Complete WGS report layout');
    console.log('   - Patient information (John Doe, WGS-1800)');
    console.log('   - Test information (WGS Rapid Trio)');
    console.log('   - Results (POSITIVE status)');
    console.log('   - Detailed phenotype description');
    console.log('   - Proper text wrapping');
    console.log('   - Professional medical report format');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
