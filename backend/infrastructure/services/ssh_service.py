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
                time.sleep(0.25)
                output += shell.recv(65535).decode()

            client.close()
            return output
            
        except Exception as e:
            print("error")
            return f"Error: {e}"


    def stream(self, ip, username):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(ip, username=username, password=self.password, look_for_keys=False)
        shell = client.invoke_shell()
        shell.settimeout(1)

        def generator():
            buffer = ""
            try:
                while True:
                    if shell.recv_ready():
                        data = shell.recv(4096).decode(errors="ignore")
                        buffer += data
                        while "\n" in buffer:
                            line, buffer = buffer.split("\n", 1)
                            yield line.strip()
                    time.sleep(0.2)
            finally:
                client.close()

        return shell, generator()