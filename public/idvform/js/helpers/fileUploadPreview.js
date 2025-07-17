import { uploadAndExtract, uploadedFilesCache } from './uploadAndExract.js';

export function initFileUploadPreview() {
  const fileInput = document.querySelector('input[name="doc"]');
  const imagePreview = document.getElementById("image-preview");

  if (!fileInput || !imagePreview) return;

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);

      // Clear any existing cache for passport uploads
      uploadedFilesCache.clear();

      // 🔥 Call OCR upload automatically (without userId for backward compatibility)
      // For legacy forms, we'll use 'legacy' as userId and let the backend handle folder creation
      uploadAndExtract(file, 'legacy');
    } else {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }
  });
}
