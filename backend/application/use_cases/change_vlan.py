from domain.entities.switch import Switch

class ChangeVlanUseCase:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def execute(self, port, vlan):
        if not self.switch.is_vlan_allowed(vlan):
            raise ValueError(f"VLAN {vlan} is not allowed. Allowed VLANs: {self.switch.ALLOWED_VLANS}")
         
        commands = [
            'enable',
            'conf t',
            f'int {port}',
            f'sw acc vlan {vlan}',
            'exit',
            'exit',
            'wr'
        ]
        return self.ssh.run_commands(self.switch.ip, username=self.switch.username, commands=commands)
