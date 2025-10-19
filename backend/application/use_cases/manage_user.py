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
    
    in_groups_section = False
    
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
            in_groups_section = True
            # Extract groups from this line
            parts = re.split(r'\s{2,}', line)  # Split on 2+ spaces
            if len(parts) > 1:
                # Skip the label part and get the groups
                groups_text = ' '.join(parts[1:])
                # Split groups by asterisk (group separator in net user output)
                groups = [g.strip() for g in groups_text.split('*') if g.strip()]
                parsed["groups"].extend(groups)
        
        elif in_groups_section and line and not line.lower().startswith("the command completed"):
            # Continuation line with more groups
            groups = [g.strip() for g in line.split('*') if g.strip()]
            parsed["groups"].extend(groups)
        
        elif line.lower().startswith("the command completed"):
            in_groups_section = False

    return parsed

def manage_user(username: str, action: str):
    """Perform domain user actions: unlock, enable, reset password, info"""
    if action == "unlock":
        cmd = f'powershell -Command "Unlock-ADAccount -Identity \'{username}\'"'
    elif action == "enable":
        cmd = f'net user "{username}" /ACTIVE:YES /domain'
    elif action == "reset_password":
        cmd = f'net user "{username}" "{DEFAULT_PASSWORD}" /domain /LOGONPASSWORDCHG:YES'
    elif action == "info":
        cmd = f'net user "{username}" /domain'
    else:
        return {"success": False, "error": "Invalid action"}

    result = run_command(cmd)

    # Parse info output
    if action == "info" and result.get("success"):
        result["parsed_info"] = parse_user_info(result["output"])

    return result