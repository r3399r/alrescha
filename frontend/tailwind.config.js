/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    colors:{
      black:'#000000',
      grey:{
        300:"#eaeaea",
        400:'#cccccc',
        500:'#8d8d8d',
        600:'#666666',
        700:'#333333'
      },
      blue:'#0082fa',
      red:'#e52c04',
      white:'#ffffff'
    }
  },
  plugins: [],
}
