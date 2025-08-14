import paramiko
import time

class SSHService:
    def __init__(self, password):
        self.password = password

    def run_commands(self, ip, username, commands):

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            client.connect(ip, username=username, password=self.password, look_for_keys=False)
            shell = client.invoke_shell()
            output = ""

            for command in commands:
                shell.send(command + '\n')
                time.sleep(1)
                output += shell.recv(65535).decode()

            client.close()
            return output
            
        except Exception as e:
            print("error")
            return f"Error: {e}"



