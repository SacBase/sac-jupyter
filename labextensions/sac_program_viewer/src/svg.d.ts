// including this file in a package allows for the use of import statements
// with svg files. Example: `import xSvg from 'path/xSvg.svg'`

// for use with raw-loader in Webpack.
// The svg will be imported as a raw string

// Used for the icons in this project

declare module '*.svg' {
    const value: string;
    export default value;
  }