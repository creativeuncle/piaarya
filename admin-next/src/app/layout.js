import "./globals.css";

export const metadata = {
  title: "Piaarya Admin",
  description: "Piaarya store admin dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
