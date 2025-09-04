from domain.entities.switch import Switch

class PortState:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def shut(self, port):
        commands = [
            'enable',
            'conf t',
            f'int {port}',
            'sh',
            'exit',
            'exit',
            'wr'
        ]
        return self.ssh.run_commands(self.switch.ip, username=self.switch.username, commands=commands)

    def noShut(self, port):            
        commands = [
            'enable',
            'conf t',
            f'int {port}',
            'no sh',
            'exit',
            'exit',
            'wr'
        ]
        return self.ssh.run_commands(self.switch.ip, username=self.switch.username, commands=commands)