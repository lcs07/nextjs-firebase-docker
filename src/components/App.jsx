import React from 'react';
import Header from './Header';
import Footer from './Footer';

const App = ({children}) => (
  <main>
    <Header />
    {children}
    <Footer />
  </main>
);

export default App;
