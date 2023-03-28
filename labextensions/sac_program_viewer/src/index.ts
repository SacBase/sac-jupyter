import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { /*NotebookActions,*/ NotebookPanel, INotebookModel, } from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { 
  // ICommandPalette, 
  // MainAreaWidget, 
  ToolbarButton, 
  // UseSignal 
} from '@jupyterlab/apputils';

// import { Widget, Menu } from '@lumino/widgets';


/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'toolbar-button',
  autoStart: true,
};


/**
 * A notebook widget extension that adds a button to the toolbar.
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
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const clearOutput = () => {
      //NotebookActions.clearAllOutputs(panel.content);
      console.log('You clicked a button')
    };
    const button = new ToolbarButton({
      className: 'clear-output-button',
      label: 'fa-computer-classic',
      onClick: clearOutput,
      tooltip: 'Clear All Outputs',
    });

    panel.toolbar.insertItem(10, 'clearOutputs', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(app: JupyterFrontEnd): void {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
}
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

export default plugin;
