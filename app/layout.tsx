import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";
import "./expedition.css";
import "./instrument.css";
import "./galaxy.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://emberatlas.tech"),
  title: "Ember Atlas — Fire, beyond Earth.",
  description:
    "Explore NASA microgravity combustion evidence, compare real flame-spread measurements, and investigate fire behavior in an interactive 3D lab. An independent Space Apps demo.",
  applicationName: "Ember Atlas",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Ember Atlas — Fire, beyond Earth.",
    description: "Microgravity combustion research, made explorable.",
    type: "website",
    url: "https://emberatlas.tech",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
