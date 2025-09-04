# from flask import Blueprint, request, jsonify
# from flask_restx import Api, Resource

# from infrastructure.services.password_service import PasswordService
# from infrastructure.services.ssh_service import SSHService
# from domain.entities.switch import Switch
# from application.use_cases.change_vlan import ChangeVlanUseCase
# from application.use_cases.show_logs import GetLogsUseCase
# from application.use_cases.show_int_status import GetIntStatusCase

# switch_bp = Blueprint("switch", __name__)

# KEY_PATH = r"C:\Users\Hamburg\Desktop\de.txt"
# pwd = PasswordService(KEY_PATH).decrypt_password()

# def get_ssh_and_switch(ip):
#     sw = Switch(ip, username="root")
#     ssh = SSHService(password=pwd)
#     return ssh, sw

# @switch_bp.route("/logs", methods=["GET"])
# def get_logs():
#     ip = request.args.get("ip")
#     ssh, sw = get_ssh_and_switch(ip)
#     logs = GetLogsUseCase(ssh, sw).execute(num_lines=10)
#     return jsonify({"logs": logs})

# @switch_bp.route("/int-status", methods=["GET"])
# def get_int_status():
#     ip = request.args.get("ip")
#     ssh, sw = get_ssh_and_switch(ip)
#     status = GetIntStatusCase(ssh, sw).execute()
#     return jsonify({"status": status})

# @switch_bp.route("/change-vlan", methods=["POST"])
# def change_vlan():
#     data = request.json
#     ip = data.get("ip")
#     port = data.get("port")
#     vlan = data.get("vlan")
#     ssh, sw = get_ssh_and_switch(ip)
#     result = ChangeVlanUseCase(ssh, sw).execute(port, vlan)
#     return jsonify({"result": result})
