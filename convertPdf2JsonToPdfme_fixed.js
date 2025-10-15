const fs = require("fs");
const path = require("path");

/**
 * Converts pdf2json output to pdfme-compatible template schema
 *
 * IMPORTANT COORDINATE SYSTEMS:
 *
 * pdf2json:
 * - Units: inches (1 inch = 25.4mm)
 * - Origin: BOTTOM-LEFT corner
 * - Y-axis: increases UPWARD
 *
 * pdfme:
 * - Units: millimeters
 * - Origin: TOP-LEFT corner
 * - Y-axis: increases DOWNWARD
 */

// pdf2json uses inches as units (1 inch = 25.4 mm)
const INCHES_TO_MM = 25.4;

/**
 * Convert pdf2json inches to millimeters
 */
function inchesToMm(inches) {
  return inches * INCHES_TO_MM;
}

/**
 * Convert Y coordinate from pdf2json (bottom-left origin) to pdfme (top-left origin)
 */
function convertYCoordinate(y, pageHeight, elementHeight = 0) {
  return inchesToMm(pageHeight - y - elementHeight);
}

/**
 * Decode pdf2json text content
 */
function decodeText(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
}

/**
 * Estimate text height based on font size
 */
function estimateTextHeight(fontSize) {
  return (fontSize / 72) * 25.4 * 1.2;
}

/**
 * Convert pdf2json page to pdfme schemas
 */
function convertPageToSchemas(page, pageIndex) {
  const schemas = [];
  const pageHeight = page.Height; // in inches

  if (page.Texts && page.Texts.length > 0) {
    page.Texts.forEach((text, idx) => {
      if (text.R && text.R.length > 0) {
        const content = text.R.map(r => decodeText(r.T)).join("");
        const fontSize = text.R[0].TS ? text.R[0].TS[1] : 12;
        const textHeight = estimateTextHeight(fontSize);

        schemas.push({
          type: "text",
          name: `text_${pageIndex}_${idx}`,
          position: {
            x: inchesToMm(text.x),
            y: convertYCoordinate(text.y, pageHeight, 0)
          },
          width: inchesToMm(text.w || 2),
          height: textHeight,
          content: content,
          fontSize: fontSize,
          fontColor: text.oc || "#000000",
          alignment: text.A || "left",
          fontName: "NotoSerifJP-Regular"
        });
      }
    });
  }

  return schemas;
}

/**
 * Main conversion function
 */
function convertPdf2JsonToPdfme(pdf2jsonPath, outputPath) {
  console.log(`Reading pdf2json file: ${pdf2jsonPath}`);

  const pdf2jsonData = JSON.parse(fs.readFileSync(pdf2jsonPath, "utf8"));

  if (!pdf2jsonData.Pages || pdf2jsonData.Pages.length === 0) {
    throw new Error("No pages found in pdf2json data");
  }

  console.log(`\nPDF Info:`);
  console.log(`  Total pages: ${pdf2jsonData.Pages.length}`);
  console.log(`  First page size: ${pdf2jsonData.Pages[0].Width}" x ${pdf2jsonData.Pages[0].Height}"`);

  const schemas = pdf2jsonData.Pages.map((page, idx) => {
    console.log(`Converting page ${idx + 1}/${pdf2jsonData.Pages.length}...`);
    return convertPageToSchemas(page, idx);
  });

  const firstPage = pdf2jsonData.Pages[0];
  const pageWidth = inchesToMm(firstPage.Width);
  const pageHeight = inchesToMm(firstPage.Height);

  console.log(`\nPage dimensions (mm): ${pageWidth.toFixed(2)} x ${pageHeight.toFixed(2)}`);

  const pdfmeTemplate = {
    schemas: schemas,
    basePdf: {
      width: Math.round(pageWidth * 100) / 100,
      height: Math.round(pageHeight * 100) / 100,
      padding: [10, 10, 10, 10]
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(pdfmeTemplate, null, 2));
  console.log(`\n✓ Conversion complete!`);
  console.log(`  Pages converted: ${schemas.length}`);
  console.log(`  Total schemas: ${schemas.reduce((sum, page) => sum + page.length, 0)}`);
  console.log(`  Output saved to: ${outputPath}`);
  console.log(`\nYou can now load this template in pdfme playground!`);
}

if (require.main === module) {
  const pdf2jsonPath = process.argv[2] || path.join(__dirname, "WGS_1822_POSITIVE_9777381_3.json");
  const outputPath = process.argv[3] || path.join(__dirname, "pdfme_template.json");

  try {
    convertPdf2JsonToPdfme(pdf2jsonPath, outputPath);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

module.exports = { convertPdf2JsonToPdfme, decodeText };
