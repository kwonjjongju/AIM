import api from './axios';

export interface AIToolUserData {
  id: number;
  division: string;
  team: string;
  name: string;
  email: string;
  tools: {
    skywork: boolean;
    gemini: boolean;
    chatgpt: boolean;
    cursor: boolean;
    claude: boolean;
  };
}

export const aiToolUsersApi = {
  // 전체 조회
  getAll: async (): Promise<AIToolUserData[]> => {
    const response = await api.get('/ai-tool-users');
    return response.data.data;
  },

  // 전체 저장
  saveAll: async (users: AIToolUserData[]): Promise<AIToolUserData[]> => {
    const response = await api.post('/ai-tool-users', { users });
    return response.data.data;
  },
};
