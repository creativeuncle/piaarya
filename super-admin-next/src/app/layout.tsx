import "./globals.css";
import { PlatformAuthProvider } from "../context/PlatformAuthContext";

export const metadata = {
  title: "Piaarya Super Admin",
  description: "Platform-level control panel for the Piaarya SaaS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PlatformAuthProvider>{children}</PlatformAuthProvider>
      </body>
    </html>
  );
}
