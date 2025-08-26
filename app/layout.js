import "./globals.css";
export const metadata = {
  title: "Zealy Pay — Digital Wallet",
  description: "Professional wallet app experience (demo).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
