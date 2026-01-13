import React from 'react';
import ReactDOM from 'react-dom';
import JSZip from 'jszip';
import {
  cloneDeep,
  Template,
  DesignerProps,
  checkDesignerProps,
  checkTemplate,
  PDFME_VERSION,
} from '@pdfme/common';
import { generateHTML, generateHTMLFragments, wrapFragmentWithCSSLink, type GenerateHTMLProps, type GenerateHTMLFragmentsResult } from '@pdfme/generator';
import { BaseUIClass } from './class.js';
import { DESTROYED_ERR_MSG } from './constants.js';
import DesignerComponent from './components/Designer/index.js';
import AppContextProvider from './components/AppContextProvider.js';

class Designer extends BaseUIClass {
  private onSaveTemplateCallback?: (template: Template) => void;
  private onChangeTemplateCallback?: (template: Template) => void;
  private pageCursor: number = 0;

  constructor(props: DesignerProps) {
    super(props);
    checkDesignerProps(props);
  }

  public saveTemplate() {
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);
    if (this.onSaveTemplateCallback) {
      this.onSaveTemplateCallback(this.template);
    }
  }

  public updateTemplate(template: Template) {
    checkTemplate(template);
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);
    this.template = cloneDeep(template);
    if (this.onChangeTemplateCallback) {
      this.onChangeTemplateCallback(template);
    }
    this.render();
  }

  public onSaveTemplate(cb: (template: Template) => void) {
    this.onSaveTemplateCallback = cb;
  }

  public onChangeTemplate(cb: (template: Template) => void) {
    this.onChangeTemplateCallback = cb;
  }

  public getPageCursor() {
    return this.pageCursor;
  }

  /**
   * Generate HTML report with data (renders like PDF)
   * Requires input data and plugins
   */
  public async generateHTMLReport(
    inputs: Record<string, any>[],
    options?: { title?: string; filename?: string }
  ): Promise<void> {
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);
    
    const { title, filename } = options || {};
    
    try {
      const html = await generateHTML({
        template: this.template,
        inputs: inputs,
        plugins: this.getPluginsRegistry().entries().reduce((acc, [, plugin]) => {
          acc[plugin.propPanel.defaultSchema.type] = plugin;
          return acc;
        }, {} as any),
        options: {
          title: title || 'Report',
          includeStyles: true,
          printFriendly: true,
          font: this.getFont()
        }
      });
      
      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ HTML report generated and downloaded');
    } catch (error: any) {
      console.error('❌ Failed to generate HTML report:', error);
      throw error;
    }
  }


  protected render() {
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);
    ReactDOM.render(
      <AppContextProvider
        lang={this.getLang()}
        font={this.getFont()}
        plugins={this.getPluginsRegistry()}
        options={this.getOptions()}
      >
        <DesignerComponent
          template={this.template}
          onSaveTemplate={(template) => {
            this.template = template;
            this.template.pdfmeVersion = PDFME_VERSION;
            if (this.onSaveTemplateCallback) {
              this.onSaveTemplateCallback(template);
            }
          }}
          onChangeTemplate={(template) => {
            this.template = template;
            this.template.pdfmeVersion = PDFME_VERSION;
            if (this.onChangeTemplateCallback) {
              this.onChangeTemplateCallback(template);
            }
          }}
          onPageCursorChange={(newPageCursor: number) => {
            this.pageCursor = newPageCursor;
          }}
          onExportHTML={async () => {
            // Generate sample data from template fields
            const template = this.getTemplate();
            const sampleData: Record<string, any> = {};
            
            // Extract field names from first page
            const firstPageSchemas = template.schemas[0] || [];
            const schemas = Array.isArray(firstPageSchemas) ? firstPageSchemas : Object.values(firstPageSchemas);
            
            schemas.forEach((schema: any) => {
              // Provide sample values based on field type
              if (schema.type === 'text' || schema.type === 'multiVariableText') {
                sampleData[schema.name] = schema.content || `Sample ${schema.name}`;
              } else if (schema.type === 'table') {
                sampleData[schema.name] = schema.content || '[]';
              } else if (schema.type === 'checkbox') {
                sampleData[schema.name] = 'false';
              } else if (schema.type === 'image') {
                sampleData[schema.name] = schema.content || '';
              } else {
                sampleData[schema.name] = schema.content || '';
              }
            });
            
            console.log('📋 Generating HTML with sample data:', sampleData);
            
            try {
              await this.generateHTMLReport([sampleData], {
                title: 'Sample Report',
                filename: `report-${new Date().toISOString().split('T')[0]}.html`
              });
            } catch (error: any) {
              console.error('Failed to generate HTML:', error);
              alert('Failed to generate HTML: ' + error.message);
            }
          }}
          onExportHTMLFragments={async () => {
            const template = this.getTemplate();
            const sampleData: Record<string, any> = {};

            // Build sample data from all pages
            template.schemas.forEach((pageSchemas) => {
              const schemas = Array.isArray(pageSchemas) ? pageSchemas : Object.values(pageSchemas);
              schemas.forEach((schema: any) => {
                if (schema.type === 'text' || schema.type === 'multiVariableText') {
                  sampleData[schema.name] = schema.content || `Sample ${schema.name}`;
                } else if (schema.type === 'table') {
                  sampleData[schema.name] = schema.content || '[]';
                } else if (schema.type === 'checkbox') {
                  sampleData[schema.name] = 'false';
                } else if (schema.type === 'image') {
                  sampleData[schema.name] = schema.content || '';
                } else {
                  sampleData[schema.name] = schema.content || '';
                }
              });
            });

            console.log('📄 Generating HTML fragments...');

            try {
              const result = await generateHTMLFragments({
                template,
                inputs: [sampleData],
                plugins: this.getPluginsRegistry().entries().reduce((acc, [, plugin]) => {
                  acc[plugin.propPanel.defaultSchema.type] = plugin;
                  return acc;
                }, {} as any),
                options: {
                  includeCombined: true,
                  printFriendly: true,
                  font: this.getFont(),
                },
              });

              // Create zip file with all fragments and CSS
              const zip = new JSZip();

              // Add CSS file to zip
              zip.file('styles.css', result.css);

              // Add each fragment to zip (raw HTML - just div content)
              for (const fragment of result.fragments) {
                zip.file(`${fragment.sectionName}.html`, fragment.html);
              }

              // Add ungrouped if any
              if (result.ungroupedHtml && result.ungroupedFieldIds.length > 0) {
                zip.file('ungrouped.html', result.ungroupedHtml);
              }

              // Generate and download zip file
              const zipBlob = await zip.generateAsync({ type: 'blob' });
              const zipUrl = URL.createObjectURL(zipBlob);
              const zipLink = document.createElement('a');
              zipLink.href = zipUrl;
              zipLink.download = `html-fragments-${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(zipLink);
              zipLink.click();
              document.body.removeChild(zipLink);
              URL.revokeObjectURL(zipUrl);

              console.log(`✅ Exported ${result.fragments.length} fragments + CSS as ZIP`);
            } catch (error: any) {
              console.error('❌ Failed to generate HTML fragments:', error);
              alert('Failed to generate HTML fragments: ' + error.message);
            }
          }}
          onExportRazor={async () => {
            const template = this.getTemplate();
            const sampleData: Record<string, any> = {};

            // Build sample data from all pages
            template.schemas.forEach((pageSchemas) => {
              const schemas = Array.isArray(pageSchemas) ? pageSchemas : Object.values(pageSchemas);
              schemas.forEach((schema: any) => {
                sampleData[schema.name] = schema.content || '';
              });
            });

            console.log('📄 Generating Razor fragments...');

            try {
              const result = await generateHTMLFragments({
                template,
                inputs: [sampleData],
                plugins: this.getPluginsRegistry().entries().reduce((acc, [, plugin]) => {
                  acc[plugin.propPanel.defaultSchema.type] = plugin;
                  return acc;
                }, {} as any),
                options: {
                  outputFormat: 'razor',
                  printFriendly: true,
                  font: this.getFont(),
                },
              });

              // Create zip file with all fragments and CSS
              const zip = new JSZip();

              // Add CSS file to zip
              zip.file('styles.css', result.css);

              // Add each fragment to zip
              for (const fragment of result.fragments) {
                const filename = fragment.sectionName.endsWith('.cshtml')
                  ? fragment.sectionName
                  : `${fragment.sectionName}.cshtml`;
                zip.file(filename, fragment.html);
              }

              // Generate and download zip file
              const zipBlob = await zip.generateAsync({ type: 'blob' });
              const zipUrl = URL.createObjectURL(zipBlob);
              const zipLink = document.createElement('a');
              zipLink.href = zipUrl;
              zipLink.download = `razor-fragments-${new Date().toISOString().split('T')[0]}.zip`;
              document.body.appendChild(zipLink);
              zipLink.click();
              document.body.removeChild(zipLink);
              URL.revokeObjectURL(zipUrl);

              console.log(`✅ Exported ${result.fragments.length} Razor fragments + CSS as ZIP`);
            } catch (error: any) {
              console.error('❌ Failed to generate Razor fragments:', error);
              alert('Failed to generate Razor fragments: ' + error.message);
            }
          }}
          onExportJSON={() => {
            const template = this.getTemplate();
            const json = JSON.stringify(template, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          size={this.size}
        />
      </AppContextProvider>,
      this.domContainer,
    );
  }
}

export default Designer;
