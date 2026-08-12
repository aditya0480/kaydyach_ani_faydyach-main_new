// Send OTP email
export const sendOTPEmail = async (email: string) => {
  console.info("Skipping OTP email (disabled):", email);
  return { success: true };
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  console.info("Skipping password reset email (disabled):", email, resetLink);
  return { success: true };
};

