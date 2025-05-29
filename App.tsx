
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Buffer } from 'buffer/'; // Polyfill for Buffer
import Header from './components/Header';
import ImagePromptForm from './components/ImagePromptForm';
import ImageDisplay from './components/ImageDisplay';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import WalletNotConnectedMessage from './components/WalletNotConnectedMessage';
import BuyCreditsSection from './components/BuyCreditsSection';
import { generateImageFromPrompt } from './services/geminiService';
import {
  CREDIT_PURCHASE_COST_SOL,
  CREDITS_PER_PURCHASE,
  IMAGE_GENERATION_CREDIT_COST,
  RECIPIENT_WALLET_ADDRESS,
  SOLANA_NETWORK,
  SOLANA_RPC_ENDPOINT
} from './constants';
import { StatusMessage, StatusMessageType } from './types';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

import useLocalStorage from './hooks/useLocalStorage';

// Polyfill Buffer for browser environment if not already available
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer as any;
}

const AppContent: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isBuyingCredits, setIsBuyingCredits] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [activeLoadingMessageId, setActiveLoadingMessageId] = useState<string | null>(null);
  
  const [credits, setCredits] = useLocalStorage<number>('slashai_user_credits', 0);

  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();
  const connection = useMemo(() => new Connection(SOLANA_RPC_ENDPOINT, 'confirmed'), []);

  const dismissStatusMessage = useCallback((id: string) => {
    setStatusMessages(prev => prev.filter(msg => msg.id !== id));
    if (id === activeLoadingMessageId) {
      setActiveLoadingMessageId(null);
    }
  }, [activeLoadingMessageId]);

  const addStatusMessage = useCallback((text: string, type: StatusMessageType, duration: number = 3000): string => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setStatusMessages(prev => [...prev, { id, text, type, duration }]);
    if (duration > 0) {
      window.setTimeout(() => {
        // Use a functional update to ensure we're acting on the latest state
        setStatusMessages(currentMessages => currentMessages.filter(msg => msg.id !== id));
      }, duration);
    }
    return id;
  }, []); // Removed dismissStatusMessage from deps as it uses activeLoadingMessageId which is not a dep here
  
  const clearError = useCallback(() => setError(null), []);

  const handleBuyCredits = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      addStatusMessage("Please connect your wallet to buy credits.", 'error');
      return;
    }

    setIsBuyingCredits(true);
    setError(null);
    if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
    let tempActiveMsgId = addStatusMessage("Preparing transaction...", 'loading');
    setActiveLoadingMessageId(tempActiveMsgId);

    try {
      const lamports = CREDIT_PURCHASE_COST_SOL * LAMPORTS_PER_SOL;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(RECIPIENT_WALLET_ADDRESS),
          lamports,
        })
      );
      
      transaction.feePayer = publicKey;

      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
      tempActiveMsgId = addStatusMessage("Requesting latest blockhash...", 'loading');
      setActiveLoadingMessageId(tempActiveMsgId);
      
      const blockhashResponse = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhashResponse.blockhash;
      
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
      tempActiveMsgId = addStatusMessage("Sending transaction... Please approve in your wallet.", 'loading');
      setActiveLoadingMessageId(tempActiveMsgId);

      const signature = await sendTransaction(transaction, connection);

      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
      tempActiveMsgId = addStatusMessage(`Transaction sent: ${signature.substring(0,10)}... Waiting for confirmation.`, 'loading');
      setActiveLoadingMessageId(tempActiveMsgId);
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: blockhashResponse.blockhash,
        lastValidBlockHeight: blockhashResponse.lastValidBlockHeight
      }, 'confirmed');

      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
      setActiveLoadingMessageId(null);

      if (confirmation.value.err) {
        throw new Error(`Solana transaction failed to confirm: ${JSON.stringify(confirmation.value.err)}`);
      }

      setCredits(prevCredits => prevCredits + CREDITS_PER_PURCHASE);
      addStatusMessage(`Successfully purchased ${CREDITS_PER_PURCHASE} credits!`, 'success');
    } catch (err) {
      console.error("Solana transaction error:", err);
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
      setActiveLoadingMessageId(null);
      
      let finalErrorMessage = "Payment failed: ";
      if (err instanceof Error) {
          if (err.message.includes("failed to get recent blockhash") && (err.message.includes("403") || err.message.toLowerCase().includes("forbidden"))) {
              finalErrorMessage += "Could not connect to the Solana network (403 Forbidden while fetching blockhash). " +
                                   "This often happens with public RPC endpoints. " +
                                   "Please ensure you have configured a private/dedicated Solana RPC URL in the application (constants.ts).";
          } else {
              finalErrorMessage += err.message;
          }
      } else {
          finalErrorMessage += "An unknown error occurred during the transaction.";
      }
      setError(finalErrorMessage);
      addStatusMessage(finalErrorMessage, 'error', 10000); // Longer duration for important errors
    } finally {
      setIsBuyingCredits(false);
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId); // Ensure final loading message is cleared
      setActiveLoadingMessageId(null);
    }
  }, [connected, publicKey, connection, sendTransaction, signTransaction, setCredits, addStatusMessage, dismissStatusMessage, activeLoadingMessageId]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    if (!connected) {
       addStatusMessage("Please connect your wallet first.", 'error');
       return;
    }
    if (credits < IMAGE_GENERATION_CREDIT_COST) {
      addStatusMessage(`Not enough credits. You need ${IMAGE_GENERATION_CREDIT_COST} credit(s) to generate. Please purchase more.`, 'error', 7000);
      return;
    }

    setCurrentPrompt(prompt);
    setGeneratedImageUrl(null);
    setError(null);
    setIsGeneratingImage(true);
    
    if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId);
    const generatingMsgId = addStatusMessage("Generating your image with AI...", 'loading');
    setActiveLoadingMessageId(generatingMsgId);

    try {
      const imageUrl = await generateImageFromPrompt(prompt);
      setGeneratedImageUrl(imageUrl);
      setCredits(prevCredits => prevCredits - IMAGE_GENERATION_CREDIT_COST);
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId); // Clear "Generating..."
      setActiveLoadingMessageId(null);
      addStatusMessage("Image generated successfully!", 'success');
    } catch (err) {
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId); // Clear "Generating..."
      setActiveLoadingMessageId(null);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      addStatusMessage(`Error generating image: ${message}`, 'error', 7000);
      setGeneratedImageUrl(null);
    } finally {
      setIsGeneratingImage(false);
      if (activeLoadingMessageId) dismissStatusMessage(activeLoadingMessageId); // Ensure final loading message is cleared
      setActiveLoadingMessageId(null);
    }
  }, [connected, credits, setCredits, addStatusMessage, dismissStatusMessage, activeLoadingMessageId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header credits={credits} />
      
      <div className="fixed top-20 right-4 z-50 space-y-2 w-full max-w-xs sm:max-w-sm">
        {statusMessages.map(msg => (
          <div key={msg.id}
               className={`p-3 rounded-md shadow-lg text-sm flex justify-between items-start
                          ${msg.type === 'success' ? 'bg-green-600' : ''}
                          ${msg.type === 'error' ? 'bg-red-600' : ''}
                          ${msg.type === 'info' ? 'bg-blue-600' : ''}
                          ${msg.type === 'loading' ? 'bg-yellow-500 text-gray-800' : 'text-white'}`}
          >
            <div className="flex items-center mr-2">
              {msg.type === 'loading' && <LoadingSpinner size="sm" />}
              <span className={`break-words ${msg.type === 'loading' ? 'ml-2' : ''}`}>{msg.text}</span>
            </div>
            { /* Only show close button if duration was meant to be manual (e.g. 0, or for non-loading messages if preferred) 
               For this fix, all messages get a duration, so the close button is always an option.
            */ }
            <button onClick={() => dismissStatusMessage(msg.id)} className="ml-auto flex-shrink-0 text-lg font-bold leading-none opacity-70 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-8">
          {!connected && <WalletNotConnectedMessage />}
          
          {connected && (
            <BuyCreditsSection
              onBuyCredits={handleBuyCredits}
              isLoading={isBuyingCredits} 
              costSol={CREDIT_PURCHASE_COST_SOL}
              creditsToReceive={CREDITS_PER_PURCHASE}
            />
          )}
          
          <section aria-labelledby="prompt-section-title">
            <h2 id="prompt-section-title" className="sr-only">Image Prompt Input</h2>
            <ImagePromptForm
              onSubmit={handlePromptSubmit}
              isLoading={isGeneratingImage}
              credits={credits}
              isWalletConnected={connected}
            />
          </section>
          
          {error && !statusMessages.some(sm => sm.type === 'error' && sm.text.includes(error)) && (
            <div className="my-4 w-full">
              <ErrorMessage message={error} onDismiss={clearError} />
            </div>
          )}

          <section aria-labelledby="image-display-section-title" className="w-full">
            <h2 id="image-display-section-title" className="sr-only">Generated Image Display</h2>
            <ImageDisplay 
                imageUrl={generatedImageUrl} 
                prompt={currentPrompt} 
                isLoading={isGeneratingImage && currentPrompt !== null && !generatedImageUrl} 
            />
          </section>

          <footer className="text-center text-sm text-gray-500 pt-8">
            <p>&copy; {new Date().getFullYear()} SLASHAI. All rights reserved.</p>
            <p className="mt-1">Solana Network: <span className="font-semibold">{SOLANA_NETWORK}</span></p>
            {SOLANA_NETWORK !== "mainnet-beta" && <p className="text-yellow-400 text-xs">Currently on {SOLANA_NETWORK}. Ensure your wallet is also set to this network.</p>}
             <p className="mt-1 text-xs italic">
              This Site uses Helius RPC.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const network = SOLANA_NETWORK as WalletAdapterNetwork; 
  const endpoint = useMemo(() => SOLANA_RPC_ENDPOINT, []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;