/**
 * Manual WGS Template Creator
 * Creates a WGS template with common field positions
 * You can adjust positions to match your PDF
 * Run with: node wgs-manual-template.js
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════');
console.log('  Manual WGS Template Creator');
console.log('═══════════════════════════════════════════\n');

// Create WGS template with typical field positions
// Adjust these positions to match your PDF layout
const wgsTemplate = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [10, 10, 10, 10]
  },
  schemas: [[
    // Header Section (Top of page)
    {
      id: 'header-title',
      name: 'reportTitle',
      type: 'text',
      position: { x: 20, y: 15 },
      width: 170,
      height: 12,
      fontSize: 16,
      fontColor: '#1f2937',
      alignment: 'center',
      content: 'Whole Genome Sequencing Report'
    },
    {
      id: 'header-subtitle',
      name: 'reportSubtitle',
      type: 'text',
      position: { x: 20, y: 30 },
      width: 170,
      height: 10,
      fontSize: 12,
      fontColor: '#6b7280',
      alignment: 'center',
      content: 'Rapid Trio Analysis'
    },
    
    // Patient Information (Left side)
    {
      id: 'patient-section-title',
      name: 'patientSectionTitle',
      type: 'text',
      position: { x: 20, y: 50 },
      width: 60,
      height: 10,
      fontSize: 14,
      fontColor: '#1f2937',
      content: 'Patient Information'
    },
    {
      id: 'patient-name-label',
      name: 'patientNameLabel',
      type: 'text',
      position: { x: 20, y: 65 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Name:'
    },
    {
      id: 'patient-name',
      name: 'patientName',
      type: 'text',
      position: { x: 50, y: 65 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: 'John Doe'
    },
    {
      id: 'patient-id-label',
      name: 'patientIdLabel',
      type: 'text',
      position: { x: 20, y: 78 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'ID:'
    },
    {
      id: 'patient-id',
      name: 'patientId',
      type: 'text',
      position: { x: 50, y: 78 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: 'WGS-1800'
    },
    {
      id: 'dob-label',
      name: 'dobLabel',
      type: 'text',
      position: { x: 20, y: 91 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'DOB:'
    },
    {
      id: 'dob',
      name: 'dateOfBirth',
      type: 'text',
      position: { x: 50, y: 91 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: '01/15/1985'
    },
    
    // Test Information (Right side)
    {
      id: 'test-section-title',
      name: 'testSectionTitle',
      type: 'text',
      position: { x: 120, y: 50 },
      width: 60,
      height: 10,
      fontSize: 14,
      fontColor: '#1f2937',
      content: 'Test Information'
    },
    {
      id: 'test-type-label',
      name: 'testTypeLabel',
      type: 'text',
      position: { x: 120, y: 65 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Type:'
    },
    {
      id: 'test-type',
      name: 'testType',
      type: 'text',
      position: { x: 150, y: 65 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: 'WGS Rapid Trio'
    },
    {
      id: 'test-date-label',
      name: 'testDateLabel',
      type: 'text',
      position: { x: 120, y: 78 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Date:'
    },
    {
      id: 'test-date',
      name: 'testDate',
      type: 'text',
      position: { x: 150, y: 78 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: '10/13/2025'
    },
    
    // Results Section (Center)
    {
      id: 'results-section-title',
      name: 'resultsSectionTitle',
      type: 'text',
      position: { x: 20, y: 115 },
      width: 60,
      height: 10,
      fontSize: 14,
      fontColor: '#1f2937',
      content: 'Results'
    },
    {
      id: 'result-status-label',
      name: 'resultStatusLabel',
      type: 'text',
      position: { x: 20, y: 130 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Status:'
    },
    {
      id: 'result-status',
      name: 'resultStatus',
      type: 'text',
      position: { x: 50, y: 130 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#dc2626',
      content: 'POSITIVE'
    },
    
    // Phenotype Section (Bottom)
    {
      id: 'phenotype-section-title',
      name: 'phenotypeSectionTitle',
      type: 'text',
      position: { x: 20, y: 150 },
      width: 80,
      height: 10,
      fontSize: 14,
      fontColor: '#1f2937',
      content: 'Phenotype and Research Findings'
    },
    {
      id: 'phenotype-description',
      name: 'phenotypeDescription',
      type: 'multiVariableText',
      position: { x: 20, y: 165 },
      width: 170,
      height: 40,
      fontSize: 10,
      fontColor: '#000000',
      lineHeight: 1.3,
      content: 'This section contains detailed phenotype description and research findings. The analysis reveals significant genetic variants that may be associated with the patient\'s clinical presentation. Further investigation and correlation with clinical data is recommended.'
    },
    
    // Additional fields that might be in your PDF
    {
      id: 'accession-number-label',
      name: 'accessionNumberLabel',
      type: 'text',
      position: { x: 20, y: 220 },
      width: 30,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Accession:'
    },
    {
      id: 'accession-number',
      name: 'accessionNumber',
      type: 'text',
      position: { x: 55, y: 220 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: '9755658'
    },
    {
      id: 'report-date-label',
      name: 'reportDateLabel',
      type: 'text',
      position: { x: 120, y: 220 },
      width: 25,
      height: 8,
      fontSize: 10,
      fontColor: '#374151',
      content: 'Report:'
    },
    {
      id: 'report-date',
      name: 'reportDate',
      type: 'text',
      position: { x: 150, y: 220 },
      width: 60,
      height: 8,
      fontSize: 10,
      fontColor: '#000000',
      content: '10/13/2025'
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
    },
    {
      id: 'metadata-group',
      name: 'Report Metadata',
      fieldIds: ['accession-number', 'report-date'],
      collapsed: false,
      hide: false
    }
  ],
  pdfmeVersion: 'x.x.x',
  metadata: {
    name: 'WGS Report Template',
    description: 'Whole Genome Sequencing Report Template - Manual Layout',
    version: '1.0.0',
    createdBy: 'PDFMe Template Generator',
    createdAt: new Date().toISOString(),
    sourcePdf: 'WGS_1800_POSITIVE_Phenotype and Research findings9755658 (1) 3.pdf',
    notes: 'Adjust field positions to match your PDF layout'
  }
};

// Save the template
const outputPath = path.join(__dirname, 'wgs-manual-template.json');
fs.writeFileSync(outputPath, JSON.stringify(wgsTemplate, null, 2), 'utf-8');

console.log('✅ WGS Manual Template generated successfully!');
console.log(`📁 Saved: ${outputPath}`);
console.log(`📊 Template size: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);

console.log('\n📋 Template Structure:');
console.log(`  Pages: ${wgsTemplate.schemas.length}`);
console.log(`  Fields: ${wgsTemplate.schemas[0].length}`);
console.log(`  Field Groups: ${wgsTemplate.fieldGroups.length}`);

console.log('\n📝 Field Layout:');
console.log('  📄 Header (Top): Title, Subtitle');
console.log('  👤 Patient Info (Left): Name, ID, DOB');
console.log('  🧪 Test Info (Right): Type, Date');
console.log('  📊 Results (Center): Status');
console.log('  🔬 Phenotype (Bottom): Description');
console.log('  📋 Metadata (Bottom): Accession, Report Date');

console.log('\n🎯 Sample Fields:');
wgsTemplate.schemas[0].slice(0, 8).forEach((field, index) => {
  console.log(`  ${index + 1}. ${field.name}: "${field.content}"`);
  console.log(`     Position: (${field.position.x}mm, ${field.position.y}mm)`);
  console.log(`     Size: ${field.width}mm × ${field.height}mm`);
});

console.log('\n═══════════════════════════════════════════');
console.log('  ✅ Manual Template Complete!');
console.log('═══════════════════════════════════════════');
console.log('\n💡 Next steps:');
console.log('  1. Import wgs-manual-template.json into PDFMe Designer');
console.log('  2. Compare with your PDF layout');
console.log('  3. Adjust field positions (x, y coordinates)');
console.log('  4. Modify field sizes (width, height)');
console.log('  5. Add/remove fields as needed');
console.log('  6. Test with your data');
console.log('\n🎨 Position Guide:');
console.log('  - x: Horizontal position (0 = left edge)');
console.log('  - y: Vertical position (0 = top edge)');
console.log('  - width: Field width in mm');
console.log('  - height: Field height in mm');
console.log('\n🚀 Ready to customize for your WGS reports!');
