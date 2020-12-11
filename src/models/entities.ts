export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  roles: string[];
}

export interface Budget {
  id: number;
  userId: string;
  name: string;
  description?: string;
  taxFilingStatus: string;
}
