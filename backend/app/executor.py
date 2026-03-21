import subprocess
import uuid
import os
import time

TEMP_DIR = "temp_code"

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

def execute_python(code: str, test_input: str):
    file_name = f"{uuid.uuid4().hex}.py"
    file_path = os.path.join(TEMP_DIR, file_name)

    with open(file_path, "w") as f:
        f.write(code)

    start_time = time.time()

    try:
        result = subprocess.run(
            ["python3", file_path],
            input=test_input,
            capture_output=True,
            text=True,
            timeout=5
        )

        execution_time = time.time() - start_time

        return {
            "output": result.stdout,
            "error": result.stderr,
            "execution_time": execution_time,
            "status": "success"
        }

    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": "Execution timed out",
            "execution_time": 5,
            "status": "timeout"
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)