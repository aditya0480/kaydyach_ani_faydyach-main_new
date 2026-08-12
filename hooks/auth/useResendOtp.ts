import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ResendOTPData {
  email: string;
}

interface ResendOTPResponse {
  message: string;
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (data: ResendOTPData) => {
      const response = await axios.post<ResendOTPResponse>(
        "/api/auth/resend-otp",
        data
      );
      return response.data;
    },
  });
}
