import generate from './generate.js';
import { generateHTML, downloadAsHTML } from './generateHTML.js';
import type { GenerateHTMLProps } from './generateHTML.js';
import {
  generateHTMLFragments,
  downloadHTMLFragments,
  getFragmentBySection,
  wrapFragmentAsDocument,
  wrapFragmentWithCSSLink,
  getRawFragment,
} from './htmlFragments.js';
import type {
  HTMLFragment,
  GenerateHTMLFragmentsResult,
  GenerateHTMLFragmentsProps,
  GenerateHTMLFragmentsOptions,
} from './htmlFragments.js';
import { extractCSS, generateBaseCSS } from './cssExtractor.js';
import type { ExtractedCSS, CSSExtractionOptions } from './cssExtractor.js';
import {
  transformPlaceholders,
  transformCondition,
  wrapInCondition,
  generateForEachBlock,
  transformTableToRazor,
  transformFragmentToRazor,
} from './razorTransformer.js';
import type { ModelMapping, RazorTransformOptions } from './razorTransformer.js';

export {
  generate,
  generateHTML,
  downloadAsHTML,
  // HTML Fragment exports
  generateHTMLFragments,
  downloadHTMLFragments,
  getFragmentBySection,
  wrapFragmentAsDocument,
  wrapFragmentWithCSSLink,
  getRawFragment,
  // CSS utilities
  extractCSS,
  generateBaseCSS,
  // Razor transformer utilities
  transformPlaceholders,
  transformCondition,
  wrapInCondition,
  generateForEachBlock,
  transformTableToRazor,
  transformFragmentToRazor,
};

export type {
  GenerateHTMLProps,
  // Fragment types
  HTMLFragment,
  GenerateHTMLFragmentsResult,
  GenerateHTMLFragmentsProps,
  GenerateHTMLFragmentsOptions,
  // CSS types
  ExtractedCSS,
  CSSExtractionOptions,
  // Razor types
  ModelMapping,
  RazorTransformOptions,
};
