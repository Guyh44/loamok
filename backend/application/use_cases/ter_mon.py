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

        yield "Starting terminal monitoring...\n"
        yield from generator
