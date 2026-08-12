import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  message: string;
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: VerifyOTPData) => {
      const response = await axios.post<VerifyOTPResponse>(
        "/api/auth/verify-otp",
        data
      );
      return response.data;
    },
  });
}
