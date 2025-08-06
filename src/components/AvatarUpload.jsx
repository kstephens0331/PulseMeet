import { useState } from 'react';

export default function AvatarUpload() {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center gap-4">
      <input type="file" onChange={handleChange} className="hidden" id="avatar" />
      <label htmlFor="avatar" className="cursor-pointer">
        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden border-2 border-indigo-500">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">Upload</div>
          )}
        </div>
      </label>
    </div>
  );
}