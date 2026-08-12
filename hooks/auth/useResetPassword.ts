import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await axios.post<ResetPasswordResponse>(
        "/api/auth/reset-password",
        data
      );
      return response.data;
    },
  });
}
