from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_restx import Api, Resource, fields
from infrastructure.services.password_service import PasswordService
from infrastructure.services.ssh_service import SSHService
from domain.entities.switch import Switch
from application.use_cases.change_vlan import ChangeVlanUseCase
from application.use_cases.show_logs import GetLogsUseCase
from application.use_cases.show_int_status import GetIntStatusCase
from application.use_cases.show_vlans import GetVlansCase
from application.use_cases.ad_group import add_user_to_group
from application.use_cases.shut_no_shut import PortState
from application.use_cases.local_admin import LocalAdmin
from application.use_cases.ter_mon import TerMonUseCase
from application.use_cases.create_user import CreateDomainUser, test_domain_connection, check_privileges
from domain.entities.user import User
from domain.entities.computer import Computer

# --- Initialize Flask and Swagger ---
app = Flask(__name__)
CORS(app)
api = Api(app, version="1.0", title="ze lo caze amok API", description="Switch Management API with Clean Architecture")

# --- Define input models for Swagger ---
ip_model = api.model("SwitchIP", {
    "ip": fields.String(required=True, description="Switch IP address")
})

port_model = api.model("PortState", {
    "ip": fields.String(required=True, description="Switch IP address"),
    "port": fields.String(required=True, description="Switch port (e.g., gi1/0/1)"),
})

vlan_model = api.model("VLANChange", {
    "ip": fields.String(required=True, description="Switch IP address"),
    "port": fields.String(required=True, description="Switch port (e.g., gi1/0/1)"),
    "vlan": fields.String(required=True, description="VLAN ID")
})

local_admin_model = api.model("LocalAdmin", {
    "computer_name": fields.String(required=True, description="Target computer name (e.g., vpnpc123)"),
    "username": fields.String(required=True, description="Domain username (without domain, e.g., c_123)")
})

user_model = api.model("User", {
    "username": fields.String(required=True, description="Username to add to AD")
})

group_model = api.model("AddToGroup", {
    "username": fields.String(required=True, description="Username to add to AD group"),
    "groupname": fields.String(required=True, description="AD group to add the user to")
})

# --- Initialize Password and SSH Service ---
KEY_PATH = r"C:\Users\Hamburg\Desktop\de.txt"
password = PasswordService(KEY_PATH).decrypt_password()

# --- Namespaces ---
switch_ns = api.namespace("switch", description="Switch operations")
user_ns = api.namespace("user", description="User operations")

# --- Endpoints ---
@switch_ns.route("/logs")
class Logs(Resource):
    @switch_ns.expect(ip_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        logs = GetLogsUseCase(ssh, sw)
        return {"logs": logs.execute(num_lines=10)}

@switch_ns.route("/int-status")
class IntStatus(Resource):
    @switch_ns.expect(ip_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        int_status = GetIntStatusCase(ssh, sw)
        return {"interfaces": int_status.execute()}
    
@switch_ns.route("/int-status/ports")
class IntStatusPorts(Resource):
    @switch_ns.expect(ip_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        int_status = GetIntStatusCase(ssh, sw)
        return {"ports": int_status.get_ports()}


@switch_ns.route("/get-switch-vlans")
class SwitchVlans(Resource):
    @switch_ns.expect(ip_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        switch_vlans = GetVlansCase(ssh, sw)
        return {"vlans": switch_vlans.get_vlans()}

@switch_ns.route("/shut")
class shutDown(Resource):
    @switch_ns.expect(port_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        shut = PortState(ssh, sw)
        return {"shut": shut.shut(data["port"])}

@switch_ns.route("/no-shut")
class noShutDown(Resource):
    @switch_ns.expect(port_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        no_shut = PortState(ssh, sw)
        return {"nuShut": no_shut.noShut(data["port"])}

@switch_ns.route("/change-vlan")
class ChangeVlan(Resource):
    @switch_ns.expect(vlan_model)
    def post(self):
        data = request.get_json()
        print("Received data:", data, flush=True)
        switch_ip = data.get("switch")
        port = data.get("port")
        vlan = data.get("vlan")
        if not switch_ip or not port or not vlan:
            return {"error": "Missing switch, port, or vlan"}, 400    
        
        sw = Switch(ip=switch_ip, username="root")
        ssh = SSHService(password=password)
        change_vlan = ChangeVlanUseCase(ssh, sw)

        try:
            result = change_vlan.execute(port=port, vlan=vlan)
            return {"result": result}, 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}, 500

@switch_ns.route("/termon")
class TerMon(Resource):
    @switch_ns.expect(ip_model)
    def post(self):
        data = request.get_json()
        ip = data.get("ip")

        sw = Switch(ip=ip, username="root")
        ssh = SSHService(password=password)
        use_case = TerMonUseCase(ssh, sw)

        def generate():
            try:
                for line in use_case.stream():
                    yield line
            except Exception as e:
                yield f"Error: {str(e)}\n".encode("utf-8")

        return Response(generate(), mimetype="text/plain", direct_passthrough=True)

    

@user_ns.route("/add-local-admin")
class AddLocalAdmin(Resource):
    @user_ns.expect(local_admin_model)
    def post(self):
        data = request.get_json()
        computer_name = data.get("computer_name")
        username = data.get("username")

        if not computer_name or not username:
            return {"error": "Missing computer_name or username"}, 400

        user_entity = User(username=username)
        computer_entity = Computer(computername=computer_name)

        admin_service = LocalAdmin()
        result = admin_service.add_user_to_admins(user_entity, computer_entity)

        return {"result": result}, 200

@user_ns.route("/add-to-group")
class AddToADGroup(Resource):
    @user_ns.expect(group_model)
    def post(self):
        try:
            data = request.get_json()
            username = data.get("username")
            groupname = data.get("groupname")

            if not username or not groupname:
                return {"status": "error", "message": "Username and groupname are required."}, 400
            # calls to the function
            result = add_user_to_group(username, groupname)
            return jsonify(result)

        except ValueError as ve:
            return {"status": "error", "message": str(ve)}, 400
        except RuntimeError as re:
            return {"status": "error", "message": str(re)}, 500
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}, 500

@user_ns.route("/create-user")
class CreateUser(Resource):
    @user_ns.expect(user_model)
    def post(self):
        try:
            data = request.get_json()
            username = data.get("username")
            if not username:
                return {"error": "[-] Username is required"}, 400            
            # Validate username format (basic validation)
            if not username.replace('_', '').replace('-', '').isalnum():
                return {"error": "[-] Username contains invalid characters"}, 400                
            if len(username) > 20:
                return {"error": "[-] Username too long (max 20 characters)"}, 400     
            # Optional: Test domain connection before attempting user creation       
            # Check privileges
            priv_ok, priv_msg = check_privileges()
            if not priv_ok:
                return {"error": f"[-] {priv_msg}"}, 403         
            # Check domain connection
            domain_ok, domain_msg = test_domain_connection()
            if not domain_ok:
                return {"error": f"[-] {domain_msg}"}, 503
            
            # Attempt to create the user
            result = CreateDomainUser(username)
            
            if "error" in result:
                return {"error": result["error"]}, 500
            
            return {"result": result["message"], "details": result}, 201
            
        except Exception as e:
            return {"error": f"[-] Unexpected server error: {str(e)}"}, 500

@app.route("/api/pages/<page_id>", methods=["GET"])
def get_page(page_id):
    # Temporary static page data
    page_data = {
        "id": page_id,
        "title": f"{page_id.capitalize()} Page",
        "content": f"This is the content for page '{page_id}'."
    }
    return jsonify(page_data)

# --- Run app ---
if __name__ == "__main__":
    app.run(debug=True)
