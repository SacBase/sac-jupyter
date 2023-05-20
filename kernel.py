from queue import Queue
from threading import Thread

from ipykernel.kernelbase import Kernel
import re
import subprocess
import tempfile
import shutil
from ctypes.util import find_library
import os
import os.path as path
import json
import shlex

from matplotlib import pyplot as plt
import importlib.util
from io import BytesIO
import urllib, base64

import ctypes

def rm_nonempty_dir (d):
    for root, dirs, files in os.walk (d, topdown=False):
        for name in files:
            os.remove (os.path.join(root, name))
        for name in dirs:
            os.rmdir (os.path.join(root, name))
    os.rmdir (d)


class RealTimeSubprocess(subprocess.Popen):
    """
    A subprocess that allows to read its stdout and stderr in real time
    """

    def __init__(self, cmd, write_to_stdout, write_to_stderr, directory):
        """
        :param cmd: the command to execute
        :param write_to_stdout: a callable that will be called with chunks of data from stdout
        :param write_to_stderr: a callable that will be called with chunks of data from stderr
        """
        self._write_to_stdout = write_to_stdout
        self._write_to_stderr = write_to_stderr

        super().__init__(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0, cwd=directory)

        self._stdout_queue = Queue()
        self._stdout_thread = Thread(target=RealTimeSubprocess._enqueue_output, args=(self.stdout, self._stdout_queue))
        self._stdout_thread.daemon = True
        self._stdout_thread.start()

        self._stderr_queue = Queue()
        self._stderr_thread = Thread(target=RealTimeSubprocess._enqueue_output, args=(self.stderr, self._stderr_queue))
        self._stderr_thread.daemon = True
        self._stderr_thread.start()

    @staticmethod
    def _enqueue_output(stream, queue):
        """
        Add chunks of data from a stream to a queue until the stream is empty.
        """
        for line in iter(lambda: stream.read(4096), b''):
            queue.put(line)
        stream.close()

    def wait_for_threads(self):
        self._stdout_thread.join()
        self._stderr_thread.join()

    def write_contents(self):
        """
        Write the available content from stdin and stderr where specified when the instance was created
        :return:
        """

        def read_all_from_queue(queue):
            res = b''
            size = queue.qsize()
            while size != 0:
                res += queue.get_nowait()
                size -= 1
            return res

        stdout_contents = read_all_from_queue(self._stdout_queue)
        if stdout_contents:
            self._write_to_stdout(stdout_contents)
        stderr_contents = read_all_from_queue(self._stderr_queue)
        if stderr_contents:
            self._write_to_stderr(stderr_contents)


class SacKernel(Kernel):
    implementation = 'jupyter_sac_kernel'
    implementation_version = '0.3'
    language = 'sac'
    language_version = '1.3.3'
    language_info = {'name': 'sac',
                     'mimetype': 'text/plain',
                     'file_extension': '.sac'}
    banner = "SaC kernel.\n" \
             "Uses sac2c, to incrementaly compile the notebook.\n"
    def __init__(self, *args, **kwargs):
        super(SacKernel, self).__init__(*args, **kwargs)
        self.files = []
        self.stmts = []
        self.uses = dict()
        self.uses["Array"] = "use Array: all;"
        self.imports = dict()
        self.typedefs = dict()
        self.funs = dict()
                # Make sure to do checks on array bounds as well
        self.sac2c_flags =  ['-v0', '-O0', '-noprelude', '-noinl', '-specmode', 'akd', '-check', 'tc']

        # get sac2c_p binary
        os.environ["PATH"] += "/usr/local/bin"
        self.sac2c_bin = shutil.which ('sac2c')
        if not self.sac2c_bin:
            raise RuntimeError ("Unable to find sac2c binary!")

        # find global lib directory (different depending on sac2c version)
        sac_path_proc = subprocess.run ([self.sac2c_bin, "-plibsac2c"], capture_output=True, text=True)
        sac_lib_path = sac_path_proc.stdout.strip(" \n")
        if "LD_LIBRARY_PATH" in os.environ:
            os.environ["LD_LIBRARY_PATH"] += sac_lib_path
        else:
            os.environ["LD_LIBRARY_PATH"] = sac_lib_path
        if "DYLD_LIBRARY_PATH" in os.environ:
            os.environ["DYLD_LIBRARY_PATH"] += sac_lib_path
        else:
            os.environ["DYLD_LIBRARY_PATH"] = sac_lib_path
        sac2c_so_name = find_library ('sac2c_p')
        if not sac2c_so_name:
            sac2c_so_name = find_library ('sac2c_p')
            if not sac2c_so_name:
                raise RuntimeError ("Unable to load sac2c shared library!")
        self.sac2c_so = path.join (sac_lib_path, sac2c_so_name)

        # get shared object
        self.sac2c_so_handle = ctypes.CDLL (self.sac2c_so, mode=(1|ctypes.RTLD_GLOBAL))

        # init sac2c jupyter interface
        self.sac2c_so_handle.jupyter_init ()
        self.sac2c_so_handle.CTFinitialize ()
        self.sac2c_so_handle.jupyter_parse_from_string.restype = ctypes.c_void_p
        self.sac2c_so_handle.jupyter_free.argtypes = ctypes.c_void_p,
        self.sac2c_so_handle.jupyter_free.res_rtype = ctypes.c_void_p

        # Creatae the directory where all the compilation/execution will be happening.
        self.tmpdir = tempfile.mkdtemp (prefix="jup-sac")

    def cleanup_files(self):
        """Remove all the temporary files created by the kernel"""
        for file in self.files:
            os.remove(file)

        # Remove the directory
        rm_nonempty_dir (self.tmpdir)

        # Call some cleanup functions in sac2c library.
        self.sac2c_so_handle.jupyter_finalize ()

    def check_sacprog_type (self, prog):
        s = ctypes.c_char_p (prog.encode ('utf-8'))
        ret_ptr = self.sac2c_so_handle.jupyter_parse_from_string (s, -1) #len (self.imports))
        ret_s = ctypes.cast (ret_ptr, ctypes.c_char_p).value
        self.sac2c_so_handle.jupyter_free (ret_ptr)
        j = {"status": "fail", "stderr": "cannot parse json: {}".format (ret_s)}
        try:
            j = json.loads (ret_s)
        except:
            pass
        return j

    def new_temp_file(self, **kwargs):
        """Create a new temp file to be deleted when the kernel shuts down"""
        # We don't want the file to be deleted when closed, but only when the kernel stops
        kwargs['delete'] = False
        kwargs['mode'] = 'w'
        kwargs['dir'] = self.tmpdir
        file = tempfile.NamedTemporaryFile(**kwargs)
        self.files.append(file.name)
        return file

    def _write_to_stdout(self, contents):
        self.send_response(self.iopub_socket, 'stream', {'name': 'stdout', 'text': contents})
    
    def _write_png_to_stdout(self, png):
        self.send_response(self.iopub_socket, 'stream', {'name': 'stdout', 'data': ('Plotting function')})
        # We prepare the response with our rich data (the plot).
        content = {'source': 'kernel',
            # This dictionary may contain different MIME representations of the output.
            'data': {'image/png': png},
            'metadata' : { 'image/png' : {'width': 600,'height': 400}}
        }
        # We send the display_data message with the contents.
        self.send_response(self.iopub_socket,'display_data', content)

    def _write_to_stderr(self, contents):
        self.send_response(self.iopub_socket, 'stream', {'name': 'stderr', 'text': contents})

    def create_jupyter_subprocess(self, cmd):
        return RealTimeSubprocess(cmd,
                                  lambda contents: self._write_to_stdout(contents.decode()),
                                  lambda contents: self._write_to_stderr(contents.decode()),
                                  self.tmpdir)

    def compile_with_sac2c(self, source_filename, binary_filename, extra_flags=[]):
        # Flags are of type list of strings.
        sac2cflags = self.sac2c_flags + extra_flags
        args = [self.sac2c_bin] + ['-o', binary_filename] + sac2cflags + [source_filename]
        return self.create_jupyter_subprocess(args)

    #     return magics
    def check_magics (self, code):
        # print (code.splitlines ())
        lines = code.splitlines ()
        if len (lines) < 1:
            return 0
        l = lines[0].strip ()
        if l == '%print':
            return self.mk_sacprg ("/* your expression  */", 1)
        elif l == '%plot':
            return plot(42)
        elif l == '%flags':
            return ' '.join (self.sac2c_flags)
        elif l.startswith ('%setflags'):
            nl = shlex.split (l[len ('%setflags'):])
            self.sac2c_flags = nl
            return "setting flags to: {}".format (nl)
        elif l == '%help':
            return """\
Currently the following commands are available:
    %print      -- print the current program including
                   imports, functions and statements in the main.
    %flags      -- print flags that are used when running sac2c.
    %setflags <flags>
                -- reset sac2c flags to <flags>
"""
        else:
            return None

    # Using matplotlib
    def plot(self, data):
        if importlib.util.find_spec('matplotlib') is None:
            self.write_to_stderr("Matplotlib lirary not found. Install to enjoy fancy graphics.")
            return {'status': 'error', 'execution_count': self.execution_count, 'payload': [],
                        'user_expressions': {}}
        else:
            plt.plot([5, 2, 9, 4, 7], [10, 5, 8, 4, 2])
            fig = plt.figure()
            return fig 

    def mk_sacprg (self, txt, r):

        stmts = "\n".join (self.stmts)

        funs = "\n\n".join (self.funs.values ())

        uses = "\n".join (self.uses.values ())

        imports = "\n".join (self.imports.values ())

        typedefs = "\n".join (self.typedefs.values ())

        if r == 1: # expr
            stmts += "\n    StdIO::print ({});\n".format (txt)

        elif r == 2: # stmt
            stmts += txt

        elif r == 3: # fundef
            funs += txt

        elif r == 4: # typedef
            typedefs += txt

        elif r == 5: # import
            imports += txt

        else: # use
            uses += txt


        prg = """\
// use
{}

// import
{}

// typedef
{}

// functions
{}

int main () {{
    // statements
{}
    return 0;
}}
"""
        p = prg.format (uses, imports, typedefs, funs, stmts)
        return p

    def do_execute(self, code, silent, store_history=True,
                   user_expressions=None, allow_stdin=False):

        if not silent:
            m = self.check_magics (code)
            if m is not None:
                self._write_to_stdout (m)
                return {'status': 'ok', 'execution_count': self.execution_count, 'payload': [],
                        'user_expressions': {}}


            r = self.check_sacprog_type (code)
            if r["status"] != "ok": # == -1:
                self._write_to_stderr(
                        "[SaC kernel] This is not an expression/statements/function or use/import/typedef\n"
                        + r["stderr"])
                return {'status': 'error', 'execution_count': self.execution_count, 'payload': [],
                        'user_expressions': {}}


            with self.new_temp_file(suffix='.sac') as source_file:
                source_file.write(self.mk_sacprg (code, r["ret"]))
                source_file.flush()
                with self.new_temp_file(suffix='.exe') as binary_file:
                    p = self.compile_with_sac2c(source_file.name, binary_file.name)
                    #, magics['cflags'], magics['ldflags'])
                    while p.poll() is None:
                        p.write_contents()
                    p.write_contents()
                    if p.returncode != 0:  # Compilation failed
                        self._write_to_stderr(
                                "[SaC kernel] sac2c exited with code {}, the executable will not be executed".format(
                                        p.returncode))
                        return {'status': 'error', 'execution_count': self.execution_count, 'payload': [],
                                'user_expressions': {}}

            p = self.create_jupyter_subprocess([binary_file.name]) # + magics['args'])
            while p.poll() is None:
                p.write_contents()

            p.wait_for_threads()
            p.write_contents()

            if p.returncode != 0:
                self._write_to_stderr("[SaC kernel] Executable exited with code {}".format(p.returncode))
                return {'status': 'error', 'execution_count': self.execution_count, 'payload': [],
                                'user_expressions': {}}
            else:
                if r["ret"] == 2: # stmts
                    self.stmts.append ("    "+code.replace ("\n", "\n    ")+"\n")
                elif r["ret"] == 3: # funs
                    self.funs[r["symbol"]] = code
                elif r["ret"] == 4: # typedef
                    self.typedefs[r["symbol"]] = code
                elif r["ret"] == 5: # import
                    self.imports[r["symbol"]] = code
                elif r["ret"] == 6: # use
                    self.uses[r["symbol"]] = code

        return {'status': 'ok', 'execution_count': self.execution_count, 'payload': [], 'user_expressions': {}}

    def do_shutdown(self, restart):
        """Cleanup the created source code files and executables when shutting down the kernel"""
        self.cleanup_files()


if __name__ == "__main__":
    from ipykernel.kernelapp import IPKernelApp
    IPKernelApp.launch_instance(kernel_class=SacKernel)
