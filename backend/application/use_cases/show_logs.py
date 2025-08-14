from domain.entities.switch import Switch

class GetLogsUseCase:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def execute(self, num_lines=10):
        output = self.ssh.run_commands(
            ip=self.switch.ip,
            username=self.switch.username,
            commands=[
                "terminal length 0",
                "show logging"
            ]
        )

        lines = output.splitlines()

        relevant = [
            line for line in lines
            if any(keyword in line.lower() for keyword in [
                "changed state to",  # 
                "%link-",            # those 3 are for the different typs of switchs each have differnt word to it
                "%lineproto-"        # 
            ])
        ]

        return "\n".join(relevant[-num_lines:]) if relevant else "No recent up/down events found"
