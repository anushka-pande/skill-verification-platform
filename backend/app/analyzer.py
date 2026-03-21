import ast

def analyze_code(code: str):
    tree = ast.parse(code)

    # Code length
    lines = len(code.split("\n"))

    # Count functions
    functions = len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)])

    # Count loops
    loops = len([node for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While))])

    # Unused imports (basic detection)
    imports = [node.names[0].name for node in ast.walk(tree) if isinstance(node, ast.Import)]

    return {
        "line_count": lines,
        "function_count": functions,
        "loop_count": loops,
        "imports": imports
    }