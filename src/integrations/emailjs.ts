export const sendConfirmationEmail = async (email: string, name: string) => {
  console.log("Email confirmation would be sent to:", email, name);
  return { status: 200 };
};