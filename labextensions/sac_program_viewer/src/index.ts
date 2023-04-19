import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { NotebookPanel, INotebookModel, } from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils';

//import { ILauncher } from '@jupyterlab/launcher';

//import { ITranslator } from '@jupyterlab/translation';

// Local imports
import { openProgramIcon } from './style/icons';
import { ExamplePanel } from './panel';


/**
 * Log functions for testing
 */
function log(): void{
  console.log('The command was executed')
}


/**
 * The plugin registration information.
 */
const extension: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'sac-program-viewer',
  autoStart: true,
  requires: [ICommandPalette]
};


/**
 * Add button to the toolbar.
 */
export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const openPanel = () => {
      log();
      createPanel(app);
    };
    const button = new ToolbarButton({
      className: 'sac-program-viewer-button',
      label: '',
      icon: openProgramIcon,
      onClick: openPanel,
      tooltip: 'Opens the sac program in a seperate panel',
    });

    panel.toolbar.insertItem(10, 'openPanel', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


/**
 * Function to create a command
 */
function createCommand(app: JupyterFrontEnd){
  const command: string = 'sac:get-program';
  app.commands.addCommand(command, {
    label: 'Execute sac:get-program Command',
    caption:'Execute sac:get-program Command',
    execute: () => {
      log();
      createPanel(app);
    },
  });
  return command;
}


/**
   * Creates an example panel from panel.ts.
   *
   * @returns The panel
   */
async function createPanel(app: JupyterFrontEnd): Promise<ExamplePanel> {
  const manager = app.serviceManager;
  const panel = new ExamplePanel(manager);
  app.shell.add(panel, 'main');
  return panel;
}


/**
 * Activate the extension and add command to the palette.
 *
 * @param app Main application object
 * @param palette Command palette
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette): void {
  const category = 'Sac Commands';
  const command = createCommand(app);

  console.log('sac-program-viewer is activated!');

  // Add button to the notebook menu
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());

  // Add the command to the command palette and menu
  palette.addItem({ command, category, args: { origin: 'from palette' } });
}

export default extension;