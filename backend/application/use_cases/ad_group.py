import subprocess
import json
import re

def add_user_to_group(username: str, groupname: str):
    # Validate input
    if not username or not groupname or \
       not re.fullmatch(r'[A-Za-z_\- .]+', username) or \
       not re.fullmatch(r'[A-Za-z_\- .]+', groupname):
        raise ValueError("Invalid username or groupname. Allowed: letters, _, -, space, .")

    # the actual adding to AD group script
    # returns a josn of status and message
    ps_command = f'''
    Import-Module ActiveDirectory
    try {{
        $user = Get-ADUser -Identity "{username}" -ErrorAction Stop
        $group = Get-ADGroup -Identity "{groupname}" -ErrorAction Stop

        if (Get-ADGroupMember -Identity "{groupname}" | Where-Object {{ $_.SamAccountName -eq "{username}" }}) {{
            throw "User '{username}' is already a member of group '{groupname}'."
        }}

        Add-ADGroupMember -Identity "{groupname}" -Members "{username}" -ErrorAction Stop
        $result = @{{
            status = "success"
            message = "User '{username}' has been added to group '{groupname}' successfully."
        }}
        $result | ConvertTo-Json
    }} catch {{
        $result = @{{
            status = "error"
            message = $_.Exception.Message
        }}
        $result | ConvertTo-Json
    }}
    '''

    result = subprocess.run(
        ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_command],
        capture_output=True,
        text=True
    )

    # Parse PowerShell JSON and raise if error
    if result.stdout.strip():
        try:
            data = json.loads(result.stdout.strip())
            if data.get("status") == "error":
                raise RuntimeError(data["message"])
            return data
        except json.JSONDecodeError:
            pass

    # Fallback if PowerShell failed without JSON
    if result.returncode != 0:
        raise RuntimeError(f"PowerShell failed: {result.stderr.strip()} | Output: {result.stdout.strip()}")
    return {"status": "success", "message": result.stdout.strip()}