import axios from "axios";

const API_BASE = "http://localhost:5000/";

export interface VlanDropdownOption {
  value: string;
  label: string;
}

interface VlansResponse {
  vlans: string[]; 
}

export const getVlans = async (ip: string): Promise<string[]> => {
  const response = await axios.post<VlansResponse>(`${API_BASE}/switch/switch-vlans`, { ip });
  return response.data.vlans; 
};
