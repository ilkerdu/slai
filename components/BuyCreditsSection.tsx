
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface BuyCreditsSectionProps {
  onBuyCredits: () => void;
  isLoading: boolean;
  costSol: number;
  creditsToReceive: number;
}

const BuyCreditsSection: React.FC<BuyCreditsSectionProps> = ({ 
  onBuyCredits, 
  isLoading,
  costSol,
  creditsToReceive 
}) => {
  return (
    <section aria-labelledby="buy-credits-title" className="w-full max-w-md mx-auto bg-gray-800 p-6 rounded-xl shadow-2xl border border-blue-500/30">
      <h2 id="buy-credits-title" className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
        Purchase Image Credits
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Fuel your creativity! Each image generation requires credits.
      </p>
      
      <div className="bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-3xl font-extrabold text-green-400">
          {creditsToReceive} <span className="text-xl text-gray-200">Credits</span>
        </p>
        <p className="text-lg text-gray-300 mt-1">
          for <span className="font-semibold text-yellow-400">{costSol} SOL</span>
        </p>
      </div>

      <button
        onClick={onBuyCredits}
        disabled={isLoading}
        className={`w-full mt-6 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 flex items-center justify-center
          bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white focus:ring-green-400
          disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Processing Purchase...</span>
          </>
        ) : (
          'Buy Credits Now'
        )}
      </button>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Securely processed using your connected Solana wallet. Network fees may apply.
      </p>
    </section>
  );
};

export default BuyCreditsSection;
