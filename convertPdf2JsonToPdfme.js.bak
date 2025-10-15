const fs = require("fs");
const path = require("path");

/**
 * Converts pdf2json output to pdfme-compatible template schema
 *
 * pdf2json structure:
 * - Pages[].Texts[].R[].T: Text content
 * - Pages[].Texts[].x, y, w: Position and width
 * - Pages[].Fills[]: Background fills/rectangles
 * - Pages[].Width, Height: Page dimensions
 *
 * pdfme schema structure:
 * - schemas: Array of pages, each containing array of schema objects
 * - Each schema: { type, position: {x, y}, width, height, content, name }
 * - basePdf: { width, height, padding }
 */

// Convert mm to pdf2json units (1 mm = 0.0393701 inches, 72 points/inch)
const MM_TO_POINTS = 2.83465;

// Convert pdf2json units to mm (approximate)
function pointsToMm(points) {
  return points / MM_TO_POINTS;
}

/**
 * Decode pdf2json text content
 * @param {string} text - Encoded text from pdf2json
 * @returns {string} Decoded text
 */
function decodeText(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    // If decoding fails, return original text
    return text;
  }
}

/**
 * Group texts into table structure if they appear to form a table
 * @param {Array} texts - Array of text objects from pdf2json
 * @returns {Object|null} Table structure or null if not a table
 */
function detectTable(texts) {
  // Simple heuristic: if texts are aligned in rows and columns
  const yPositions = [...new Set(texts.map(t => t.y))].sort((a, b) => a - b);
  const xPositions = [...new Set(texts.map(t => t.x))].sort((a, b) => a - b);

  // Need at least 2 rows and 2 columns to be considered a table
  if (yPositions.length < 2 || xPositions.length < 2) {
    return null;
  }

  // Check if texts form a grid pattern
  const tolerance = 0.5; // Tolerance for alignment
  let gridCount = 0;

  for (const y of yPositions) {
    for (const x of xPositions) {
      const hasText = texts.some(t =>
        Math.abs(t.y - y) < tolerance && Math.abs(t.x - x) < tolerance
      );
      if (hasText) gridCount++;
    }
  }

  // If more than 50% of grid positions have text, it's likely a table
  const gridTotal = yPositions.length * xPositions.length;
  if (gridCount / gridTotal > 0.5) {
    return {
      rows: yPositions.length,
      cols: xPositions.length,
      yPositions,
      xPositions,
      texts
    };
  }

  return null;
}

/**
 * Build table schema from grouped texts
 * @param {Object} tableData - Detected table structure
 * @param {number} schemaIndex - Index for schema naming
 * @returns {Object} pdfme table schema
 */
function buildTableSchema(tableData, schemaIndex) {
  const { yPositions, xPositions, texts } = tableData;

  // Build 2D array of table content
  const content = [];
  const tolerance = 0.5;

  for (let rowIdx = 0; rowIdx < yPositions.length; rowIdx++) {
    const row = [];
    const y = yPositions[rowIdx];

    for (let colIdx = 0; colIdx < xPositions.length; colIdx++) {
      const x = xPositions[colIdx];

      // Find text at this position
      const text = texts.find(t =>
        Math.abs(t.y - y) < tolerance && Math.abs(t.x - x) < tolerance
      );

      if (text && text.R && text.R[0]) {
        row.push(decodeText(text.R[0].T));
      } else {
        row.push("");
      }
    }
    content.push(row);
  }

  // Calculate position and size
  const minX = Math.min(...xPositions);
  const minY = Math.min(...yPositions);
  const maxX = Math.max(...texts.map(t => t.x + (t.w || 0)));
  const maxY = Math.max(...yPositions);

  // First row is header
  const head = content[0] || [];
  const body = content.slice(1);

  // Calculate column width percentages
  const totalWidth = maxX - minX;
  const headWidthPercentages = xPositions.map((_, idx) => {
    if (idx < xPositions.length - 1) {
      return ((xPositions[idx + 1] - xPositions[idx]) / totalWidth) * 100;
    }
    return ((maxX - xPositions[idx]) / totalWidth) * 100;
  });

  return {
    type: "table",
    name: `table_${schemaIndex}`,
    position: {
      x: pointsToMm(minX),
      y: pointsToMm(minY)
    },
    width: pointsToMm(maxX - minX),
    height: pointsToMm(maxY - minY),
    content: JSON.stringify(body),
    showHead: true,
    head: head,
    headWidthPercentages: headWidthPercentages,
    tableStyles: {
      borderColor: "#000000",
      borderWidth: 0.5
    },
    headStyles: {
      fontName: "NotoSerifJP-Regular",
      fontSize: 10,
      characterSpacing: 0,
      alignment: "left",
      verticalAlignment: "middle",
      lineHeight: 1,
      fontColor: "#000000",
      backgroundColor: "#dcedf8",
      borderWidth: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      padding: { top: 5, right: 5, bottom: 5, left: 5 }
    },
    bodyStyles: {
      fontName: "NotoSerifJP-Regular",
      fontSize: 10,
      characterSpacing: 0,
      alignment: "left",
      verticalAlignment: "middle",
      lineHeight: 1,
      fontColor: "#000000",
      backgroundColor: "#ffffff",
      alternateBackgroundColor: "#f5f5f5",
      borderWidth: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      padding: { top: 5, right: 5, bottom: 5, left: 5 }
    },
    columnStyles: {}
  };
}

/**
 * Convert pdf2json page to pdfme schemas
 * @param {Object} page - pdf2json page object
 * @param {number} pageIndex - Page index
 * @returns {Array} Array of pdfme schemas
 */
function convertPageToSchemas(page, pageIndex) {
  const schemas = [];
  let schemaIndex = 0;

  // Try to detect tables first
  if (page.Texts && page.Texts.length > 0) {
    const tableData = detectTable(page.Texts);

    if (tableData) {
      // Build table schema
      const tableSchema = buildTableSchema(tableData, schemaIndex++);
      schemas.push(tableSchema);
    } else {
      // Convert individual texts to text schemas
      page.Texts.forEach((text, idx) => {
        if (text.R && text.R.length > 0) {
          const content = text.R.map(r => decodeText(r.T)).join("");

          schemas.push({
            type: "text",
            name: `text_${pageIndex}_${idx}`,
            position: {
              x: pointsToMm(text.x),
              y: pointsToMm(text.y)
            },
            width: pointsToMm(text.w || 50),
            height: pointsToMm(10), // Default height
            content: content,
            fontSize: text.R[0].TS ? text.R[0].TS[1] : 12,
            fontColor: text.oc || "#000000",
            alignment: text.A || "left"
          });
        }
      });
    }
  }

  return schemas;
}

/**
 * Main conversion function
 * @param {string} pdf2jsonPath - Path to pdf2json output file
 * @param {string} outputPath - Path to save pdfme template
 */
function convertPdf2JsonToPdfme(pdf2jsonPath, outputPath) {
  console.log(`Reading pdf2json file: ${pdf2jsonPath}`);

  const pdf2jsonData = JSON.parse(fs.readFileSync(pdf2jsonPath, "utf8"));

  if (!pdf2jsonData.Pages || pdf2jsonData.Pages.length === 0) {
    throw new Error("No pages found in pdf2json data");
  }

  // Convert each page
  const schemas = pdf2jsonData.Pages.map((page, idx) => {
    console.log(`Converting page ${idx + 1}/${pdf2jsonData.Pages.length}`);
    return convertPageToSchemas(page, idx);
  });

  // Get page dimensions from first page
  const firstPage = pdf2jsonData.Pages[0];
  const pageWidth = pointsToMm(firstPage.Width);
  const pageHeight = pointsToMm(firstPage.Height);

  // Build pdfme template
  const pdfmeTemplate = {
    schemas: schemas,
    basePdf: {
      width: pageWidth,
      height: pageHeight,
      padding: [10, 10, 10, 10] // Default padding
    },
    pdfmeVersion: "5.0.0"
  };

  // Save output
  fs.writeFileSync(outputPath, JSON.stringify(pdfmeTemplate, null, 2));
  console.log(`✓ Conversion complete!`);
  console.log(`  Pages converted: ${schemas.length}`);
  console.log(`  Total schemas: ${schemas.reduce((sum, page) => sum + page.length, 0)}`);
  console.log(`  Output saved to: ${outputPath}`);
}

// CLI usage
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

module.exports = { convertPdf2JsonToPdfme, decodeText, detectTable };
