import "./globals.css";

export const metadata = {
  title: "blank",
  description: "This is a blank Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
