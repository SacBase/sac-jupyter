# Jupyter kernel for SaC

This repository contains jupyter-related tools for SaC.

## Installation

1. Clone this repository:

```bash
git clone git@github.com:SacBase/sac-jupyter.git
```

2. Install [Jupyter notebook](https://jupyter.org/install).
3. Get the Jupyter data directory path using `jupyter --data-dir`.
4. Within this director, create a new directory `kernels`.

```bash
mkdir -p <jupyter-path>/kernels
```

5. Copy the `sac` directory to the newly created `kernels` directory.

```bash
cp -r sac <jupyter-path>/kernels
```

6. Adjust the path in `<jupyter-path>/kernels/sac/kernel.json` to
   point to the location of the `kernel.py` file in this repository.

```bash
echo "$PWD"
$ <repository-path>
```

7. Start the Jupyter notebook.
   In the web interface you set the kernel language to SaC.

```bash
jupyter notebook
```
