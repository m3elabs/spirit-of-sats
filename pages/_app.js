import React from 'react';
import  "../styles/globals.css";

export default function App({ Component, pageProps }) {
      return (
        <>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
            <Component {...pageProps} />
            </>
      );
    }