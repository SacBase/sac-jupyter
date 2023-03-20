from ._version import __version__


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "sac_program_viewer"
    }]

