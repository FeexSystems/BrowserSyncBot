export const usePasswordManager = () => {
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const getStrength = (password) => {
    if (password.length > 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    if (password.length > 6) return 'medium';
    return 'weak';
  };

  return { generatePassword, getStrength };
};
