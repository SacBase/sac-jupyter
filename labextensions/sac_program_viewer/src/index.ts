import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { /*NotebookActions,*/ NotebookPanel, INotebookModel, } from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';
import { openProgramIcon } from './style/icons';


/**
 * Helper functions
 */
function log(): void{
  console.log('The command was')
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
      label: '*',
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
  const { commands, shell } = app;
  const command: string = 'sac:get-program';
  commands.addCommand(command, {
    label: 'Execute sac:get-program Command',
    caption:'Execute sac:get-program Command',
    execute: () => {
      const widget = new ProgramWidget();
      shell.add(widget, 'main');
    },
  });
  return command;
}

/**
 * Function to create widget panel
 */
class ProgramWidget extends Widget {
  constructor() {
    super();
    this.addClass('jp-example-view');
    this.id = 'simple-widget-example';
    this.title.label = 'Widget Example View';
    this.title.closable = true;
  }
}


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


/*
    // Define a widget creator function,
    // then call it to make a new widget
    const newWidget = () => {
      // Create a blank content widget inside of a MainAreaWidget
      const content = new Widget();
      const widget = new MainAreaWidget({ content });
      widget.id = 'sac-jupyterlab';
      widget.title.label = 'Current program';
      widget.title.closable = true;
      return widget;
    }
    let widget = newWidget();

    // Add an application command
    const command: string = 'sac:open';
    app.commands.addCommand(command, {
      label: 'Sac program viewer',
      execute: () => {
        // Regenerate the widget if disposed
        if (widget.isDisposed) {
          widget = newWidget();
        }
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });

    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
*/