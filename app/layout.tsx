import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patrimoine",
  description: "Dashboard patrimonial personnel",
};

// Applique le thème sauvegardé (localStorage) avant le premier paint, pour éviter
// un flash. Sans préférence sauvegardée, le CSS suit prefers-color-scheme.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
