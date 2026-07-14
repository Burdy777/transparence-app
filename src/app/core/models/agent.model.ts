export interface Agent {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  agent: Agent;
}
