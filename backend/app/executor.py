import subprocess
import uuid
import os
import time

TEMP_DIR = "temp_code"

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

def execute_python(code: str, test_input: str, function_name):
    import subprocess
    import tempfile
    import time

    try:
        wrapped_code = f"""
{code}

input_data = input()

try:
    result = {function_name}(input_data)
    print(result)
except Exception as e:
    print("ERROR:", e)
"""

        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as temp:
            temp.write(wrapped_code.encode())
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