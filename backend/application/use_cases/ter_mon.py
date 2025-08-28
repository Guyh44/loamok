import re
from datetime import datetime
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

        yield b"Starting terminal monitoring...\n"
        
        for line in generator:
            line = line.strip()
            
            # skip CLI echoes and prompts
            if line.endswith("#") or not line:
                continue

            # skip login messages
            if "LOGIN_SUCCESS" in line:
                continue
            
            updown_match = re.search(r"\*(\w+\s+\d+\s+[\d:.]+).*?Interface\s+(\S+).*?changed\s+state\s+to\s+(\w+)", line)
            
            if updown_match:
                timestamp_str, interface, state = updown_match.groups()
                
                # Parse the timestamp and convert to desired format
                try:
                    current_year = datetime.now().year
                    timestamp_full = f"{current_year} {timestamp_str}"
                    parsed_time = datetime.strptime(timestamp_full.split('.')[0], "%Y %b %d %H:%M:%S")
                    formatted_time = parsed_time.strftime("%d/%m/%y - %H:%M")
                except ValueError:
                    # Fallback to current time if parsing fails
                    formatted_time = datetime.now().strftime("%d/%m/%y - %H:%M")
                
                # Determine arrow based on state
                if state.lower() == "up":
                    arrow = "⬆"  # Green up arrow
                    state_color = "up"
                else:
                    arrow = "⬇"  # Red down arrow  
                    state_color = "down"
                
                # Format: 28/8/25 - 12:15 - GigabitEthernet1/0/18 - ↗️
                formatted_output = f"{formatted_time} - {interface} - {arrow}|{state_color}\n"
                yield formatted_output.encode()
            else:
                # For any other relevant logs, just pass them through simplified
                if any(keyword in line.upper() for keyword in ["ERROR", "FAIL", "WARN"]):
                    simplified_line = f"{datetime.now().strftime('%d/%m/%y - %H:%M')} - {line}\n"
                    yield simplified_line.encode()