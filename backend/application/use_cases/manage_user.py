import subprocess


def run_command(cmd):
    """Run a command via subprocess and print output or error."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(f"Error: {result.stderr.strip()}")
    except Exception as e:
        print(f"Exception: {e}")

def unlock_user(username):
    """Unlock a locked domain user account."""
    cmd = f'net user "{username}" /unlock /domain'
    run_command(cmd)
    print(f"{username} unlocked (if it was locked).")

def reset_password(username):
    """Reset password for a domain user."""
    new_password = "Aa123456"
    cmd = f'net user "{username}" "{new_password}" /domain'
    run_command(cmd)
    print(f"{username} password reset.")

def disable_user(username):
    """Disable a domain user account."""
    cmd = f'net user "{username}" /ACTIVE:NO /domain'
    run_command(cmd)
    print(f"{username} disabled.")

def enable_user(username):
    """Enable a domain user account."""
    cmd = f'net user "{username}" /ACTIVE:YES /domain'
    run_command(cmd)
    print(f"{username} enabled.")

def user_info(username):
    """Show domain user info."""
    cmd = f'net user "{username}" /domain'
    run_command(cmd)

def main():
    username = input("Enter domain username to manage: ")

    while True:
        print("\nChoose an action:")
        print("1. Unlock account")
        print("2. Reset password")
        print("3. Disable account")
        print("4. Enable account")
        print("5. Show user info")
        print("6. Exit")

        choice = input("Enter choice (1-6): ")

        if choice == "1":
            unlock_user(username)
        elif choice == "2":
            reset_password(username)
        elif choice == "3":
            disable_user(username)
        elif choice == "4":
            enable_user(username)
        elif choice == "5":
            user_info(username)
        elif choice == "6":
            break
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
