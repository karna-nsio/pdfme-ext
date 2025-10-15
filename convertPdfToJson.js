const PDFParser = require("pdf2json");
const fs = require("fs");
const path = require("path");

const pdfPath = path.join(__dirname, "WGS_1822_POSITIVE_9777381 3.pdf");
const outputPath = path.join(__dirname, "WGS_1822_POSITIVE_9777381_3.json");

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData) => {
  console.error("Error parsing PDF:", errData.parserError);
  process.exit(1);
});

pdfParser.on("pdfParser_dataReady", (pdfData) => {
  console.log("PDF parsed successfully!");

  // Write the parsed data to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(pdfData, null, 2));
  console.log(`JSON output saved to: ${outputPath}`);
});

// Load and parse the PDF
pdfParser.loadPDF(pdfPath);
