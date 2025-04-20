import type { FC, ReactNode } from "react";

export const Document: FC<{ children: ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Yatzy game</title>
      <link rel="preload" href="/src/client.tsx" as="script" />
      <link rel="stylesheet" href="/src/app/global.css" />
    </head>
    <body>
      <div id="root">{children}</div>
      <script src="/src/client.tsx"></script>
    </body>
  </html>
);
