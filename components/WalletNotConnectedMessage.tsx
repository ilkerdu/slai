import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletNotConnectedMessage: React.FC = () => {
  return (
    <div className="bg-yellow-700 border border-yellow-900 text-yellow-100 px-4 py-3 rounded-lg relative shadow-md text-center">
      <strong className="font-bold">Wallet Not Connected</strong>
      <p className="block sm:inline mt-1 sm:mt-0 sm:ml-2">
        Please connect your Solana wallet to generate images or purchase credits.
      </p>
      <div className="mt-4 flex justify-center">
        <WalletMultiButton style={{ backgroundColor: '#1d4ed8', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }} />
      </div>
    </div>
  );
};

export default WalletNotConnectedMessage;