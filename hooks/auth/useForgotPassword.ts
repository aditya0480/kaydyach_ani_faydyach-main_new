import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await axios.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        data
      );
      return response.data;
    },
  });
}
