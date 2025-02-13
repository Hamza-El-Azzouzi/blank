// app/(auth)/layout.js or layout.tsx
import "./globals.css"; // Relative import since it's in the same folder

export default function AuthLayout({ children }) {
  return <>{children}</>;
}