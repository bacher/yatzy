import type { FC, ReactNode } from "react";

export const Document: FC<{ children: ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <title>Yatzy game</title>
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="preload" href="/src/client.tsx" as="script" />
      <link rel="stylesheet" href="/css/global.css" />
      <link rel="stylesheet" href="/css/custom.css" />
    </head>
    <body>
      <div id="root">{children}</div>
      <script src="/src/client.tsx"></script>
    </body>
  </html>
);
