module.exports = {
  globDirectory: "dist/client/",
  globPatterns: ["**/*.{html,js,css,png}"],
  swDest: "dist/client/sw.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
