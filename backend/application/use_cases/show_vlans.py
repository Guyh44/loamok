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
        if "% Invalid input" in output or "^" in output:
            commands = ["terminal length 0", "show run | inc bridge-domain"]
            output = self.ssh.run_commands(
                ip=self.switch.ip,
                username=self.switch.username,
                commands=commands
            )
        print(output)
        vlans = self._parse_vlans(output)
        print(vlans)
        return vlans

    def _parse_vlans(self, output):
        vlan_list = []

        for line in output.splitlines():
            line = line.strip()
            if not line:
                continue

            # Case 1: "show vlan brief" output
            if line[0].isdigit() or line.startswith("*"):
                parts = line.split()
                vlan_id = parts[0].lstrip("*")
                if vlan_id.isdigit():
                    vlan_list.append(vlan_id)

            # Case 2: "bridge-domain <id>"
            elif line.lower().startswith("bridge-domain"):
                parts = line.split()
                if len(parts) >= 2 and parts[1].isdigit():
                    vlan_list.append(parts[1])

        # make unique while preserving order
        unique_vlans = list(dict.fromkeys(vlan_list))

        return unique_vlans


