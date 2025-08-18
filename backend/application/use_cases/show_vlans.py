from domain.entities.switch import Switch


class GetVlansCase:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def get_vlans(self):
        output = self.ssh.run_commands(
            ip=self.switch.ip,
            username=self.switch.username,
            commands=[
                "terminal length 0", 
                "show vlan brief"
            ]
        )

        print(output)
        vlans = self._parse_vlans(output)
        print(vlans)
        return vlans

    def _parse_vlans(self, output):
        vlan_list = []
        for line in output.splitlines():
            line = line.strip()
            if not line or line.lower().startswith(("vlan", "name", "----")):
                continue

            parts = line.split()
            first = parts[0]

            # Handle VLAN lines like "200", "*200", "404"
            vlan_id = first.lstrip("*")
            if vlan_id.isdigit():
                vlan_list.append(vlan_id)

        return vlan_list

