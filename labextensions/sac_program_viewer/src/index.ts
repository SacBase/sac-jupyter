import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { /*NotebookActions,*/ NotebookPanel, INotebookModel, } from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils';

//import { Widget } from '@lumino/widgets';

import { openProgramIcon } from './style/icons';

/*
import { ILauncher } from '@jupyterlab/launcher';
import { ITranslator } from '@jupyterlab/translation';
import { ExamplePanel } from './panel';
*/

/**
 * Helper functions
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
  //const { commands, shell } = app;
  const command: string = 'sac:get-program';
  app.commands.addCommand(command, {
    label: 'Execute sac:get-program Command',
    caption:'Execute sac:get-program Command',
    execute: () => {
      //const widget = new ProgramWidget();
      //app.shell.add(widget, 'main');
      log();
    },
  });
  return command;
}

/**
 * Function to create widget panel
 */
/*
class ProgramWidget extends Widget {
  constructor() {
    super();
    this.addClass('sac-panel');
    this.id = 'sac-panel';
    this.title.label = 'SAC Program View';
    this.title.closable = true;
  }
}
*/

/**
 * Activate the extension and add command to the palette.
 *
 * @param app Main application object
 * @param palette Command palette
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette): void {
  console.log('sac-program-viewer is activated!');
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());

  const category = 'Sac Commands';
  const command = createCommand(app);
  palette.addItem({ command, category, args: { origin: 'from palette' } });
}

export default extension;