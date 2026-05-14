// Mock for next/font/google using a Proxy to handle any font name
const fontMock = () => ({
  className: 'next-font-mock',
  variable: '--font-mock',
  style: { fontFamily: 'sans-serif' }
});

export const Poppins = fontMock;
export const Inter = fontMock;
export const Outfit = fontMock;
export const Montserrat = fontMock;
export const Geist = fontMock;
export const Geist_Mono = fontMock;
export const GeistMono = fontMock;

// Fallback for any other font requested
export default new Proxy({}, {
  get: () => fontMock
});
