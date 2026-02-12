import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageBlockProps {
    content: string; // data url
    caption?: string;
    onChange: (content: string) => void;
    onCaptionChange: (caption: string) => void;
}

export const ImageBlock = ({ content, caption, onChange, onCaptionChange }: ImageBlockProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    onChange(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!content) {
        return (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group my-2"
            >
                <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Click to upload image</span>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        );
    }

    return (
        <div className="relative group my-2">
            <div className="relative inline-block max-w-full">
                <img src={content} alt="Report asset" className="max-w-full max-h-[500px] rounded-md shadow-sm border border-gray-200 dark:border-gray-800 bg-white" />
                <button
                    onClick={() => onChange('')}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    title="Remove Image"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <input
                value={caption || ''}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="Write a caption..."
                className="mt-2 w-full text-center text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-300 outline-none"
            />
        </div>
    );
};
