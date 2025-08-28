import re
from domain.entities.switch import Switch

class TerMonUseCase:
    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def stream(self):
        shell, generator = self.ssh.stream(self.switch.ip, self.switch.username)

        # send terminal monitor setup
        shell.send("enable\n")
        shell.send("ter mon\n")

        yield b"Starting terminal monitoring...\n"   # changed to bytes
        for line in generator:
            line = line.strip()
            # skip CLI echoes
            if line.endswith("#"):
                continue

            # skip login messages
            if "LOGIN_SUCCESS" in line:
                continue

            # match interface up/down messages
            m = re.search(r"(\*.+?): %\w+-\d+-UPDOWN: (Interface .+)", line)
            if m:
                timestamp, message = m.groups()
                yield f"{timestamp} {message}\n".encode()
            else:
                yield (line + "\n").encode()