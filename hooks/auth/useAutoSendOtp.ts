import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AutoSendOTPResponse {
  message: string;
}

export function useAutoSendOtp(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["auto-send-otp", email],
    queryFn: async () => {
      const response = await axios.post<AutoSendOTPResponse>(
        "/api/auth/resend-otp",
        { email }
      );
      return response.data;
    },
    enabled: enabled && !!email, // Only run if enabled and email exists
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component remount
    staleTime: Infinity, // Never consider this data stale
  });
}
