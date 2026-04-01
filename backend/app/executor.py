import subprocess
import tempfile
import time
import os


def execute_python(code: str, test_input: str):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as temp:
            temp.write(code.encode())
            temp_path = temp.name

        start = time.time()

        process = subprocess.run(
            ["python3", temp_path],
            input=test_input,
            text=True,
            capture_output=True,
            timeout=2
        )

        end = time.time()

        return {
            "output": process.stdout.strip(),
            "error": process.stderr.strip(),
            "execution_time": end - start
        }

    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}


def execute_cpp(code: str, test_input: str):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as temp:
            temp.write(code.encode())
            cpp_path = temp.name

        exe_path = cpp_path.replace(".cpp", "")

        # Compile
        compile_process = subprocess.run(
            ["g++", cpp_path, "-o", exe_path],
            capture_output=True,
            text=True
        )

        if compile_process.returncode != 0:
            return {"error": compile_process.stderr}

        # Run
        start = time.time()

        run_process = subprocess.run(
            exe_path,
            input=test_input,
            text=True,
            capture_output=True,
            timeout=2,
            shell=True
        )

        end = time.time()

        return {
            "output": run_process.stdout.strip(),
            "error": run_process.stderr.strip(),
            "execution_time": end - start
        }

    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}
    
def execute_code(code: str, test_input: str, language: str):
    if language == "python":
        return execute_python(code, test_input)

    elif language == "cpp":
        return execute_cpp(code, test_input)

    else:
        return {"error": f"Unsupported language: {language}"}