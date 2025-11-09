import { PDFFont, PDFDocument } from '@pdfme/pdf-lib';
import type { Font as FontKitFont } from 'fontkit';
import type { TextSchema } from './types.js';
import {
  PDFRenderProps,
  ColorType,
  Font,
  getDefaultFont,
  getFallbackFontName,
  mm2pt,
} from '@pdfme/common';
import {
  VERTICAL_ALIGN_TOP,
  VERTICAL_ALIGN_MIDDLE,
  VERTICAL_ALIGN_BOTTOM,
  DEFAULT_FONT_SIZE,
  DEFAULT_ALIGNMENT,
  DEFAULT_VERTICAL_ALIGNMENT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_CHARACTER_SPACING,
  DEFAULT_FONT_COLOR,
} from './constants.js';
import {
  calculateDynamicFontSize,
  heightOfFontAtSize,
  getFontDescentInPt,
  getFontKitFont,
  widthOfTextAtSize,
  splitTextToSize,
} from './helper.js';
import { convertForPdfLayoutProps, rotatePoint, hex2PrintingColor } from '../utils.js';

const embedAndGetFontObj = async (arg: {
  pdfDoc: PDFDocument;
  font: Font;
  _cache: Map<PDFDocument, { [key: string]: PDFFont }>;
}) => {
  const { pdfDoc, font, _cache } = arg;
  if (_cache.has(pdfDoc)) {
    return _cache.get(pdfDoc) as { [key: string]: PDFFont };
  }

  const fontValues = await Promise.all(
    Object.values(font).map(async (v) => {
      let fontData = v.data;
      if (typeof fontData === 'string' && fontData.startsWith('http')) {
        fontData = await fetch(fontData).then((res) => res.arrayBuffer());
      }
      return pdfDoc.embedFont(fontData, {
        subset: typeof v.subset === 'undefined' ? true : v.subset,
      });
    }),
  );

  const fontObj = Object.keys(font).reduce(
    (acc, cur, i) => Object.assign(acc, { [cur]: fontValues[i] }),
    {} as { [key: string]: PDFFont },
  );

  _cache.set(pdfDoc, fontObj);
  return fontObj;
};

const getFontProp = ({
  value,
  fontKitFont,
  schema,
  colorType,
}: {
  value: string;
  fontKitFont: FontKitFont;
  colorType?: ColorType;
  schema: TextSchema;
}) => {
  const fontSize = schema.dynamicFontSize
    ? calculateDynamicFontSize({ textSchema: schema, fontKitFont, value })
    : (schema.fontSize ?? DEFAULT_FONT_SIZE);
  const color = hex2PrintingColor(schema.fontColor || DEFAULT_FONT_COLOR, colorType);

  return {
    alignment: schema.alignment ?? DEFAULT_ALIGNMENT,
    verticalAlignment: schema.verticalAlignment ?? DEFAULT_VERTICAL_ALIGNMENT,
    lineHeight: schema.lineHeight ?? DEFAULT_LINE_HEIGHT,
    characterSpacing: schema.characterSpacing ?? DEFAULT_CHARACTER_SPACING,
    fontSize,
    color,
  };
};

/**
 * Get the appropriate font name based on fontWeight and fontStyle.
 *
 * Font variants must be registered separately in options.font:
 * - 'Roboto' → Roboto-Regular.ttf (400)
 * - 'Roboto-Thin' → Roboto-Thin.ttf (100)
 * - 'Roboto-Light' → Roboto-Light.ttf (300)
 * - 'Roboto-Medium' → Roboto-Medium.ttf (500)
 * - 'Roboto-Semibold' → Roboto-Semibold.ttf (600)
 * - 'Roboto-Bold' → Roboto-Bold.ttf (700)
 * - 'Roboto-MediumItalic' → Roboto-MediumItalic.ttf (500 + italic)
 *
 * @param baseFontName - The base font name (e.g., 'Roboto')
 * @param fontWeight - Numeric (100-900) or 'normal' | 'bold'
 * @param fontStyle - 'normal' | 'italic'
 * @returns The font variant name to use
 */
const getFontVariant = (
  baseFontName: string,
  fontWeight?: number | 'normal' | 'bold',
  fontStyle?: 'normal' | 'italic'
): string => {
  // Normalize fontWeight to number
  let weight = 400; // default
  if (fontWeight === 'bold') {
    weight = 700;
  } else if (fontWeight === 'normal' || fontWeight === undefined) {
    weight = 400;
  } else if (typeof fontWeight === 'number') {
    weight = fontWeight;
  }

  // Map weight to font suffix
  const weightSuffixMap: { [key: number]: string } = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: '', // Regular - no suffix
    500: 'Medium',
    600: 'Semibold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };

  const weightSuffix = weightSuffixMap[weight] || '';
  const isItalic = fontStyle === 'italic';

  // Build font variant name
  if (weightSuffix && isItalic) {
    return `${baseFontName}-${weightSuffix}Italic`;
  } else if (weightSuffix) {
    return `${baseFontName}-${weightSuffix}`;
  } else if (isItalic) {
    return `${baseFontName}-Italic`;
  }

  return baseFontName;
};

export const pdfRender = async (arg: PDFRenderProps<TextSchema>) => {
  const { value, pdfDoc, pdfLib, page, options, schema, _cache } = arg;
  if (!value) return;

  const { font = getDefaultFont(), colorType } = options;

  const baseFontName = schema.fontName || getFallbackFontName(font);
  const variantFontName = getFontVariant(baseFontName, schema.fontWeight, schema.fontStyle);

  const [pdfFontObj, fontKitFont] = await Promise.all([
    embedAndGetFontObj({
      pdfDoc,
      font,
      _cache: _cache as unknown as Map<PDFDocument, { [key: string]: PDFFont }>,
    }),
    // Try to load the variant, fallback to base font if not available
    getFontKitFont(variantFontName, font, _cache as Map<string, FontKitFont>)
      .catch(() => getFontKitFont(baseFontName, font, _cache as Map<string, FontKitFont>)),
  ]);
  const fontProp = getFontProp({ value, fontKitFont, schema, colorType });

  const { fontSize, color, alignment, verticalAlignment, lineHeight, characterSpacing } = fontProp;

  const fontName = variantFontName as keyof typeof pdfFontObj;
  // Fallback to base font if variant doesn't exist
  const pdfFontValue = (pdfFontObj && pdfFontObj[fontName]) || pdfFontObj[baseFontName];

  const pageHeight = page.getHeight();
  const {
    width,
    height,
    rotate,
    position: { x, y },
    opacity,
  } = convertForPdfLayoutProps({ schema, pageHeight, applyRotateTranslate: false });

  if (schema.backgroundColor) {
    const color = hex2PrintingColor(schema.backgroundColor, colorType);
    page.drawRectangle({ x, y, width, height, rotate, color });
  }

  const firstLineTextHeight = heightOfFontAtSize(fontKitFont, fontSize);
  const descent = getFontDescentInPt(fontKitFont, fontSize);
  const halfLineHeightAdjustment = lineHeight === 0 ? 0 : ((lineHeight - 1) * fontSize) / 2;

  const lines = splitTextToSize({
    value,
    characterSpacing,
    fontSize,
    fontKitFont,
    boxWidthInPt: width,
  });

  // Text lines are rendered from the bottom upwards, we need to adjust the position down
  let yOffset = 0;
  if (verticalAlignment === VERTICAL_ALIGN_TOP) {
    yOffset = firstLineTextHeight + halfLineHeightAdjustment;
  } else {
    const otherLinesHeight = lineHeight * fontSize * (lines.length - 1);

    if (verticalAlignment === VERTICAL_ALIGN_BOTTOM) {
      yOffset = height - otherLinesHeight + descent - halfLineHeightAdjustment;
    } else if (verticalAlignment === VERTICAL_ALIGN_MIDDLE) {
      yOffset =
        (height - otherLinesHeight - firstLineTextHeight + descent) / 2 + firstLineTextHeight;
    }
  }

  const pivotPoint = { x: x + width / 2, y: pageHeight - mm2pt(schema.position.y) - height / 2 };
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

  lines.forEach((line, rowIndex) => {
    const trimmed = line.replace('\n', '');
    const textWidth = widthOfTextAtSize(trimmed, fontKitFont, fontSize, characterSpacing);
    const textHeight = heightOfFontAtSize(fontKitFont, fontSize);
    const rowYOffset = lineHeight * fontSize * rowIndex;

    // Adobe Acrobat Reader shows an error if `drawText` is called with an empty text
    if (line === '') {
      // return; // this also works
      line = '\r\n';
    }

    let xLine = x;
    if (alignment === 'center') {
      xLine += (width - textWidth) / 2;
    } else if (alignment === 'right') {
      xLine += width - textWidth;
    }

    let yLine = pageHeight - mm2pt(schema.position.y) - yOffset - rowYOffset;

    // draw strikethrough
    if (schema.strikethrough && textWidth > 0) {
      const _x = xLine + textWidth + 1;
      const _y = yLine + textHeight / 3;
      page.drawLine({
        start: rotatePoint({ x: xLine, y: _y }, pivotPoint, rotate.angle),
        end: rotatePoint({ x: _x, y: _y }, pivotPoint, rotate.angle),
        thickness: (1 / 12) * fontSize,
        color: color,
        opacity,
      });
    }

    // draw underline
    if (schema.underline && textWidth > 0) {
      const _x = xLine + textWidth + 1;
      const _y = yLine - textHeight / 12;
      page.drawLine({
        start: rotatePoint({ x: xLine, y: _y }, pivotPoint, rotate.angle),
        end: rotatePoint({ x: _x, y: _y }, pivotPoint, rotate.angle),
        thickness: (1 / 12) * fontSize,
        color: color,
        opacity,
      });
    }

    if (rotate.angle !== 0) {
      // As we draw each line individually from different points, we must translate each lines position
      // relative to the UI rotation pivot point. see comments in convertForPdfLayoutProps() for more info.
      const rotatedPoint = rotatePoint({ x: xLine, y: yLine }, pivotPoint, rotate.angle);
      xLine = rotatedPoint.x;
      yLine = rotatedPoint.y;
    }

    let spacing = characterSpacing;
    if (alignment === 'justify' && line.slice(-1) !== '\n') {
      // if alignment is `justify` but the end of line is not newline, then adjust the spacing
      const iterator = segmenter.segment(trimmed)[Symbol.iterator]();
      const len = Array.from(iterator).length;
      spacing += (width - textWidth) / len;
    }
    page.pushOperators(pdfLib.setCharacterSpacing(spacing));

    page.drawText(trimmed, {
      x: xLine,
      y: yLine,
      rotate,
      size: fontSize,
      color,
      lineHeight: lineHeight * fontSize,
      font: pdfFontValue,
      opacity,
    });
  });
};
