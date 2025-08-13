from infrastructure.services.password_service import PasswordService
from infrastructure.services.ssh_service import SSHService
from domain.entities.switch import Switch
from application.use_cases.change_vlan import ChangeVlanUseCase
from application.use_cases.show_logs import GetLogsUseCase
from application.use_cases.show_int_status import GetIntStatusCase

KEY_PATH = r"C:\Users\Hamburg\Desktop\de.txt"

pwd = PasswordService(KEY_PATH).decrypt_password()

ip = input("enter switch IP: ")
sw = Switch(ip, username="root")

ssh = SSHService(password=pwd)


show_logs = GetLogsUseCase(ssh, sw)
print(f"\n ----------- showing last up/down ports ----------- \n + {show_logs.execute(num_lines=10)}")

show_int_status = GetIntStatusCase(ssh, sw)
print(f"\n ----------- showing int status ----------- \n + {show_int_status.execute()}")

port = input("enter a switch port (e.g - gi1/0/1): ")
vlan = input("enter a vlan ID: ")
change_vlan = ChangeVlanUseCase(ssh, sw)
print(change_vlan.execute(port, vlan))


