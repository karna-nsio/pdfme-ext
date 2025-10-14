/**
 * PDF to JSON Schema Generator
 * Analyzes a PDF and generates a PDFMe template schema
 * Run with: node pdf-to-schema.js
 */

const fs = require('fs');
const path = require('path');

// Import PDF parsing libraries
let pdfjsLib;
let pdfParse;

async function loadPDFLibraries() {
  try {
    // Try to load pdfjs-dist
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    console.log('✅ Loaded pdfjs-dist');
  } catch (error) {
    console.log('⚠️ pdfjs-dist not available, trying pdf-parse...');
    try {
      const pdfParseModule = require('pdf-parse');
      pdfParse = pdfParseModule.PDFParse || pdfParseModule;
      console.log('✅ Loaded pdf-parse');
    } catch (error2) {
      console.log('❌ No PDF parsing library available');
      console.log('Install with: npm install pdfjs-dist pdf-parse');
      return false;
    }
  }
  return true;
}

/**
 * Extract text and positions from PDF using pdfjs-dist
 */
async function extractWithPDFJS(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  
  const pages = [];
  const numPages = pdf.numPages;
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageData = {
      pageNumber: pageNum,
      width: page.view[2],
      height: page.view[3],
      textItems: []
    };
    
    textContent.items.forEach(item => {
      if (item.str.trim()) {
        pageData.textItems.push({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
          fontSize: item.transform[0],
          fontName: item.fontName
        });
      }
    });
    
    pages.push(pageData);
  }
  
  return pages;
}

/**
 * Extract text from PDF using pdf-parse (fallback)
 */
async function extractWithPDFParse(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdfParse(dataBuffer);
  const data = await parser;
  
  return [{
    pageNumber: 1,
    width: 595, // A4 default
    height: 842,
    textItems: [{
      text: data.text,
      x: 0,
      y: 0,
      width: 595,
      height: 842,
      fontSize: 12,
      fontName: 'Arial'
    }]
  }];
}

/**
 * Convert PDF data to PDFMe template schema
 */
function generatePDFMeSchema(pdfData, pdfPath) {
  const basePdf = {
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
    padding: [10, 10, 10, 10]
  };
  
  const schemas = [];
  const fieldGroups = [];
  
  pdfData.forEach((pageData, pageIndex) => {
    const pageSchemas = [];
    let fieldId = 0;
    
    // Group text items by approximate position to create fields
    const textGroups = groupTextByPosition(pageData.textItems);
    
    textGroups.forEach(group => {
      if (group.text && group.text.trim()) {
        const field = {
          id: `field-${pageIndex}-${fieldId++}`,
          name: `field_${pageIndex}_${fieldId}`,
          type: 'text',
          position: {
            x: mmFromPoints(group.x),
            y: mmFromPoints(pageData.height - group.y) // Flip Y coordinate
          },
          width: mmFromPoints(group.width || 50),
          height: mmFromPoints(group.height || 10),
          fontSize: group.fontSize || 12,
          fontColor: '#000000',
          content: group.text
        };
        
        pageSchemas.push(field);
      }
    });
    
    schemas.push(pageSchemas);
  });
  
  const template = {
    basePdf,
    schemas,
    fieldGroups,
    pdfmeVersion: 'x.x.x',
    metadata: {
      sourcePdf: path.basename(pdfPath),
      generatedAt: new Date().toISOString(),
      totalPages: pdfData.length,
      totalFields: schemas.reduce((sum, page) => sum + page.length, 0)
    }
  };
  
  return template;
}

/**
 * Group text items by position to create logical fields
 */
function groupTextByPosition(textItems) {
  const groups = [];
  const processed = new Set();
  
  textItems.forEach((item, index) => {
    if (processed.has(index)) return;
    
    const group = {
      text: item.text,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      fontSize: item.fontSize,
      fontName: item.fontName
    };
    
    // Find nearby text items to group together
    textItems.forEach((otherItem, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;
      
      const distance = Math.sqrt(
        Math.pow(item.x - otherItem.x, 2) + 
        Math.pow(item.y - otherItem.y, 2)
      );
      
      // If items are close together, group them
      if (distance < 20) { // 20 points threshold
        group.text += ' ' + otherItem.text;
        group.width = Math.max(group.width, otherItem.width);
        group.height = Math.max(group.height, otherItem.height);
        processed.add(otherIndex);
      }
    });
    
    groups.push(group);
    processed.add(index);
  });
  
  return groups;
}

/**
 * Convert points to millimeters
 */
function mmFromPoints(points) {
  return Math.round((points * 25.4) / 72 * 10) / 10; // Convert to mm with 1 decimal
}

/**
 * Main function
 */
async function main() {
  const pdfPath = 'C:\\Users\\sandi\\source\\repos\\pdfme\\WGS_1800_POSITIVE_Phenotype and Research findings9755658 (1) 3.pdf';
  
  console.log('═══════════════════════════════════════════');
  console.log('  PDF to JSON Schema Generator');
  console.log('═══════════════════════════════════════════\n');
  
  // Check if PDF exists
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ PDF file not found:', pdfPath);
    return;
  }
  
  console.log('📄 Analyzing PDF:', path.basename(pdfPath));
  console.log('📁 File size:', Math.round(fs.statSync(pdfPath).size / 1024), 'KB');
  
  // Load PDF libraries
  const librariesLoaded = await loadPDFLibraries();
  if (!librariesLoaded) {
    return;
  }
  
  try {
    // Extract PDF data
    console.log('\n🔍 Extracting text and positions...');
    let pdfData;
    
    if (pdfjsLib) {
      pdfData = await extractWithPDFJS(pdfPath);
    } else if (pdfParse) {
      pdfData = await extractWithPDFParse(pdfPath);
    }
    
    console.log(`✅ Extracted ${pdfData.length} page(s)`);
    
    // Debug: Show extracted text
    if (pdfData[0] && pdfData[0].textItems[0]) {
      const sampleText = pdfData[0].textItems[0].text.substring(0, 200);
      console.log(`📝 Sample text: "${sampleText}..."`);
      console.log(`📊 Text length: ${pdfData[0].textItems[0].text.length} characters`);
    }
    
    // Generate PDFMe schema
    console.log('\n🏗️ Generating PDFMe template schema...');
    const template = generatePDFMeSchema(pdfData, pdfPath);
    
    // Save schema
    const outputPath = path.join(__dirname, 'generated-template.json');
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf-8');
    
    console.log('✅ Schema generated successfully!');
    console.log(`📁 Saved: ${outputPath}`);
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Pages: ${template.schemas.length}`);
    console.log(`  Total fields: ${template.metadata.totalFields}`);
    console.log(`  Schema size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
    
    // Show first few fields as example
    if (template.schemas[0] && template.schemas[0].length > 0) {
      console.log('\n📋 Sample fields from page 1:');
      template.schemas[0].slice(0, 5).forEach((field, index) => {
        console.log(`  ${index + 1}. ${field.name}: "${field.content.substring(0, 50)}..."`);
        console.log(`     Position: (${field.position.x}mm, ${field.position.y}mm)`);
        console.log(`     Size: ${field.width}mm × ${field.height}mm`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Generation Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Next steps:');
    console.log('  1. Review generated-template.json');
    console.log('  2. Import into PDFMe Designer');
    console.log('  3. Adjust field positions and properties');
    console.log('  4. Test with your data');
    
  } catch (error) {
    console.error('\n❌ Error processing PDF:', error.message);
    console.error(error.stack);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generatePDFMeSchema };
