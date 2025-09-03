import subprocess
import sys

# Groups to add user to
GROUPS = ["hz_users"]
PASSWORD = "Aa123456"

def CreateDomainUser(username: str):
    """
    Creates a domain user with a fixed password, forces password change at first logon,
    and adds the user to specified groups.
    """
    try:
        # 1. Create the domain user
        print(f"[+] Attempting to create domain user: {username}")
        result = subprocess.run(
            ["net", "user", username, PASSWORD, "/add", "/domain", "/logonpasswordchg:yes"],
            check=True,
            shell=True,
            capture_output=True,
            text=True
        )
        print(f"[+] User creation successful: {result.stdout}")

        # 2. Add user to custom groups
        for group in GROUPS:
            print(f"[+] Adding user {username} to group: {group}")
            try:
                group_result = subprocess.run(
                    ["net", "group", group, username, "/add", "/domain"],
                    check=True,
                    shell=True,
                    capture_output=True,
                    text=True
                )
            except subprocess.CalledProcessError as group_error:
                print(f"[!] Warning: Failed to add user to group {group}: {group_error.stderr}")
                # Don't fail the entire operation if group addition fails

        return {
            "message": f"[+] המשתמש '{username}' נוצר בהצלחה.",
            "password": PASSWORD,
            "note": "User will be prompted to change password at first logon.",
            "groups": GROUPS
        }

    except subprocess.CalledProcessError as e:
        error_message = ""
        
        # Get detailed error information
        if e.stderr:
            error_message = e.stderr.strip()
        elif e.stdout:
            error_message = e.stdout.strip()
        
        # Common error interpretations
        if e.returncode == 2:
            if "already exists" in error_message.lower():
                detailed_error = f"[-] המשתמש '{username}' כבר קיים בדומיין"
            elif "not found" in error_message.lower():
                detailed_error = f"[-] Domain controller not found or machine not joined to domain"
            elif "access is denied" in error_message.lower():
                detailed_error = f"[-] גישה נדחתה - אין הרשאות ליצור משתמש דומייני נסו להריץ כמנהל"
            else:
                detailed_error = f"[-] נכשל ליצור משתמש דומייני: {error_message}"
        else:
            detailed_error = f"[-] בקשה נכשלה:  {e.returncode}: {error_message}"
        
        return {"שגיאה": detailed_error}
    
    except Exception as e:
        error_msg = f"[-] שגיאה לא צפוייה: {str(e)}"
        return {"שגיאה": error_msg}

def test_domain_connection():
    """
    Test if the machine is properly connected to a domain
    """
    try:
        result = subprocess.run(
            ["net", "user", "/domain"],
            check=True,
            shell=True,
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