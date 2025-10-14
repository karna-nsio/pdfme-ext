/**
 * Test HTML generation with visual properties (background, borders, padding)
 * Run with: node test-html-visual-properties.js
 */

const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./packages/generator/dist/node/src/index.js');

console.log('═══════════════════════════════════════════');
console.log('  HTML Visual Properties Test');
console.log('═══════════════════════════════════════════\n');

// Test template with all visual properties
const visualPropertiesTemplate = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  },
  schemas: [[
    {
      id: 'field-1',
      name: 'textWithBackground',
      type: 'text',
      position: { x: 20, y: 30 },
      width: 80,
      height: 15,
      fontSize: 14,
      fontColor: '#ffffff',
      backgroundColor: '#3b82f6',  // Blue background
      borderColor: '#1e40af',
      borderWidth: 0.5,
      padding: { top: 2, right: 5, bottom: 2, left: 5 },
      alignment: 'center',
      verticalAlignment: 'middle'
    },
    {
      id: 'field-2',
      name: 'textWithBorder',
      type: 'text',
      position: { x: 20, y: 55 },
      width: 80,
      height: 15,
      fontSize: 12,
      fontColor: '#1f2937',
      backgroundColor: '#fef3c7',  // Yellow background
      borderColor: '#f59e0b',
      borderWidth: 1,
      padding: { top: 3, right: 3, bottom: 3, left: 3 },
      alignment: 'left'
    },
    {
      id: 'field-3',
      name: 'multilineWithBackground',
      type: 'multiVariableText',
      position: { x: 20, y: 80 },
      width: 80,
      height: 30,
      fontSize: 11,
      fontColor: '#000000',
      backgroundColor: '#e0f2fe',  // Light blue background
      borderColor: '#0284c7',
      borderWidth: 0.5,
      padding: { top: 5, right: 5, bottom: 5, left: 5 },
      alignment: 'left',
      lineHeight: 1.5
    },
    {
      id: 'field-4',
      name: 'imageWithBackground',
      type: 'image',
      position: { x: 110, y: 30 },
      width: 40,
      height: 40,
      backgroundColor: '#f3f4f6',  // Gray background
      borderColor: '#9ca3af',
      borderWidth: 1,
      padding: { top: 2, right: 2, bottom: 2, left: 2 }
    },
    {
      id: 'field-5',
      name: 'checkbox1',
      type: 'checkbox',
      position: { x: 110, y: 80 },
      width: 10,
      height: 10,
      backgroundColor: '#fef2f2',  // Light red background
      borderColor: '#ef4444',
      borderWidth: 0.3,
      checkColor: '#dc2626'
    },
    {
      id: 'field-6',
      name: 'resultsTable',
      type: 'table',
      position: { x: 20, y: 120 },
      width: 170,
      height: 60,
      showHead: true,
      head: ['Test', 'Result', 'Status'],
      headWidthPercentages: [40, 30, 30],
      content: JSON.stringify([
        ['Blood Test', 'Negative', 'Complete'],
        ['X-Ray', 'Normal', 'Complete'],
        ['MRI', 'Pending', 'Scheduled']
      ]),
      tableStyles: {
        borderWidth: 0.5,
        borderColor: '#6b7280'
      },
      headStyles: {
        backgroundColor: '#1f2937',
        fontColor: '#ffffff',
        fontSize: 12,
        alignment: 'center',
        padding: { top: 5, right: 5, bottom: 5, left: 5 }
      },
      bodyStyles: {
        backgroundColor: '#ffffff',
        fontColor: '#1f2937',
        fontSize: 11,
        alignment: 'left',
        padding: { top: 4, right: 4, bottom: 4, left: 4 },
        alternateBackgroundColor: '#f9fafb'
      }
    }
  ]],
  fieldGroups: [],
  pdfmeVersion: 'x.x.x'
};

// Test data
const testData = {
  textWithBackground: 'Text with Background',
  textWithBorder: 'Text with Border and Yellow Background',
  multilineWithBackground: 'This is multi-line text\nwith light blue background\nand proper padding',
  imageWithBackground: '', // No image, will show gray background
  checkbox1: 'true',
  resultsTable: JSON.stringify([
    ['Blood Test', 'Negative', 'Complete'],
    ['X-Ray', 'Normal', 'Complete'],
    ['MRI', 'Pending', 'Scheduled']
  ])
};

async function runTest() {
  console.log('📋 Testing Visual Properties');
  console.log('──────────────────────────────────────────\n');
  
  try {
    const html = await generateHTML({
      template: visualPropertiesTemplate,
      inputs: [testData],
      plugins: {},
      options: {
        title: 'Visual Properties Test',
        includeStyles: true,
        printFriendly: true
      }
    });
    
    console.log('✅ HTML generated successfully');
    console.log(`  Length: ${html.length} characters`);
    
    // Check if properties are in HTML
    const checks = [
      { name: 'Background colors', test: html.includes('background-color:') },
      { name: 'Border colors', test: html.includes('border:') },
      { name: 'Padding', test: html.includes('padding:') },
      { name: 'Blue background (#3b82f6)', test: html.includes('#3b82f6') },
      { name: 'Yellow background (#fef3c7)', test: html.includes('#fef3c7') },
      { name: 'Light blue background (#e0f2fe)', test: html.includes('#e0f2fe') },
      { name: 'Table head background', test: html.includes('#1f2937') }
    ];
    
    console.log('\n📊 Property Checks:');
    checks.forEach(check => {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-visual-properties.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n📁 Saved: test-visual-properties.html`);
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Test Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Open test-visual-properties.html in your browser');
    console.log('   You should see:');
    console.log('   - Text with blue background and white text');
    console.log('   - Text with yellow background and border');
    console.log('   - Multi-line text with light blue background');
    console.log('   - Gray background where image would be');
    console.log('   - Checkbox with light red background');
    console.log('   - Table with dark header and alternating row colors');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();

