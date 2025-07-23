import '@ant-design/v5-patch-for-react-19';

import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sales App",
  description: "Sales App Karya Group by Apergu",
  manifest: "/manifest.json", // Link to your web app manifest
  themeColor: "#9E7FFF", // Define the theme color for the PWA
};

export default function RootLayout({ children }) {
  return (
    <ConfigProvider theme={{ token: { fontSize: 16 } }}>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          <AntdRegistry>
            {children}
          </AntdRegistry>
        </body>
      </html>
    </ConfigProvider>
  );
}
