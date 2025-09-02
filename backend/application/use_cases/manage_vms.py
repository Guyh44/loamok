import requests

# --- Configuration ---
VCENTER = "https://mgmtvc.casa.net"
USERNAME = "Hamburg"
PASSWORD = "Wasdqe123"

# Disable SSL warnings for testing only
requests.packages.urllib3.disable_warnings()

# --- Step 1: Create a session ---
session_url = f"{VCENTER}/rest/com/vmware/cis/session"
resp = requests.post(session_url, auth=(USERNAME, PASSWORD), verify=False)

if resp.status_code != 200:
    print(f"Failed to create session: {resp.status_code} {resp.text}")
    exit(1)

session_id = resp.json()['value']
headers = {"vmware-api-session-id": session_id}
print("Session created successfully.\n")

# --- Helper functions ---
def get_vm_id(vm_name: str):
    url = f"{VCENTER}/rest/vcenter/vm?filter.names={vm_name}"
    resp = requests.get(url, headers=headers, verify=False)
    if resp.status_code != 200:
        print(f"Error fetching VM info: {resp.status_code} {resp.text}")
        return None
    vms = resp.json().get("value", [])
    if not vms:
        print(f"VM '{vm_name}' not found.")
        return None
    return vms[0]["vm"]

def power_on_vm(vm_id: str):
    url = f"{VCENTER}/rest/vcenter/vm/{vm_id}/power/start"
    resp = requests.post(url, headers=headers, verify=False)
    if resp.status_code == 200:
        print("VM is powering on.")
    else:
        print(f"Failed to power on VM: {resp.status_code} {resp.text}")

def power_off_vm(vm_id: str):
    url = f"{VCENTER}/rest/vcenter/vm/{vm_id}/power/stop"
    resp = requests.post(url, headers=headers, verify=False)
    if resp.status_code == 200:
        print("VM is powering off.")
    else:
        print(f"Failed to power off VM: {resp.status_code} {resp.text}")

# --- User interaction ---
vm_name = input("Enter the VM name: ").strip()
vm_id = get_vm_id(vm_name)
if not vm_id:
    exit(1)

print("\nChoose an action:")
print("1. Power On VM")
print("2. Power Off VM")
choice = input("Enter 1 or 2: ").strip()

if choice == "1":
    power_on_vm(vm_id)
elif choice == "2":
    power_off_vm(vm_id)
else:
    print("Invalid choice.")
