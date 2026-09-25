import "./globals.css";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export const metadata = {
  title: "Piaarya Admin",
  description: "Piaarya store admin dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
