/**
 * Test Line, Rectangle, and Ellipse rendering
 * Run with: node test-shapes.js
 */

const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./packages/generator/dist/node/src/index.js');

console.log('═══════════════════════════════════════════');
console.log('  Shape Fields Test (Line, Rectangle, Ellipse)');
console.log('═══════════════════════════════════════════\n');

// Test template with all shape types
const shapesTemplate = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  },
  schemas: [[
    // Horizontal Lines
    {
      id: 'line-1',
      name: 'horizontalLine1',
      type: 'line',
      position: { x: 20, y: 30 },
      width: 80,
      height: 1,
      color: '#000000'
    },
    {
      id: 'line-2',
      name: 'horizontalLine2',
      type: 'line',
      position: { x: 20, y: 40 },
      width: 80,
      height: 2,
      color: '#ef4444',  // Red
      opacity: 0.8
    },
    {
      id: 'line-3',
      name: 'horizontalLine3',
      type: 'line',
      position: { x: 20, y: 50 },
      width: 80,
      height: 3,
      color: '#3b82f6',  // Blue
      lineStyle: 'dashed'
    },
    
    // Vertical Lines
    {
      id: 'line-4',
      name: 'verticalLine1',
      type: 'line',
      position: { x: 110, y: 30 },
      width: 1,
      height: 50,
      color: '#000000'
    },
    {
      id: 'line-5',
      name: 'verticalLine2',
      type: 'line',
      position: { x: 120, y: 30 },
      width: 2,
      height: 50,
      color: '#22c55e',  // Green
      opacity: 0.8
    },
    {
      id: 'line-6',
      name: 'verticalLine3',
      type: 'line',
      position: { x: 130, y: 30 },
      width: 3,
      height: 50,
      color: '#f59e0b',  // Orange
      lineStyle: 'dotted'
    },
    
    // Rectangles
    {
      id: 'rect-1',
      name: 'filledRectangle',
      type: 'rectangle',
      position: { x: 20, y: 90 },
      width: 40,
      height: 30,
      color: '#3b82f6',  // Blue
      filled: true,
      opacity: 0.8
    },
    {
      id: 'rect-2',
      name: 'borderedRectangle',
      type: 'rectangle',
      position: { x: 70, y: 90 },
      width: 40,
      height: 30,
      color: 'transparent',
      borderColor: '#ef4444',  // Red
      borderWidth: 2,
      filled: false
    },
    {
      id: 'rect-3',
      name: 'filledBorderedRectangle',
      type: 'rectangle',
      position: { x: 120, y: 90 },
      width: 40,
      height: 30,
      color: '#fef3c7',  // Yellow fill
      borderColor: '#f59e0b',  // Orange border
      borderWidth: 2,
      filled: true
    },
    
    // Ellipses/Circles
    {
      id: 'ellipse-1',
      name: 'filledCircle',
      type: 'ellipse',
      position: { x: 30, y: 140 },
      width: 30,
      height: 30,
      color: '#22c55e',  // Green
      filled: true,
      opacity: 0.8
    },
    {
      id: 'ellipse-2',
      name: 'borderedCircle',
      type: 'ellipse',
      position: { x: 75, y: 140 },
      width: 30,
      height: 30,
      color: 'transparent',
      borderColor: '#8b5cf6',  // Purple
      borderWidth: 2,
      filled: false
    },
    {
      id: 'ellipse-3',
      name: 'ellipse',
      type: 'ellipse',
      position: { x: 120, y: 140 },
      width: 50,
      height: 30,
      color: '#e0f2fe',  // Light blue fill
      borderColor: '#0284c7',  // Blue border
      borderWidth: 2,
      filled: true
    },
    
    // Label text fields
    {
      id: 'label-1',
      name: 'label1',
      type: 'text',
      position: { x: 20, y: 20 },
      width: 80,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Horizontal Lines:'
    },
    {
      id: 'label-2',
      name: 'label2',
      type: 'text',
      position: { x: 110, y: 20 },
      width: 50,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Vertical Lines:'
    },
    {
      id: 'label-3',
      name: 'label3',
      type: 'text',
      position: { x: 20, y: 80 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Rectangles:'
    },
    {
      id: 'label-4',
      name: 'label4',
      type: 'text',
      position: { x: 20, y: 130 },
      width: 100,
      height: 8,
      fontSize: 10,
      fontColor: '#666666',
      content: 'Circles & Ellipses:'
    }
  ]],
  fieldGroups: [],
  pdfmeVersion: 'x.x.x'
};

// Test data (shapes don't need data, but text labels do)
const testData = {
  label1: 'Horizontal Lines:',
  label2: 'Vertical Lines:',
  label3: 'Rectangles:',
  label4: 'Circles & Ellipses:',
  // Shape fields don't have data values
  horizontalLine1: '',
  horizontalLine2: '',
  horizontalLine3: '',
  verticalLine1: '',
  verticalLine2: '',
  verticalLine3: '',
  filledRectangle: '',
  borderedRectangle: '',
  filledBorderedRectangle: '',
  filledCircle: '',
  borderedCircle: '',
  ellipse: ''
};

async function runTest() {
  console.log('📋 Testing Shape Fields');
  console.log('──────────────────────────────────────────\n');
  
  try {
    const html = await generateHTML({
      template: shapesTemplate,
      inputs: [testData],
      plugins: {},
      options: {
        title: 'Shape Fields Test',
        includeStyles: true,
        printFriendly: true
      }
    });
    
    console.log('✅ HTML generated successfully');
    console.log(`  Length: ${html.length} characters`);
    
    // Check if shapes are in HTML
    const checks = [
      { name: 'Horizontal lines', test: html.includes('type: line') || html.match(/width: \d+mm;[\s\S]*?height: [0-3]mm/g) },
      { name: 'Vertical lines', test: html.includes('type: line') || html.match(/width: [0-3]mm;[\s\S]*?height: \d+mm/g) },
      { name: 'Rectangles (type: rectangle)', test: html.includes('rectangle') || html.match(/width: 40mm;[\s\S]*?height: 30mm/g) },
      { name: 'Ellipses (border-radius: 50%)', test: html.includes('border-radius: 50%') },
      { name: 'Red color (#ef4444)', test: html.includes('#ef4444') },
      { name: 'Blue color (#3b82f6)', test: html.includes('#3b82f6') },
      { name: 'Green color (#22c55e)', test: html.includes('#22c55e') },
      { name: 'Opacity support', test: html.includes('opacity:') }
    ];
    
    console.log('\n📊 Shape Checks:');
    checks.forEach(check => {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-shapes-output.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n📁 Saved: test-shapes-output.html`);
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Test Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Open test-shapes-output.html in your browser');
    console.log('   You should see:');
    console.log('   - 3 horizontal lines (black, red, blue)');
    console.log('   - 3 vertical lines (black, green, orange)');
    console.log('   - 3 rectangles (filled blue, bordered red, yellow with border)');
    console.log('   - 3 ellipses (filled green circle, bordered purple circle, blue ellipse)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();

