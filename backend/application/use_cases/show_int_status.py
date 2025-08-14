from domain.entities.switch import Switch

class GetIntStatusCase:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def execute(self):
        
        output = self.ssh.run_commands(
            ip=self.switch.ip,
            username=self.switch.username,
            commands=[
                "terminal length 0",
                "show int status"
            ]
        )
        return output
