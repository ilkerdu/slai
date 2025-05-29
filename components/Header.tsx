import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface HeaderProps {
  credits: number;
}

const Header: React.FC<HeaderProps> = ({ credits }) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* The new logo image should be placed at /slash-logo.png */}
        <div>
          <img src="slash-logo.png" alt="Slash Logo" className="h-12 w-auto" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-300">Credits</p>
            <p className="text-xl font-bold text-green-400">{credits}</p>
          </div>
          <WalletMultiButton style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.6rem 1rem' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;