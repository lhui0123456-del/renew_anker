import React, { useState, useRef } from 'react';
import { editProductImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present (Gemini expects just base64 data sometimes, 
        // but typically handles standard base64 strings if mapped to inlineData.data properly.
        // For inlineData.data, we need raw base64 without prefix usually.)
        const rawBase64 = base64String.split(',')[1];
        setSelectedImage(rawBase64);
        setGeneratedImage(null); // Reset previous generation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;
    setLoading(true);
    try {
      // Pass the raw base64
      const resultBase64 = await editProductImage(selectedImage, prompt);
      if (resultBase64) {
        setGeneratedImage(resultBase64);
      } else {
        alert("No image returned. Try a different prompt.");
      }
    } catch (e) {
      alert("Error generating image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          Product Studio (Nano Banana)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload a product photo and use Gemini 2.5 Flash Image to modify the background or style.
          <br/>
          <span className="text-xs text-gray-400">Example: "Place this product on a wooden table in a sunny garden" or "Add a retro film filter"</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition h-64"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <img 
                src={`data:image/jpeg;base64,${selectedImage}`} 
                alt="Original" 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1">Click to upload product image</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Editing Prompt</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              rows={3}
              placeholder="Describe the changes you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt || loading}
              className={`w-full py-2 rounded-md font-semibold text-white transition ${
                (!selectedImage || !prompt || loading) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {loading ? 'Generating...' : 'Generate New Image'}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center h-full min-h-[300px]">
          {generatedImage ? (
            <div className="text-center w-full h-full flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">Result</h4>
              <div className="flex-grow flex items-center justify-center">
                 <img 
                  src={`data:image/jpeg;base64,${generatedImage}`} 
                  alt="Generated" 
                  className="max-h-[400px] max-w-full object-contain shadow-lg rounded"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
               <p>AI Generated result will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;