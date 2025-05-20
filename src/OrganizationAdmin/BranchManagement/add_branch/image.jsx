<div className="col-span-2 mt-4">
<label className="block text-sm font-medium text-gray-700">Upload Image</label>
<div className="p-6 mt-2 text-center text-gray-500 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer">
  {imagePreview ? (
    <div className="flex flex-col items-center">
      <img src={imagePreview} alt="Uploaded" className="object-contain mb-2 rounded-md max-h-40" />
      <button type="button" className="text-sm text-red-500 underline" onClick={() => { setFormData((prev) => ({ ...prev, image: null })); setImagePreview(null); }}>
        Remove Image
      </button>
    </div>
  ) : (
    <>
      <p>Drag and drop an image here, or click to select a file</p>
      <input type="file" accept="image/*" className="hidden" id="fileUpload" onChange={handleImageChange} />
      <label htmlFor="fileUpload" className="text-blue-500 underline cursor-pointer">Browse Files</label>
    </>
  )}
</div>
</div>
