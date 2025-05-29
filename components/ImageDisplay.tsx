
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageDisplayProps {
  imageUrl: string | null;
  prompt: string | null;
  isLoading: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, prompt, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-square bg-gray-800 rounded-xl shadow-lg flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-blue-300">Generating your masterpiece...</p>
        {prompt && <p className="mt-2 text-sm text-gray-400 italic">Prompt: "{prompt}"</p>}
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full aspect-square bg-gray-800 rounded-xl shadow-lg flex flex-col items-center justify-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-600 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-400">Your Generated Image Will Appear Here</h3>
        <p className="text-gray-500 mt-1">Enter a prompt and click "Generate Image" to start.</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square bg-gray-800 rounded-xl shadow-2xl overflow-hidden group relative">
      <img
        src={imageUrl}
        alt={prompt || 'Generated AI Image'}
        className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
      />
      {prompt && (
         <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <p className="text-sm text-gray-200 truncate" title={prompt}>Prompt: {prompt}</p>
         </div>
      )}
    </div>
  );
};

export default ImageDisplay;
    