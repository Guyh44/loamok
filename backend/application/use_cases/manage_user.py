import subprocess
import re

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

def parse_user_info(raw_output: str):
    """Extract groups, last logon, and password expiry from net user output"""
    parsed = {"groups": [], "last_logon": None, "password_expires": None}

    for line in raw_output.splitlines():
        line = line.strip()

        # Last logon
        if line.lower().startswith("last logon"):
            parsed["last_logon"] = line.split(None, 2)[-1]

        # Password expires
        elif line.lower().startswith("password expires"):
            parsed["password_expires"] = line.split(None, 2)[-1]

        # Group memberships (can wrap to multiple lines)
        elif line.lower().startswith("local group memberships") or line.lower().startswith("global group memberships"):
            groups = line.split(None, 3)[-1]
            parsed["groups"].extend(groups.split())

        elif parsed["groups"] and not line.lower().startswith("the command completed"):
            # continuation of groups on the next line(s)
            parsed["groups"].extend(line.split())

    return parsed

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

    result = run_command(cmd)

    # Parse info output
    if action == "info" and result.get("success"):
        result["parsed_info"] = parse_user_info(result["output"])

    return result
