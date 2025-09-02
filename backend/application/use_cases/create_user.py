import subprocess

# Get username from input
username = input("Enter the new domain username: ")

# Password
password = "Aa123456"

# Groups to add user to
groups = ["hz_users"] 

try:
    # 1. Create domain user
    subprocess.run(
        ["net", "user", username, password, "/add", "/domain", "/logonpasswordchg:yes"],
        check=True,
        shell=True
    )
    print(f"Domain user '{username}' created.")

    # 2. Add user to groups
    for group in groups:
        subprocess.run(
            ["net", "group", group, username, "/add", "/domain"],
            check=True,
            shell=True
        )
        print(f"Added '{username}' to group '{group}'.")

    print(f"User '{username}' is ready and will be prompted to change password at first logon.")

except subprocess.CalledProcessError as e:
    print(f"Error: {e}")
