import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charabilla — Affiches des premiers mots",
  description:
    "Des affiches décoratives personnalisées à partir des premiers mots de votre enfant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
