# Jupyter kernel for SaC

This repository contains jupyter-related tools for SaC.

## Installation

Installing the kernel requires the following steps:

1. Install sac with jupyter support.
2. Copy the content of this repository to the default location where
   jupyter is looking for kernels. On linux systems local jupyter
   configurations are located in `$HOME/.local/share/jupyter`.
   On OSX this is at `$HOME/Library/Jupyter` and on windows it is
   `%APPDATA%\jupyter`. Referring to this path as <jupyter-path>,
    you should do:
```bash
mkdir -p <jupyter-path>/kernels
cp -r sac <jupyter-path>/kernels
cp -r sac_tutorial <jupyter-path>/kernels
```
3. Adjust the path in `<jupyter-path>/kernels/sac/kernel.json` and in
   `<jupyter-path>/kernels/sac_tutorial/kernel.json` to
   point to the location of the `kernel.py` file in this repository.

Enabling the sac2c on jupyter tutorial requires a few more steps:

1. Install `nbextensions` for jupyter.
2. Now install the sac2c-jupyter mini tutorial:
```bash
mkdir -p <jupyter-path>/nbextensions/
cp -r nbextensions/* <jupyter-path>/nbextensions
```
3. Enable the tutorial extensions:
```bash
jupyter nbextension enable sac_tutorial
```

At some point we hope to add these files to the sac2c packages so the
installation process would be significantly simpler.

## Running

Running sac kernel is as simple as:
```bash
jupyter notebook
```
or
```bash
jupyter-lab
```
and in the web interface you set the kernel language to SaC.

On the terminal you can run:
```bash
ipython console --kernel=sac
```
If you do so you may want to install this lexer https://github.com/SacBase/sac-pygments
to get syntax highlighting.

## Additional installations
The following module and plotting library need to be installed to be able to use the `%plot` command inside of Jupyter that (as the name suggests) can plot SaC variables inside the notebook. The kernel will still be usable without these additions and is only needed for the plotting feature.

- The [matplotlib](https://matplotlib.org/stable/) python library should be installed on your system for the plots to work. This can be done using the `pip` or third party `conda` library using
```bash
pip install matplotlib
```
or
```bash
conda install matplotlib
```

- The SaC `Python` module present in this repository is also needed for the plot function to work. It needs to be recognised by the SaC library. To do so create a folder called `.sac2crc` in your home directory and paste the file called `sac2crc.python` (found in the Python folder in this repository) into it. The SaC compiler will look for this folder. Edit line 3 and 4 in this file, making them both hold the path to where the `Python` folder is located on your device. Now only the `use Python: all;` statement is needed in the notebook to start plotting.

