import re
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

        # Detect invalid input (switch does not support this command)
        if "% Invalid input" in output or "^" in output:
            commands = ["terminal length 0", "show interfaces description"]
            output = self.ssh.run_commands(
                ip=self.switch.ip,
                username=self.switch.username,
                commands=commands
            )
        
        lines = output.splitlines()
        if not lines:
            return output

        # Find the header line that contains the expected columns
        header_idx = None
        for i, line in enumerate(lines):
            if ("Port" in line and "Status" in line and "Vlan" in line and "Duplex" in line and "Speed" in line):
                header_idx = i
                break

        if header_idx is None:
            # No recognizable header; return as-is
            return output

        header = lines[header_idx]

        # Column starts based on non-space runs in the header
        starts = [m.start() for m in re.finditer(r'\S+', header)]
        titles = [header[s:e].strip() for s, e in zip(starts, starts[1:] + [len(header)])]

        # Build (start, end) for each column; last column ends at None (EOL)
        col_bounds = []
        for idx, s in enumerate(starts):
            e = starts[idx + 1] if idx + 1 < len(starts) else None  # None => to end-of-line
            col_bounds.append((s, e))

        # Locate the "Name" column
        try:
            name_col_idx = [t.lower() for t in titles].index("name")
        except ValueError:
            # No Name column; nothing to remove
            return output

        # Function to remove the slice of the Name column from a single line
        def cut_name_column(line: str) -> str:
            pieces = []
            for idx, (s, e) in enumerate(col_bounds):
                if idx == name_col_idx:
                    continue  # skip Name
                if e is None:
                    pieces.append(line[s:])    # to end of line
                else:
                    # Guard for shorter lines
                    if s >= len(line):
                        segment = ""
                    else:
                        segment = line[s:e if e <= len(line) else len(line)]
                    pieces.append(segment)
            return "".join(pieces).rstrip()

        # Process header + all following data lines; keep any preamble above header untouched
        before = lines[:header_idx]
        after = [cut_name_column(l) for l in lines[header_idx:]]

        cleaned = before + after
        return "\n".join(cleaned)
    
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
