import os
from cryptography.fernet import Fernet

class PasswordService:
    def __init__(self, key_path, env_var_name="notSus"):
        self.key_path = key_path
        self.env_var_name = env_var_name

    def _load_key(self):
        with open(self.key_path, "rb") as f:
            return f.read()

    def decrypt_password(self) -> str:
        enc_password = os.getenv(self.env_var_name)
        if not enc_password:
            raise ValueError(f"Environment variable {self.env_var_name} not set!")
        f = Fernet(self._load_key())
        return f.decrypt(enc_password.encode()).decode()
