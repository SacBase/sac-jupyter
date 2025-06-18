[![docker pulls](https://img.shields.io/docker/pulls/sacbase/sac-jupyter-notebook)](https://hub.docker.com/r/sacbase/sac-jupyter-notebook)

# SaC Jupyter kernel

This repository contains Jupyter-related tools for SaC.

We recommend using the pre-built [Docker image](https://hub.docker.com/r/sacbase/sac-jupyter-notebook).

# Manual installation

## Prerequisites

- [sac2c and the standard library](https://sac-home.org/download:main).
- [Jupyter notebook](https://jupyter.org/install).

## Installation

1. Get the Jupyter data directory path using `jupyter --data-dir`.
2. Within this director, create a new directory `kernels`.

```bash
mkdir -p <jupyter-path>/kernels
```

3. Copy the `sac` directory to the newly created `kernels` directory.

```bash
cp -r sac <jupyter-path>/kernels
```

4. Adjust the path in `<jupyter-path>/kernels/sac/kernel.json` to
   point to the location of the `kernel.py` file in this repository.

```bash
echo $PWD
$ <repository-path>
```

## Running Jupyter

To start the Jupyter notebook, run:

```bash
jupyter notebook
```

In the web interface you set the kernel language to SaC.
