export interface User {
  id: number;
  uid: string;
  email: string;
  password_hash: string;
  fullname: string;
  mobile: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: Date;
  updated_at: Date;
}
