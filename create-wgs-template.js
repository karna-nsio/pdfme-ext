/**
 * Create WGS Template Schema
 * Creates a basic PDFMe template structure for WGS reports
 * Run with: node create-wgs-template.js
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════');
console.log('  WGS Template Schema Generator');
console.log('═══════════════════════════════════════════\n');

// Create a comprehensive WGS template based on typical WGS report structure
const wgsTemplate = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  },
  schemas: [[
    // Header Section
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
      content: 'John Doe'
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
      content: 'WGS-1800'
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
      content: '01/15/1985'
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
      content: 'Whole Genome Sequencing: Rapid Trio'
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
      content: '10/13/2025'
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
      fontColor: '#dc2626',
      content: 'POSITIVE'
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
      content: 'Detailed phenotype description and research findings will be displayed here. This field supports multi-line text with proper formatting and can contain extensive information about the genetic findings.'
    }
  ]],
  fieldGroups: [
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
  ],
  pdfmeVersion: 'x.x.x',
  metadata: {
    name: 'WGS Report Template',
    description: 'Whole Genome Sequencing Report Template',
    version: '1.0.0',
    createdBy: 'PDFMe Template Generator',
    createdAt: new Date().toISOString(),
    sourcePdf: 'WGS_1800_POSITIVE_Phenotype and Research findings9755658 (1) 3.pdf'
  }
};

// Save the template
const outputPath = path.join(__dirname, 'wgs-template.json');
fs.writeFileSync(outputPath, JSON.stringify(wgsTemplate, null, 2), 'utf-8');

console.log('✅ WGS Template generated successfully!');
console.log(`📁 Saved: ${outputPath}`);
console.log(`📊 Template size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);

console.log('\n📋 Template Structure:');
console.log(`  Pages: ${wgsTemplate.schemas.length}`);
console.log(`  Fields: ${wgsTemplate.schemas[0].length}`);
console.log(`  Field Groups: ${wgsTemplate.fieldGroups.length}`);

console.log('\n📝 Field Categories:');
console.log('  📄 Header (Title, Subtitle)');
console.log('  👤 Patient Information (Name, ID, DOB)');
console.log('  🧪 Test Information (Type, Date)');
console.log('  📊 Results (Status)');
console.log('  🔬 Phenotype & Research Findings');

console.log('\n🎯 Sample Fields:');
wgsTemplate.schemas[0].slice(0, 5).forEach((field, index) => {
  console.log(`  ${index + 1}. ${field.name}: "${field.content}"`);
  console.log(`     Position: (${field.position.x}mm, ${field.position.y}mm)`);
  console.log(`     Size: ${field.width}mm × ${field.height}mm`);
});

console.log('\n═══════════════════════════════════════════');
console.log('  ✅ Template Generation Complete!');
console.log('═══════════════════════════════════════════');
console.log('\n💡 Next steps:');
console.log('  1. Import wgs-template.json into PDFMe Designer');
console.log('  2. Adjust field positions to match your PDF');
console.log('  3. Add/remove fields as needed');
console.log('  4. Set up conditional logic');
console.log('  5. Test with your data');
console.log('\n🚀 Ready to use in your WGS reporting system!');

