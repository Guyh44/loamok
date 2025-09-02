import subprocess

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
        subprocess.run(
            ["net", "user", username, PASSWORD, "/add", "/domain", "/logonpasswordchg:yes"],
            check=True,
            shell=True
        )

        # 2. Add user to custom groups
        for group in GROUPS:
            subprocess.run(
                ["net", "group", group, username, "/add", "/domain"],
                check=True,
                shell=True
            )

        return {
            "message": f"Domain user '{username}' created and added to groups {GROUPS}.",
            "password": PASSWORD,
            "note": "User will be prompted to change password at first logon."
        }

    except subprocess.CalledProcessError as e:
        return {"error": str(e)}
