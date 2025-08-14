# from flask import Flask
# from api.controllers.switch_controller import switch_bp

# app = Flask(__name__)
# app.register_blueprint(switch_bp, url_prefix="/switch")

# if __name__ == "__main__":
#     app.run(debug=True)




from flask import Flask, request
from flask_restx import Api, Resource, fields
from infrastructure.services.password_service import PasswordService
from infrastructure.services.ssh_service import SSHService
from domain.entities.switch import Switch
from application.use_cases.change_vlan import ChangeVlanUseCase
from application.use_cases.show_logs import GetLogsUseCase
from application.use_cases.show_int_status import GetIntStatusCase

# --- Initialize Flask and Swagger ---
app = Flask(__name__)
api = Api(app, version="1.0", title="ze lo caze amok API", description="Switch Management API with Clean Architecture")

# --- Define input models for Swagger ---
ip_model = api.model("SwitchIP", {
    "ip": fields.String(required=True, description="Switch IP address")
})
vlan_model = api.model("VLANChange", {
    "ip": fields.String(required=True, description="Switch IP address"),
    "port": fields.String(required=True, description="Switch port (e.g., gi1/0/1)"),
    "vlan": fields.String(required=True, description="VLAN ID (allowed: 222, 404, 505)")
})

# --- Initialize Password and SSH Service ---
KEY_PATH = r"C:\Users\Hamburg\Desktop\de.txt"
password = PasswordService(KEY_PATH).decrypt_password()

# --- Namespaces ---
switch_ns = api.namespace("switch", description="Switch operations")
user_ns = api.namespace("user", description="user operations")

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

@switch_ns.route("/change-vlan")
class ChangeVlan(Resource):
    @switch_ns.expect(vlan_model)
    def post(self):
        data = request.get_json()
        sw = Switch(ip=data["ip"], username="root")
        ssh = SSHService(password=password)
        change_vlan = ChangeVlanUseCase(ssh, sw)
        try:
            result = change_vlan.execute(port=data["port"], vlan=data["vlan"])
            return {"result": result}
        except ValueError as e:
            return {"error": str(e)}, 400


# --- Run app ---
if __name__ == "__main__":
    app.run(debug=True)
