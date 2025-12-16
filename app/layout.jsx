import "./globals.css";

export const metadata = {
  title: "יומן סופגניות",
  description: "דירוגי סופגניות עם שיתוף משפחתי",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
