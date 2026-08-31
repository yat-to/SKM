// import StoreProvider from '@/components/storeProvider';

import StoreProvider from "./components/storeProvider";
import "./globals.css";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </head>
            <body className="antialiased">
                <StoreProvider>
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}