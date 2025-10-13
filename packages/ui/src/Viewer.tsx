import React from 'react';
import ReactDOM from 'react-dom';
import { PreviewProps } from '@pdfme/common';
import { PreviewUI } from './class.js';
import { DESTROYED_ERR_MSG } from './constants.js';
import Preview from './components/Preview.js';
import AppContextProvider from './components/AppContextProvider.js';
import { cleanTemplate } from './helper.js';

class Viewer extends PreviewUI {
  constructor(props: PreviewProps) {
    super(props);
    console.warn(
      '[@pdfme/ui] Viewer component is deprecated and will be removed in a future version.',
    );
  }

  protected render() {
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);
    // Clean template to remove null conditions before rendering
    const cleanedTemplate = cleanTemplate(this.template);
    ReactDOM.render(
      <AppContextProvider
        lang={this.getLang()}
        font={this.getFont()}
        plugins={this.getPluginsRegistry()}
        options={this.getOptions()}
      >
        <Preview template={cleanedTemplate} size={this.size} inputs={this.inputs} />
      </AppContextProvider>,
      this.domContainer,
    );
  }
}

export default Viewer;
