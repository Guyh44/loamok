class Switch:

    ALLOWED_VLANS = ('222', '404', '505')

    def __init__(self, ip, username="root"):
        self.ip = ip
        self.username = username


    def is_vlan_allowed(self, vlan_id):
        return vlan_id in self.ALLOWED_VLANS
