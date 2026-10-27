export interface LoginCredentials {
  userid: string;
  password: string;
  loginOTP?: string;
}

export interface ForgotPasswordPayload {
  UserId: string;
  Email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  userId?: string;
  loginid?: string;
}

export interface RegistrationPayload {
  fName: string;
  lName: string;
  password: string;
  email: string;
  countryId: string;
  mobile: string;
  address: string;
  introSide: "L" | "R";
  introAuth?: string;
}

export interface Country {
  country_Id: string;
  country_Name: string;
  countryFlag: string;
  phonecode: string;
}

export interface ReferralData {
  statusCode: number;
  message?: string;
  data: {
    urid: string;
    FullName: string;
  };
}
