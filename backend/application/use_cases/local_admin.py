from domain.entities.user import User
from domain.entities.computer import Computer
import win32net

class LocalAdmin:

    def __init__(self):
        pass

    def add_user_to_admins(self, user: User, computer: Computer):
        """
        Adds a domain user to the local Administrators group of a computer
        """
        domain_user = f"casa\\{user.username}"

        try:
            # Get local Administrators group info
            group_info = win32net.NetLocalGroupGetMembers(
                computer.computername,
                "Administrators",
                2
            )

            # Check if already a member
            for member in group_info[0]:
                if member['domainandname'].lower() == domain_user.lower():
                    return f"[!] {domain_user} is already an admin on {computer.computername}."

            # Add user
            user_info = {'domainandname': domain_user}
            win32net.NetLocalGroupAddMembers(
                computer.computername,
                "Administrators",
                3,
                [user_info]
            )

            return f"[+] {domain_user} is now admin on {computer.computername}."

        except Exception as e:
            return f"[-] Something went wrong: {str(e)}"

