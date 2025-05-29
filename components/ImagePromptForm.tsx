
import React, { useState } from 'react';
import { IMAGE_GENERATION_CREDIT_COST } from '../constants';

interface ImagePromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  credits: number;
  isWalletConnected: boolean;
}

const ImagePromptForm: React.FC<ImagePromptFormProps> = ({ onSubmit, isLoading, credits, isWalletConnected }) => {
  const [prompt, setPrompt] = useState('');

  const hasEnoughCredits = credits >= IMAGE_GENERATION_CREDIT_COST;
  const canSubmit = isWalletConnected && hasEnoughCredits && prompt.trim() !== '' && !isLoading;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
        if (!isWalletConnected) {
            // This message might be better handled by a global status message if preferred
            alert("Please connect your Solana wallet first."); 
        } else if (!hasEnoughCredits) {
            // This message also better handled globally or via disabled state tooltip
            alert(`You need at least ${IMAGE_GENERATION_CREDIT_COST} credit(s) to generate an image. Please buy more credits.`);
        }
      return;
    }
    onSubmit(prompt.trim());
  };

  const buttonText = isLoading ? 'Generating...' : 'Generate Image';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-4">
      <div className="flex flex-col sm:flex-row items-stretch gap-3 p-2 bg-gray-800 rounded-xl shadow-lg">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion with a crown of stars, digital art..."
          rows={3}
          className="flex-grow p-4 bg-gray-700 text-gray-200 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors custom-scrollbar resize-none"
          disabled={isLoading || !isWalletConnected}
          aria-label="Image generation prompt"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={`font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75
            bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600`}
          aria-live="polite"
        >
          {buttonText}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center sm:text-left px-2">
        {isWalletConnected 
          ? (hasEnoughCredits 
              ? `Cost: ${IMAGE_GENERATION_CREDIT_COST} credit. You have ${credits} credits.` 
              : `You need ${IMAGE_GENERATION_CREDIT_COST} credit. You have ${credits}. Purchase credits above.`
            )
          : "Connect your wallet to generate images."
        }
      </p>
    </form>
  );
};

export default ImagePromptForm;
