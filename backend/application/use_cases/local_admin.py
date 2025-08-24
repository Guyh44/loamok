from domain.entities.user import User
from domain.entities.computer import Computer
import win32net
import socket
import ping3

class LocalAdmin:

    def __init__(self):
        pass

    def add_user_to_admins(self, user: User, computer: Computer):
        """
        Adds a domain user to the local Administrators group of a computer
        """
        domain_user = f"casa\\{user.username}"

        try:
            # First, check if computer is reachable
            if not self._is_computer_reachable(computer.computername):
                return f"[-] שם המחשב '{computer.computername}' לא נגיש. בדוק אם השם נכון או שהמחשב כבוי."

            # Check if computer exists in domain/network
            try:
                socket.gethostbyname(computer.computername)
            except socket.gaierror:
                return f"[-] שם המחשב '{computer.computername}' לא נגיש. בדוק אם השם נכון או שהמחשב כבוי."

            # Get local Administrators group info
            try:
                group_info = win32net.NetLocalGroupGetMembers(
                    computer.computername,
                    "Administrators",
                    2
                )
            except Exception as e:
                error_code = getattr(e, 'winerror', None)
                if error_code == 5:  # Access Denied
                    return f"[-] אין לך הרשאות לשנות את קבוצת המנהלים של מחשב:  '{computer.computername}'."
                elif error_code == 53:  # Network path not found
                    return f"[-] המחשב: '{computer.computername}' לא נגיש רשתית."
                elif error_code == 2:  # System cannot find the file specified
                    return f"[-] המחשב: '{computer.computername}' לא נמצא או לא נגיש."
                else:
                    return f"[-] לא היה ניתן לגשת למחשב:  '{computer.computername}': {str(e)}"

            # Check if already a member
            for member in group_info[0]:
                if member['domainandname'].lower() == domain_user.lower():
                    return f"[!] {domain_user} כבר מנהל על מחשב: {computer.computername}."

            # Add user
            user_info = {'domainandname': domain_user}
            try:
                win32net.NetLocalGroupAddMembers(
                    computer.computername,
                    "Administrators",
                    3,
                    [user_info]
                )
            except Exception as e:
                error_code = getattr(e, 'winerror', None)
                if error_code == 1317:  # User does not exist
                    return f"[-] המשתמש: '{user.username}' לא קיים על הדומיין 'casa'."
                elif error_code == 1378:  # Member already exists
                    return f"[!] {domain_user} כבר מנהל של מחשב:  {computer.computername}."
                elif error_code == 5:  # Access Denied
                    return f"[-] גישה נכשלה, אין לך הרשאות להוסיף מנהל למחשב:  '{computer.computername}'."
                else:
                    return f"[-] לא ניתן להוסיף משתמש: {str(e)}"

            return f"[+] {domain_user} מנהל של: {computer.computername}."

        except Exception as e:
            return f"[-] שגיאה: {str(e)}"

    def _is_computer_reachable(self, computer_name: str, timeout: int = 3) -> bool:
        """
        Check if computer is reachable via ping
        """
        try:
            # Try to ping the computer
            result = ping3.ping(computer_name, timeout=timeout)
            return result is not None
        except Exception:
            # If ping3 fails, try a basic socket connection
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(timeout)
                result = sock.connect_ex((computer_name, 445))  # Try SMB port
                sock.close()
                return result == 0
            except Exception:
                return False