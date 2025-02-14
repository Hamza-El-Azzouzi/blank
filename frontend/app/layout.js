import "./globals.css";

import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export const metadata = {
  title: "blank",
  description: "This is a blank Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <LeftSidebar />
            {children}
          <RightSidebar />
        </div>
      </body>
    </html>
  );
}
