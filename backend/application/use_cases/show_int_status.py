from domain.entities.switch import Switch

class GetIntStatusCase:

    def __init__(self, ssh_service, switch: Switch):
        self.ssh = ssh_service
        self.switch = switch

    def get_ports(self):
        # Try default command
        commands = ["terminal length 0", "show int status"]
        output = self.ssh.run_commands(
            ip=self.switch.ip,
            username=self.switch.username,
            commands=commands
        )

        # Detect invalid input (switch does not support this command)
        if "% Invalid input" in output or "^" in output:
            commands = ["terminal length 0", "show interfaces description"]
            output = self.ssh.run_commands(
                ip=self.switch.ip,
                username=self.switch.username,
                commands=commands
            )
            description = True
        else:
            description = False

        # Parse ports
        ports = self._parse_ports(output, description=description)

        # Filter out ap/te ports
        if description:
            filtered_ports = [p for p in ports if not p[0].lower().startswith(("ap", "te"))]
        else:
            filtered_ports = [p for p in ports if not p.lower().startswith(("ap", "te"))]

        return filtered_ports

    def _parse_ports(self, output, description=False):
        ports = []
        for line in output.splitlines():
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Skip headers or prompts
            if line.lower().startswith(("port", "interface", "status", "vlan", "duplex", "speed", "type", "protocol", "description")):
                continue
            if "#" in line or line.lower().startswith(self.switch.ip.lower()):
                continue

            parts = line.split()
            if not parts:
                continue

            port_name = parts[0]

            if description:
                # Join everything after Status and Protocol as description
                if len(parts) >= 4:
                    desc = " ".join(parts[3:])
                else:
                    desc = ""
                ports.append((port_name, desc))
            else:
                ports.append(port_name)

        return ports
