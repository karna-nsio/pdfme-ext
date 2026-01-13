const fs = require('fs');
const path = require('path');

// Mock data model matching the Razor Model structure
const mockModel = {
  PatientDTO: {
    FullName: "Jane Doe",
    Gender: "Female",
    DOB: new Date("1991-01-15"),
    MRN: "MRN123456789",
    AccessionNumber: "ACC987654321",
    FamilyNumber: "FAM456789"
  },
  LabNumber: "LAB123456",
  TestCode: 1822, // Change to 1840, 1870, or 1897 to test conditionals
  Recipients: [
    {
      FullName: "Dr. John Smith",
      HospitalCode: "NIAD", // Will be converted to "NIAID"
      Location: "Houston, TX",
      PhoneNumber: "555-123-4567",
      Fax: "555-123-4568"
    },
    {
      FullName: "Dr. Jane Wilson",
      HospitalCode: "Memorial Hospital",
      PhoneNumber: "555-234-5678",
      Fax: "555-234-5679"
    },
    {
      FullName: "Dr. Bob Johnson",
      HospitalCode: "City Medical Center",
      PhoneNumber: "555-345-6789",
      Fax: "555-345-6790"
    }
  ],
  ClientTestCode: "BG-1822",
  SampleType: "Blood", // Use underscores for testing: "Blood__Plasma" or "Dried_Blood_Spot"
  CollectionDate: new Date("2025-08-07"),
  ReportedDate: new Date("2025-08-11"),
  AmendedDate: new Date("2025-09-23"),
  RNASeqStatus: "Opt-Out",
  MotherInfo: {
    LabNumber: "DNA1234567",
    SecondaryFindings: "Opt-Out"
  },
  FatherInfo: {
    LabNumber: "DNA2345678",
    SecondaryFindings: "Opt-Out"
  },
  AdditionalRelativeInfo: {
    LabNumber: "DNA3456789",
    SecondaryFindings: "Opt-In"
  },
  IsParental: false,
  IsMRNDisplayed: true,
  OrderSource: "Standard",
  IndividualId: "IND123",
  NiaidFamilyId: "NFAM456",
  BatchReceived: "2025-08-01"
};

// Helper functions
const formatDate = (date) => {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const hasValue = (value) => {
  return value !== null && value !== undefined;
};

// Simple Razor expression renderer
function renderRazorTemplate(html, model) {
  let rendered = html;

  // Handle @if statements with complex conditions
  // Handle MRN conditional
  const mrnConditionRegex = /@if\s*\(\s*\(Model\.IsParental\.HasValue[^}]+\}\s*\{([^}]*)\}\s*\}/gs;
  rendered = rendered.replace(mrnConditionRegex, (match, content) => {
    const shouldShow = (hasValue(model.IsParental) && !model.IsParental) ||
                       (hasValue(model.IsMRNDisplayed) && model.IsMRNDisplayed);
    if (shouldShow) {
      // Check inner MRN condition
      const shouldShowMRN = !(model.OrderSource && model.OrderSource.toUpperCase() === "EPIC" &&
                             (model.TestCode.toString() === "1850" || model.TestCode.toString() === "1550"));
      return content.replace(/@if[^{]+\{([^}]*)\}/, shouldShowMRN ? model.PatientDTO.MRN : "");
    }
    return "";
  });

  // Handle TestCode 1840/1870 conditional
  const testCodeConditionRegex = /@if\s*\(\s*Model\.TestCode\s*==\s*1840\s*\|\|\s*Model\.TestCode\s*==\s*1870\s*\)\s*\{([^}]*)\}/gs;
  rendered = rendered.replace(testCodeConditionRegex, (match, content) => {
    if (model.TestCode === 1840 || model.TestCode === 1870) {
      return content;
    }
    return "";
  });

  // Handle TestCode != 1897 conditional
  const sampleTypeConditionRegex = /@if\s*\(\s*Model\.TestCode\s*!=\s*1897\s*\)\s*\{([^}]*)\}/gs;
  rendered = rendered.replace(sampleTypeConditionRegex, (match, content) => {
    if (model.TestCode !== 1897) {
      return content;
    }
    return "";
  });

  // Handle nullable comparator objects
  const comparatorRegex = /@if\s*\(\s*Model\.(MotherInfo|FatherInfo|AdditionalRelativeInfo)\s*!=\s*null\s*\)\s*\{([^}]*)\}/gs;
  rendered = rendered.replace(comparatorRegex, (match, objectName, content) => {
    if (model[objectName] !== null && model[objectName] !== undefined) {
      return content;
    }
    return "";
  });

  // Handle Recipients conditional and loop
  const recipientsConditionRegex = /@if\s*\(\s*Model\.Recipients\.Count\(\)\s*>\s*1\s*\)\s*\{([\s\S]*?)\}\}/gs;
  rendered = rendered.replace(recipientsConditionRegex, (match, content) => {
    if (model.Recipients.length > 1) {
      // Handle the @for loop
      let loopResult = "";
      const forLoopRegex = /@for\s*\([^)]+\)\s*\{([\s\S]*?)\}/gs;
      const forMatch = content.match(forLoopRegex);

      if (forMatch) {
        const loopContent = forMatch[0];
        const innerContent = loopContent.replace(/@for\s*\([^)]+\)\s*\{([\s\S]*?)\}/, '$1');

        // Process each recipient (up to 4 additional recipients)
        for (let i = 1; i < Math.min(model.Recipients.length, 5); i++) {
          const recipientContent = innerContent
            .replace(/@if\s*\(\s*i\s*==\s*1\s*\)\s*\{([^}]*)\}/g, i === 1 ? '$1' : '')
            .replace(/@if\s*\(\s*i\s*==\s*2\s*\)\s*\{([^}]*)\}/g, i === 2 ? '$1' : '')
            .replace(/@if\s*\(\s*i\s*==\s*3\s*\)\s*\{([^}]*)\}/g, i === 3 ? '$1' : '')
            .replace(/@if\s*\(\s*i\s*==\s*4\s*\)\s*\{([^}]*)\}/g, i === 4 ? '$1' : '');

          loopResult += recipientContent
            .replace(/@Model\.Recipients\.ElementAt\(i\)\.FullName/g, model.Recipients[i].FullName)
            .replace(/@Model\.Recipients\.ElementAt\(i\)\.HospitalCode/g, model.Recipients[i].HospitalCode);
        }

        return content.replace(forLoopRegex, loopResult);
      }
      return content;
    }
    return "";
  });

  // Handle @{ } blocks (Test Code logic)
  const codeBlockRegex = /@\{[\s\S]*?if\s*\([^)]+\)\s*\{([^}]*)\}[\s\S]*?else[\s\S]*?\{([^}]*)\}[\s\S]*?\}/gs;
  rendered = rendered.replace(codeBlockRegex, (match, ifContent, elseContent) => {
    // Test Code conditional
    if (match.includes('ClientTestCode')) {
      if (model.ClientTestCode && model.ClientTestCode.toUpperCase() !== "BG-1500-DEFAULT") {
        return ifContent.replace(/@Model\.ClientTestCode/g, model.ClientTestCode);
      } else {
        return elseContent.replace(/@Model\.TestCode/g, model.TestCode);
      }
    }
    return match;
  });

  // Handle date conditionals @if (Model.XXX.HasValue) {@Model.XXX.Value.ToString("MM/dd/yyyy")}
  const dateConditionalRegex = /@if\s*\(\s*Model\.([\w.]+)\.HasValue\s*\)\s*\{@Model\.\1\.Value\.ToString\("[^"]+"\)\}/g;
  rendered = rendered.replace(dateConditionalRegex, (match, path) => {
    const parts = path.split('.');
    let value = model;
    for (const part of parts) {
      value = value?.[part];
    }
    return hasValue(value) ? formatDate(value) : "";
  });

  // Handle Recipients.FirstOrDefault() patterns
  rendered = rendered.replace(/@Model\.Recipients\.FirstOrDefault\(\)\.([\w]+)/g, (match, prop) => {
    return model.Recipients[0]?.[prop] || "";
  });

  // Handle simple property access @Model.XXX.YYY
  rendered = rendered.replace(/@Model\.([\w.]+)(?:\.ToString\(\))?(?:\.Replace\("[^"]+","[^"]+"\)\.Replace\("[^"]+","[^"]+"\))?/g, (match, path) => {
    const parts = path.split('.');
    let value = model;
    for (const part of parts) {
      value = value?.[part];
    }

    // Handle special methods
    if (typeof value === 'string' && match.includes('Replace')) {
      value = value.replace(/__/g, '/').replace(/_/g, ' ');
    }

    return value !== null && value !== undefined ? value : "";
  });

  // Handle ternary expressions @(condition ? value1 : value2)
  const ternaryRegex = /@\(Model\.Recipients\.FirstOrDefault\(\)\.HospitalCode\s*==\s*"NIAD"\s*\?\s*"NIAID"\s*:\s*Model\.Recipients\.FirstOrDefault\(\)\.HospitalCode\)/g;
  rendered = rendered.replace(ternaryRegex, () => {
    const hospitalCode = model.Recipients[0]?.HospitalCode;
    return hospitalCode === "NIAD" ? "NIAID" : hospitalCode;
  });

  return rendered;
}

// Main test function
function testRazorFile(filePath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${path.basename(filePath)}`);
  console.log('='.repeat(80));

  try {
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const rendered = renderRazorTemplate(htmlContent, mockModel);

    // Save rendered output
    const outputPath = filePath.replace('.html', '_rendered.html');
    fs.writeFileSync(outputPath, rendered, 'utf-8');

    console.log(`✓ Successfully rendered!`);
    console.log(`✓ Output saved to: ${outputPath}`);
    console.log(`\n--- Sample Output (first 500 chars) ---`);
    console.log(rendered.substring(0, 500) + '...');
    console.log('\n--- Mock Data Used ---');
    console.log(JSON.stringify(mockModel, null, 2));

  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    console.error(error.stack);
  }
}

// Test the file
const filePath = process.argv[2] || 'C:\\Users\\sandi\\source\\repos\\pdfme\\wgs-fragments-razor\\demographicinfo.html';
testRazorFile(filePath);

console.log(`\n${'='.repeat(80)}`);
console.log('Test Complete!');
console.log('='.repeat(80));
console.log('\nTo test with different data:');
console.log('1. Edit the mockModel object in this script');
console.log('2. Run: node test-razor-render.js <path-to-html-file>');
console.log('\nExample test scenarios:');
console.log('- Change TestCode to 1840 or 1870 to see conditional fields');
console.log('- Change TestCode to 1897 to hide Sample Type');
console.log('- Set MotherInfo to null to hide Mother section');
console.log('- Change Recipients array to test multiple recipients');
