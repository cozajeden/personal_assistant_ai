from langchain_core.tools import tool
import subprocess


@tool
def run_command(command: str) -> str:
    """Run a command in the console.
    Args:
        command: The command to run.
    Returns:
        The output of the command.
    """
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout