import type { Metadata } from "next";
import { Fredoka, Nunito, Baloo_2, Cormorant_Garamond, Comfortaa } from "next/font/google";
import "./globals.css";

// Adaptation n°4 de DEMARRAGE.md : les 5 polices du prototype passent par next/font.
const fredoka = Fredoka({ weight: ["500", "600"], subsets: ["latin"], variable: "--font-fredoka" });
const nunito = Nunito({ weight: ["400", "600", "700", "800"], subsets: ["latin"], variable: "--font-nunito" });
const baloo2 = Baloo_2({ weight: "600", subsets: ["latin"], variable: "--font-baloo2" });
const cormorant = Cormorant_Garamond({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-cormorant",
});
const comfortaa = Comfortaa({ weight: "600", subsets: ["latin"], variable: "--font-comfortaa" });

export const metadata: Metadata = {
  title: "charabilla — leurs premiers mots méritent une affiche",
  description:
    "Des affiches décoratives personnalisées à partir des premiers mots de votre enfant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fredoka.variable} ${nunito.variable} ${baloo2.variable} ${cormorant.variable} ${comfortaa.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
