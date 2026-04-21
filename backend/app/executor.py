import subprocess
import tempfile
import time
import os

def docker_run(cmd, test_input):
  try:
    start = time.time()

    process = subprocess.run(
      cmd,
      input=test_input,
      text=True,
      capture_output=True,
      timeout=3
    )

    end = time.time()

    return {
      "output": process.stdout.strip(),
      "error": process.stderr.strip(),
      "execution_time": end - start
    }

  except subprocess.TimeoutExpired:
    return {
      "error": "Execution timed out",
      "execution_time": 3
    }

def execute_python(code: str, test_input: str):
  with tempfile.TemporaryDirectory() as temp_dir:

    file_path = os.path.join(temp_dir, "main.py")

    with open(file_path, "w") as f:
      f.write(code)

    cmd = [
      "docker", "run", "--rm",
      "-i",
      "--network", "none",
      "--memory", "256m",
      "--cpus", "1",
      "-v", f"{temp_dir}:/app",
      "python:3.11",
      "python", "/app/main.py"
    ]

    return docker_run(cmd, test_input)

def execute_cpp(code: str, test_input: str):
  with tempfile.TemporaryDirectory() as temp_dir:

    cpp_path = os.path.join(temp_dir, "main.cpp")

    with open(cpp_path, "w") as f:
      f.write(code)

    cmd = [
      "docker", "run", "--rm",
      "-i",
      "--network", "none",
      "--memory", "256m",
      "--cpus", "1",
      "-v", f"{temp_dir}:/app",
      "gcc:latest",
      "bash", "-c",
      "g++ /app/main.cpp -o /app/main && /app/main"
    ]

    return docker_run(cmd, test_input)
    
def execute_c(code: str, test_input: str):
  with tempfile.TemporaryDirectory() as temp_dir:

    c_path = os.path.join(temp_dir, "main.c")

    with open(c_path, "w") as f:
      f.write(code)

    cmd = [
      "docker", "run", "--rm",
      "-i",
      "--network", "none",
      "--memory", "256m",
      "--cpus", "1",
      "-v", f"{temp_dir}:/app",
      "gcc:latest",
      "bash", "-c",
      "gcc /app/main.c -o /app/main && /app/main"
    ]

    return docker_run(cmd, test_input)
    
def execute_js(code: str, test_input: str):
  with tempfile.TemporaryDirectory() as temp_dir:

    js_path = os.path.join(temp_dir, "main.js")

    with open(js_path, "w") as f:
      f.write(code)

    cmd = [
      "docker", "run", "--rm",
      "-i",
      "--network", "none",
      "--memory", "256m",
      "--cpus", "1",
      "-v", f"{temp_dir}:/app",
      "node:20",
      "node", "/app/main.js"
    ]

    return docker_run(cmd, test_input)
  
def execute_java(code: str, test_input: str):
  with tempfile.TemporaryDirectory() as temp_dir:

    file_path = os.path.join(temp_dir, "Main.java")

    with open(file_path, "w") as f:
      f.write(code)

    cmd = [
      "docker", "run", "--rm",
      "-i",
      "--network", "none",
      "--memory", "512m",
      "--cpus", "1",
      "-v", f"{temp_dir}:/app",
      "eclipse-temurin:17",
      "bash", "-c",
      "javac /app/Main.java && java -cp /app Main"
    ]

    return docker_run(cmd, test_input)
    
def execute_code(code: str, test_input: str, language: str):
  if language == "python":
    return execute_python(code, test_input)

  elif language == "cpp":
    return execute_cpp(code, test_input)

  elif language == "c":
    return execute_c(code, test_input)

  elif language == "javascript":
    return execute_js(code, test_input)

  elif language == "java":
    return execute_java(code, test_input)

  else:
    return {"error": f"Unsupported language: {language}"}