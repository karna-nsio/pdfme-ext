/**
 * Extract WGS PDF Structure to JSON Schema
 * Analyzes the specific WGS PDF and creates a PDFMe template
 * Run with: node extract-wgs-pdf.js
 */

const fs = require('fs');
const path = require('path');

// Import PDF parsing
let pdfParse;

async function loadPDFLibrary() {
  try {
    const pdfParseModule = require('pdf-parse');
    pdfParse = pdfParseModule.PDFParse || pdfParseModule;
    console.log('✅ Loaded pdf-parse');
    return true;
  } catch (error) {
    console.log('❌ PDF parsing library not available');
    console.log('Install with: npm install pdf-parse');
    return false;
  }
}

/**
 * Extract text from PDF
 */
async function extractPDFText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new pdfParse(dataBuffer);
  const data = await parser;
  return data.text;
}

/**
 * Parse WGS PDF text and extract structured data
 */
function parseWGSText(text) {
  const sections = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract key information patterns
  const patterns = {
    patientName: /(?:Patient Name|Name)[:\s]*([A-Za-z\s,]+)/i,
    patientId: /(?:Patient ID|ID|Accession)[:\s]*([A-Z0-9\-]+)/i,
    dob: /(?:Date of Birth|DOB|Birth Date)[:\s]*([0-9\/\-]+)/i,
    testType: /(?:Test Type|Test)[:\s]*([^.\n]+)/i,
    testDate: /(?:Test Date|Date|Collection Date)[:\s]*([0-9\/\-]+)/i,
    result: /(?:Result|Status|Finding)[:\s]*(POSITIVE|NEGATIVE|INDETERMINATE|PATHOGENIC|BENIGN)/i,
    phenotype: /(?:Phenotype|Clinical|Findings)[:\s]*([^.\n]+)/i
  };
  
  // Extract information
  Object.keys(patterns).forEach(key => {
    const match = text.match(patterns[key]);
    if (match) {
      sections[key] = match[1].trim();
    }
  });
  
  // Extract phenotype section (usually longer text)
  const phenotypeMatch = text.match(/(?:Phenotype and Research Findings|Clinical Findings|Research Findings)[:\s]*([\s\S]*?)(?:\n\n|\n[A-Z][a-z]+:|$)/i);
  if (phenotypeMatch) {
    sections.phenotypeDescription = phenotypeMatch[1].trim();
  }
  
  return sections;
}

/**
 * Generate PDFMe template based on extracted data
 */
function generateWGSTemplate(extractedData, pdfPath) {
  const basePdf = {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  };
  
  const schemas = [[
    // Header
    {
      id: 'header-title',
      name: 'reportTitle',
      type: 'text',
      position: { x: 20, y: 20 },
      width: 170,
      height: 15,
      fontSize: 18,
      fontColor: '#1f2937',
      alignment: 'center',
      content: 'Whole Genome Sequencing Report'
    },
    {
      id: 'header-subtitle',
      name: 'reportSubtitle',
      type: 'text',
      position: { x: 20, y: 40 },
      width: 170,
      height: 10,
      fontSize: 14,
      fontColor: '#6b7280',
      alignment: 'center',
      content: 'Rapid Trio Analysis'
    },
    
    // Patient Information Section
    {
      id: 'patient-section-title',
      name: 'patientSectionTitle',
      type: 'text',
      position: { x: 20, y: 60 },
      width: 80,
      height: 12,
      fontSize: 16,
      fontColor: '#1f2937',
      content: 'Patient Information'
    },
    {
      id: 'patient-name-label',
      name: 'patientNameLabel',
      type: 'text',
      position: { x: 20, y: 80 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Patient Name:'
    },
    {
      id: 'patient-name',
      name: 'patientName',
      type: 'text',
      position: { x: 60, y: 80 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      content: extractedData.patientName || 'John Doe'
    },
    {
      id: 'patient-id-label',
      name: 'patientIdLabel',
      type: 'text',
      position: { x: 20, y: 95 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Patient ID:'
    },
    {
      id: 'patient-id',
      name: 'patientId',
      type: 'text',
      position: { x: 60, y: 95 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      content: extractedData.patientId || 'WGS-1800'
    },
    {
      id: 'dob-label',
      name: 'dobLabel',
      type: 'text',
      position: { x: 20, y: 110 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Date of Birth:'
    },
    {
      id: 'dob',
      name: 'dateOfBirth',
      type: 'text',
      position: { x: 60, y: 110 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      content: extractedData.dob || '01/15/1985'
    },
    
    // Test Information Section
    {
      id: 'test-section-title',
      name: 'testSectionTitle',
      type: 'text',
      position: { x: 20, y: 135 },
      width: 80,
      height: 12,
      fontSize: 16,
      fontColor: '#1f2937',
      content: 'Test Information'
    },
    {
      id: 'test-type-label',
      name: 'testTypeLabel',
      type: 'text',
      position: { x: 20, y: 155 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Test Type:'
    },
    {
      id: 'test-type',
      name: 'testType',
      type: 'text',
      position: { x: 60, y: 155 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      content: extractedData.testType || 'Whole Genome Sequencing: Rapid Trio'
    },
    {
      id: 'test-date-label',
      name: 'testDateLabel',
      type: 'text',
      position: { x: 20, y: 170 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Test Date:'
    },
    {
      id: 'test-date',
      name: 'testDate',
      type: 'text',
      position: { x: 60, y: 170 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      content: extractedData.testDate || '10/13/2025'
    },
    
    // Results Section
    {
      id: 'results-section-title',
      name: 'resultsSectionTitle',
      type: 'text',
      position: { x: 20, y: 195 },
      width: 80,
      height: 12,
      fontSize: 16,
      fontColor: '#1f2937',
      content: 'Results'
    },
    {
      id: 'result-status-label',
      name: 'resultStatusLabel',
      type: 'text',
      position: { x: 20, y: 215 },
      width: 30,
      height: 10,
      fontSize: 12,
      fontColor: '#374151',
      content: 'Status:'
    },
    {
      id: 'result-status',
      name: 'resultStatus',
      type: 'text',
      position: { x: 60, y: 215 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: extractedData.result === 'POSITIVE' ? '#dc2626' : '#000000',
      content: extractedData.result || 'POSITIVE'
    },
    
    // Phenotype Section
    {
      id: 'phenotype-section-title',
      name: 'phenotypeSectionTitle',
      type: 'text',
      position: { x: 20, y: 240 },
      width: 80,
      height: 12,
      fontSize: 16,
      fontColor: '#1f2937',
      content: 'Phenotype and Research Findings'
    },
    {
      id: 'phenotype-description',
      name: 'phenotypeDescription',
      type: 'multiVariableText',
      position: { x: 20, y: 260 },
      width: 170,
      height: 30,
      fontSize: 11,
      fontColor: '#000000',
      lineHeight: 1.4,
      content: extractedData.phenotypeDescription || 'Detailed phenotype description and research findings will be displayed here. This field supports multi-line text with proper formatting and can contain extensive information about the genetic findings.'
    }
  ]];
  
  const fieldGroups = [
    {
      id: 'patient-info-group',
      name: 'Patient Information',
      fieldIds: ['patient-name', 'patient-id', 'dob'],
      collapsed: false,
      hide: false
    },
    {
      id: 'test-info-group',
      name: 'Test Information',
      fieldIds: ['test-type', 'test-date'],
      collapsed: false,
      hide: false
    },
    {
      id: 'results-group',
      name: 'Results',
      fieldIds: ['result-status'],
      collapsed: false,
      hide: false
    }
  ];
  
  const template = {
    basePdf,
    schemas,
    fieldGroups,
    pdfmeVersion: 'x.x.x',
    metadata: {
      name: 'WGS Report Template',
      description: 'Whole Genome Sequencing Report Template - Extracted from PDF',
      version: '1.0.0',
      createdBy: 'PDFMe Template Generator',
      createdAt: new Date().toISOString(),
      sourcePdf: path.basename(pdfPath),
      extractedData: extractedData
    }
  };
  
  return template;
}

/**
 * Main function
 */
async function main() {
  const pdfPath = 'C:\\Users\\sandi\\source\\repos\\pdfme\\WGS_1800_POSITIVE_Phenotype and Research findings9755658 (1) 3.pdf';
  
  console.log('═══════════════════════════════════════════');
  console.log('  WGS PDF to JSON Schema Extractor');
  console.log('═══════════════════════════════════════════\n');
  
  // Check if PDF exists
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ PDF file not found:', pdfPath);
    return;
  }
  
  console.log('📄 Analyzing PDF:', path.basename(pdfPath));
  console.log('📁 File size:', Math.round(fs.statSync(pdfPath).size / 1024), 'KB');
  
  // Load PDF library
  const libraryLoaded = await loadPDFLibrary();
  if (!libraryLoaded) {
    return;
  }
  
  try {
    // Extract text from PDF
    console.log('\n🔍 Extracting text from PDF...');
    const pdfText = await extractPDFText(pdfPath);
    
    if (!pdfText) {
      console.log('⚠️ No text extracted from PDF, using default template structure');
      const extractedData = {};
    } else {
      console.log(`✅ Text extracted: ${pdfText.length} characters`);
      console.log(`📝 Sample text: "${pdfText.substring(0, 200)}..."`);
      
      // Parse structured data
      console.log('\n🏗️ Parsing structured data...');
      const extractedData = parseWGSText(pdfText);
    }
    
    const extractedData = pdfText ? parseWGSText(pdfText) : {};
    
    console.log('📊 Extracted data:');
    Object.keys(extractedData).forEach(key => {
      const value = extractedData[key];
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`  ${key}: "${displayValue}"`);
    });
    
    // Generate PDFMe template
    console.log('\n🎯 Generating PDFMe template...');
    const template = generateWGSTemplate(extractedData, pdfPath);
    
    // Save template
    const outputPath = path.join(__dirname, 'wgs-extracted-template.json');
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf-8');
    
    console.log('✅ Template generated successfully!');
    console.log(`📁 Saved: ${outputPath}`);
    console.log(`📊 Template size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
    
    // Summary
    console.log('\n📋 Template Summary:');
    console.log(`  Pages: ${template.schemas.length}`);
    console.log(`  Fields: ${template.schemas[0].length}`);
    console.log(`  Field Groups: ${template.fieldGroups.length}`);
    console.log(`  Extracted Data Points: ${Object.keys(extractedData).length}`);
    
    // Show extracted data
    console.log('\n📝 Extracted Information:');
    if (extractedData.patientName) console.log(`  👤 Patient: ${extractedData.patientName}`);
    if (extractedData.patientId) console.log(`  🆔 ID: ${extractedData.patientId}`);
    if (extractedData.dob) console.log(`  📅 DOB: ${extractedData.dob}`);
    if (extractedData.testType) console.log(`  🧪 Test: ${extractedData.testType}`);
    if (extractedData.testDate) console.log(`  📆 Date: ${extractedData.testDate}`);
    if (extractedData.result) console.log(`  📊 Result: ${extractedData.result}`);
    if (extractedData.phenotypeDescription) console.log(`  🔬 Phenotype: ${extractedData.phenotypeDescription.substring(0, 100)}...`);
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Extraction Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('\n💡 Next steps:');
    console.log('  1. Review wgs-extracted-template.json');
    console.log('  2. Import into PDFMe Designer');
    console.log('  3. Adjust field positions to match PDF layout');
    console.log('  4. Add any missing fields');
    console.log('  5. Test with your data');
    console.log('\n🚀 Ready to use in your WGS reporting system!');
    
  } catch (error) {
    console.error('\n❌ Error processing PDF:', error.message);
    console.error(error.stack);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generateWGSTemplate, parseWGSText };
