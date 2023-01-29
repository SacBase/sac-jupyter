define([
    'base/js/namespace'
], function(
    Jupyter
) {
    function load_ipython_extension() {
   //   if (Jupyter.notebook.get_cells().length===1){
   //change this piece of code to what you want
        if (Jupyter.notebook.kernel.name == 'sac')
            Jupyter.notebook.insert_cell_above('markdown', 0).set_text( "Welcome to iSaC");
        else if (Jupyter.notebook.kernel.name == 'sac_tutorial') {
            Jupyter.notebook.insert_cell_at_index('markdown', 0).set_text( "1. Evaluating Expressions: type an expression then hit `shift-return`; e.g.:");
            Jupyter.notebook.insert_cell_at_index('code', 1).set_text( "Array::iota (10)");
            Jupyter.notebook.insert_cell_at_index('markdown', 2).set_text( "2. Defining Variables: type `<var> = <expr> ;` then hit `shift-return`; e.g.:");
            Jupyter.notebook.insert_cell_at_index('code', 3).set_text( "v = Array::iota (10);");
            Jupyter.notebook.insert_cell_at_index('markdown', 4).set_text( "These variables can be referred to in expressions, e.g.:");
            Jupyter.notebook.insert_cell_at_index('code', 5).set_text( "v Array::+ 1");
            Jupyter.notebook.insert_cell_at_index('markdown', 6).set_text( "3. *Using Modules*: type `use <module name>: all;` then hit `shit-return`; e.g.");
            Jupyter.notebook.insert_cell_at_index('code', 7).set_text( "use Array:all;");
            Jupyter.notebook.insert_cell_at_index('markdown', 8).set_text( "Now, you can refer to all functions in that module without specifying the module name, e.g.");
            Jupyter.notebook.insert_cell_at_index('code', 9).set_text( "iota (8)");
            Jupyter.notebook.insert_cell_at_index('markdown', 10).set_text( "4. *Defining Functions*: type an entire function definition then hit `shift-return`; e.g.:");
            Jupyter.notebook.insert_cell_at_index('code', 11).set_text( "int[*] inc (int[*] a)\n{\n   res = { iv -> a[iv] +1 };\n   return res;\n}");
            Jupyter.notebook.insert_cell_at_index('markdown', 12).set_text( "Now, you can use this function in expressions as well, e.g.:");
            Jupyter.notebook.insert_cell_at_index('code', 13).set_text( "inc (iota (8))");
            Jupyter.notebook.insert_cell_at_index('markdown', 14).set_text( "You can inspect your code by using `%print` and find further options through `%help`.");
            Jupyter.notebook.insert_cell_at_index('code', 15).set_text( "%print");
            Jupyter.notebook.insert_cell_at_index('markdown', 16).set_text( "Navigate to the code cells, run and modify them at will.");
        }
    //  }
    }
    return {
        load_ipython_extension: load_ipython_extension
    };
});
