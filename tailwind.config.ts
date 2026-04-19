/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.tsx", "./components/**/*.tsx", "./lib/**/*.ts", "./hooks/**/*.ts"],
  theme: {},
  plugins: ["prettier-plugin-tailwindcss"],
};
