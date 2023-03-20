import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the sac_program_viewer extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sac_program_viewer:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension sac_program_viewer is activated!');
  }
};

export default plugin;
