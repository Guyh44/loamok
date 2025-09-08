import subprocess

# Define the default password for reset
DEFAULT_PASSWORD = "Aa123456"

def run_command(cmd):
    """Run a subprocess command and return output or error"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            return {"success": True, "output": result.stdout.strip()}
        else:
            return {"success": False, "error": result.stderr.strip()}
    except Exception as e:
        return {"success": False, "error": str(e)}

def manage_user(username: str, action: str):
    """Perform domain user actions: unlock, enable, disable, reset password, info"""
    if action == "disable":
        cmd = f'net user "{username}" /ACTIVE:NO /domain'
    elif action == "enable":
        cmd = f'net user "{username}" /ACTIVE:YES /domain'
    elif action == "reset_password":
        cmd = f'net user "{username}" "{DEFAULT_PASSWORD}" /domain'
    elif action == "info":
        cmd = f'net user "{username}" /domain'
    else:
        return {"success": False, "error": "Invalid action"}

    return run_command(cmd)
