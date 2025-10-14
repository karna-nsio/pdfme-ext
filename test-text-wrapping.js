/**
 * Test text wrapping behavior
 * Run with: node test-text-wrapping.js
 */

const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./packages/generator/dist/node/src/index.js');

console.log('═══════════════════════════════════════════');
console.log('  Text Wrapping Test');
console.log('═══════════════════════════════════════════\n');

// Test template with long text
const textWrappingTemplate = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  },
  schemas: [[
    // Label
    {
      id: 'label-1',
      name: 'label1',
      type: 'text',
      position: { x: 20, y: 20 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Short width field (should wrap):'
    },
    // Short width field - text should wrap
    {
      id: 'field-1',
      name: 'shortWidthField',
      type: 'text',
      position: { x: 20, y: 30 },
      width: 50,  // Short width
      height: 15,
      fontSize: 12,
      fontColor: '#000000',
      backgroundColor: '#f0f9ff',
      borderColor: '#3b82f6',
      borderWidth: 0.5,
      padding: { top: 2, right: 3, bottom: 2, left: 3 }
    },
    
    // Label
    {
      id: 'label-2',
      name: 'label2',
      type: 'text',
      position: { x: 20, y: 50 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Medium width field (should wrap):'
    },
    // Medium width field
    {
      id: 'field-2',
      name: 'mediumWidthField',
      type: 'text',
      position: { x: 20, y: 60 },
      width: 80,  // Medium width
      height: 15,
      fontSize: 12,
      fontColor: '#000000',
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      borderWidth: 0.5,
      padding: { top: 2, right: 3, bottom: 2, left: 3 }
    },
    
    // Label
    {
      id: 'label-3',
      name: 'label3',
      type: 'text',
      position: { x: 20, y: 80 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Wide field (single line):'
    },
    // Wide field - should fit on one line
    {
      id: 'field-3',
      name: 'wideField',
      type: 'text',
      position: { x: 20, y: 90 },
      width: 170,  // Wide width
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      backgroundColor: '#e0f2fe',
      borderColor: '#0284c7',
      borderWidth: 0.5,
      padding: { top: 2, right: 3, bottom: 2, left: 3 }
    },
    
    // Multi-line text field
    {
      id: 'label-4',
      name: 'label4',
      type: 'text',
      position: { x: 20, y: 105 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Multi-line text field:'
    },
    {
      id: 'field-4',
      name: 'multiLineField',
      type: 'multiVariableText',
      position: { x: 20, y: 115 },
      width: 100,
      height: 30,
      fontSize: 11,
      fontColor: '#000000',
      backgroundColor: '#fef2f2',
      borderColor: '#ef4444',
      borderWidth: 0.5,
      padding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineHeight: 1.5
    }
  ]],
  fieldGroups: [],
  pdfmeVersion: 'x.x.x'
};

// Test data with long text
const testData = {
  label1: 'Short width field (should wrap):',
  label2: 'Medium width field (should wrap):',
  label3: 'Wide field (single line):',
  label4: 'Multi-line text field:',
  
  shortWidthField: 'Whole Genome Sequencing: Rapid Trio',
  mediumWidthField: 'Whole Genome Sequencing: Rapid Trio Analysis Complete',
  wideField: 'Whole Genome Sequencing: Rapid Trio Analysis Complete',
  multiLineField: 'This is a longer text that should wrap properly across multiple lines.\n\nIt includes line breaks and should display correctly in the HTML output just like it does in the PDF.'
};

async function runTest() {
  console.log('📋 Testing Text Wrapping');
  console.log('──────────────────────────────────────────\n');
  
  try {
    const html = await generateHTML({
      template: textWrappingTemplate,
      inputs: [testData],
      plugins: {},
      options: {
        title: 'Text Wrapping Test',
        includeStyles: true,
        printFriendly: true
      }
    });
    
    console.log('✅ HTML generated successfully');
    console.log(`  Length: ${html.length} characters`);
    
    // Check if wrapping properties are in HTML
    const checks = [
      { name: 'word-wrap property', test: html.includes('word-wrap:') },
      { name: 'overflow-wrap property', test: html.includes('overflow-wrap:') },
      { name: 'white-space: normal', test: html.includes('white-space: normal') },
      { name: 'Text fields present', test: html.includes('Whole Genome Sequencing') },
      { name: 'Line breaks preserved', test: html.includes('<br>') }
    ];
    
    console.log('\n📊 Property Checks:');
    checks.forEach(check => {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-text-wrapping-output.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n📁 Saved: test-text-wrapping-output.html`);
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Test Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Open test-text-wrapping-output.html in your browser');
    console.log('   Compare with PDF output:');
    console.log('   - Short width: "Whole Genome Sequencing: Rapid" on line 1');
    console.log('                  "Trio" on line 2 (wrapped)');
    console.log('   - Medium width: Text wraps naturally');
    console.log('   - Wide width: All on one line');
    console.log('   - Multi-line: Preserves line breaks');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();

