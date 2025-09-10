import subprocess
import sys

# Groups to add user to
GROUPS = ["hz_users"]
PASSWORD = "Aa123456"

import subprocess
import sys

# Groups to add user to
GROUPS = ["hz_users"]
PASSWORD = "Aa123456"

def CreateDomainUser(username: str):
    """
    Creates a domain user with a fixed password, forces password change at first logon,
    adds the user to specified groups, and sets up their OWL directory with permissions.
    """
    try:
        # 1. Create the domain user
        print(f"[+] Attempting to create domain user: {username}")
        result = subprocess.run(
            ["net", "user", username, PASSWORD, "/add", "/domain", "/logonpasswordchg:yes"],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"[+] User creation successful: {result.stdout}")

        # 2. Add user to custom groups
        for group in GROUPS:
            print(f"[+] Adding user {username} to group: {group}")
            try:
                subprocess.run(
                    ["net", "group", group, username, "/add", "/domain"],
                    check=True,
                    capture_output=True,
                    text=True
                )
            except subprocess.CalledProcessError as group_error:
                print(f"[!] Warning: Failed to add user to group {group}: {group_error.stderr}")

        # 3. Create OWL folder + set ACL using PowerShell
        print(f"[+] Creating OWL folder for {username}")
        ps_script = f'''
            $path = "\\\\fileserver01\\owl\\{username}"
            if (-not (Test-Path $path)) {{
                New-Item -ItemType Directory -Path $path | Out-Null
            }}
            $Acl = Get-Acl $path
            $Ar = New-Object System.Security.AccessControl.FileSystemAccessRule("{username}", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow")
            $Acl.SetAccessRule($Ar)
            Set-Acl $path $Acl
        '''
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"[+] OWL directory created and permissions applied for {username}")

        return {
            "message": f"[+] המשתמש '{username}' נוצר בהצלחה.",
            "password": PASSWORD,
            "note": "User will be prompted to change password at first logon.",
            "groups": GROUPS,
            "owl_dir": f"\\\\fileserver01\\owl\\{username}"
        }

    except subprocess.CalledProcessError as e:
        error_message = e.stderr.strip() if e.stderr else (e.stdout.strip() if e.stdout else "")
        detailed_error = f"[-] בקשה נכשלה: {e.returncode}: {error_message}"
        return {"שגיאה": detailed_error}
    
    except Exception as e:
        return {"שגיאה": f"[-] שגיאה לא צפוייה: {str(e)}"}


def test_domain_connection():
    """
    Test if the machine is properly connected to a domain
    """
    try:
        result = subprocess.run(
            ["net", "user", "/domain"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        return True, "התחברות לדומיין הצליחה"
    except subprocess.CalledProcessError as e:
        return False, f"ההתחברות לדומיין נכשלה: {e.stderr if e.stderr else 'בעיה לא צפויה'}"
    except subprocess.TimeoutExpired:
        return False, "נסגרה התקשורת עם הדומיין"
    except Exception as e:
        return False, f"בעיה לא ידועה: {str(e)}"

def check_privileges():
    """
    Check if running with administrative privileges
    """
    try:
        # Try to run a command that requires admin privileges
        subprocess.run(
            ["net", "session"],
            check=True,
            shell=True,
            capture_output=True,
            text=True
        )
        return True, "יש הרשאות של מנהל"
    except subprocess.CalledProcessError:
        return False, "אין הרשאות מנהל - יש להריץ כאדמין"
    except Exception as e:
        return False, f"בעיה בבדיקת הרשאות: {str(e)}"

# Test functions
if __name__ == "__main__":
    print("Testing domain connection...")
    domain_ok, domain_msg = test_domain_connection()
    print(f"Domain test: {domain_msg}")
    
    print("\nTesting privileges...")
    priv_ok, priv_msg = check_privileges()
    print(f"Privilege test: {priv_msg}")
    
    if len(sys.argv) > 1:
        username = sys.argv[1]
        print(f"\nTesting user creation for: {username}")
        result = CreateDomainUser(username)
        print(f"Result: {result}")