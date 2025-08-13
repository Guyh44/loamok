import os
from cryptography.fernet import Fernet
import time
import paramiko

KEY_PATH = r"C:\Users\Hamburg\Desktop\de.txt"

# this func returns the key from the file
def load_key():
    with open(KEY_PATH, "rb") as key_file:
        return key_file.read() 

# retuens the pass
def decrypt_password():

    # Load the encrypted password from environment variable
    enc_password = os.getenv("notSus")
    if not enc_password:
        raise ValueError("Environment variable notSus not set!")
    
    f = Fernet(load_key())
    decrypted = f.decrypt(enc_password.encode())
    return decrypted.decode()

def change_vlan(ip):
    # creats the ssh client
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    switch_password = decrypt_password()
    
    port = input("please select the switch interface (e.g: gi1/0/1): ")
    while True:
        vlan = input("Please select VLAN ID: ")
        if vlan in ('222', '404', '505'):
            break
        else:
            print("This VLAN is not allowed. Try again.")   

    try:
        client.connect(ip, username="root", password=switch_password, look_for_keys=False)
        shell = client.invoke_shell()
        commands = [
            'enable',
            'conf t',
            f'int {port}',
            f'sw acc vlan {vlan}',
            'exit',
            'exit',
            'wr'
        ]
        for command in commands:
            shell.send(command + '\n') # command + enter
            time.sleep(1)
        output = shell.recv(65535).decode()
        print("output:\n", output)
        print(f"change interface {port} to vlan {vlan}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")


def log_entries(ip):
    # creats the ssh client
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())


    switch_password = decrypt_password()
    
    num_lines = 10
    try:
        client.connect(ip, username="root", password=switch_password, look_for_keys=False)
        shell = client.invoke_shell()
        shell.send("terminal length 0\n")
        time.sleep(1)
        shell.send("show logging\n")
        time.sleep(2)

        output = shell.recv(65535).decode()

        # Filter for lines indicating port up/down state changes
        lines = output.splitlines()
        relevant = [line for line in lines if "changed state to" in line.lower()]
        for line in relevant[-num_lines:]:
            print(line)

        shell.send("show interfaces status\n") 
        time.sleep(1)
        output_int = shell.recv(65535).decode()

        print("\n--- Interface status ---\n")
        print(output_int)

        client.close()
    except Exception as e:
        print(f"Error: {e}")


def main():

    ip = input("please enter a switch ip addr: ")

    show_logs = input("Do you want to view the switch logs? (y/n): ")
    if show_logs.lower() == 'y':
        log_entries(ip)

    to_change_vlan = input("Do you want to change vlan? (y/n): ")
    if to_change_vlan.lower() == 'y':
        change_vlan(ip)

if __name__ == "__main__":
    main()
