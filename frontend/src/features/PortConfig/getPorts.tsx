import axios from "axios";

const API_BASE = "http://localhost:5000/"; 

interface PortsResponse {
  ports: string[];
}

export const getPorts = async (ip: string): Promise<string[]> => {
  const response = await axios.post<PortsResponse>(`${API_BASE}/switch/int-status/ports`, { ip });
  return response.data.ports;
};
