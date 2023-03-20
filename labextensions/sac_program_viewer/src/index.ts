import { 
  JupyterFrontEnd, 
  JupyterFrontEndPlugin 
} from '@jupyterlab/application';

import { 
  INotebookTracker, 
  NotebookPanel 
} from '@jupyterlab/notebook';

import { 
  ICommandPalette, 
  MainAreaWidget, 
  ToolbarButton 
} from '@jupyterlab/apputils';

import { Widget, Menu, MenuBar } from '@lumino/widgets';

/**
 * Initialization data for the sac_program_viewer extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sac_program_viewer',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, notebooks: INotebookTracker) => {

    console.log('JupyterLab extension sac_program_viewer is active!');

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
  }
};

export default plugin;
