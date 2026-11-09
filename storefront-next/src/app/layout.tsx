import "./globals.css";
import Providers from "../components/Providers";
import { getActiveTheme } from "../lib/theme";
import { getTheme } from "../themes";

export const metadata = {
  title: "Piaarya",
  description: "Piaarya — shop the latest collection.",
};

export default async function RootLayout({ children }) {
  const themeKey = await getActiveTheme();
  const { Header, Footer, CartDrawer, fontVariables = "", bodyFontFamily } = getTheme(themeKey);

  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col ${fontVariables}`}
        style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
