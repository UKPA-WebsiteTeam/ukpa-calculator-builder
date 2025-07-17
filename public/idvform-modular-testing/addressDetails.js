// Function to create the Address Details Section for each user
export function createAddressSection(userId, displayName) {
  const section = document.createElement('div');
  section.classList.add('address-section');

  // Create the HTML structure for the address details
  section.innerHTML = `
    <h3>Home Address - ${displayName}</h3>
    <div class="disclaimer-box">
      <p>Please make sure that the address you provide is correct and up to date. It will be used for identity verification purposes. You will also need to provide a proof of address document.</p>
    </div>
    <div class="address_fields">
      <!-- Address Line 1 -->
      <div class="inputContainer">
        <label for="addressLine1-${userId}">Address Line 1:</label>
        <input type="text" id="addressLine1-${userId}" name="addressLine1-${userId}" required />
      </div>

      <!-- Address Line 2 -->
      <div class="inputContainer">
        <label for="addressLine2-${userId}">Address Line 2:</label>
        <input type="text" id="addressLine2-${userId}" name="addressLine2-${userId}" />
      </div>

      <!-- City or Town -->
      <div class="inputContainer">
        <label for="city-${userId}">City or Town:</label>
        <input type="text" id="city-${userId}" name="city-${userId}" required />
      </div>

      <!-- County/State/Province -->
      <div class="inputContainer">
        <label for="county-${userId}">County/State/Province:</label>
        <input type="text" id="county-${userId}" name="county-${userId}" />
      </div>

      <!-- Country -->
      <div class="inputContainer">
        <label for="country-${userId}">Country:</label>
        <input type="text" id="country-${userId}" name="country-${userId}" required />
      </div>

      <!-- Postcode/ZIP -->
      <div class="inputContainer">
        <label for="postcode-${userId}">Postcode/ZIP:</label>
        <input type="text" id="postcode-${userId}" name="postcode-${userId}" />
      </div>
    </div>
    <div class="proof-of-address-container">
      <p>Please provide a proof of address document. This can be a utility bill, bank statement, or other document that shows your address.</p>
      <div class="upload-and-preview-container">
        <input type="file" id="proofOfAddress-${userId}" name="proofOfAddress-${userId}" accept=".jpg,.jpeg,.png,.pdf" />
        <div class="preview-container" id="proofOfAddress-preview-container-${userId}">
          <img id="proofOfAddress-preview-${userId}" src="" alt="Proof of Address" style="display:none; max-width:200px; margin-top:12px; border-radius:4px; border:1px solid #ccc;" />
        </div>
      </div>
    </div>
  `;

  // --- Image/PDF preview logic ---
  // Delay until section is attached to DOM (in case this function is used before DOM append)
  setTimeout(() => {
    const fileInput = section.querySelector(`#proofOfAddress-${userId}`);
    const imgPreview = section.querySelector(`#proofOfAddress-preview-${userId}`);
    const previewContainer = section.querySelector(`#proofOfAddress-preview-container-${userId}`);

    fileInput.addEventListener('change', function () {
      const file = this.files && this.files[0];

      // Remove old PDF link if any
      previewContainer.querySelectorAll('a').forEach(a => a.remove());

      if (!file) {
        imgPreview.style.display = 'none';
        imgPreview.src = '';
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imgPreview.src = e.target.result;
          imgPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        // Hide image
        imgPreview.style.display = 'none';
        imgPreview.src = '';

        // Show link for PDF
        const pdfLink = document.createElement('a');
        pdfLink.href = URL.createObjectURL(file);
        pdfLink.target = "_blank";
        pdfLink.textContent = "View PDF";
        pdfLink.style.display = 'inline-block';
        pdfLink.style.marginTop = '12px';
        pdfLink.style.color = '#0074d9';
        pdfLink.style.textDecoration = 'underline';
        previewContainer.appendChild(pdfLink);
      } else {
        // Not image or PDF: clear preview
        imgPreview.style.display = 'none';
        imgPreview.src = '';
      }
    });
  }, 0);

  return section;
}

export function bindAddressDetailsValidation(userId) {
  // Required fields only
  const requiredFields = [
    `addressLine1-${userId}`,
    `city-${userId}`,
    `country-${userId}`
  ];

  requiredFields.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        if (!input.value.trim()) {
          input.classList.add('invalid');
          input.classList.remove('valid');
        } else {
          input.classList.remove('invalid');
          input.classList.add('valid');
        }
      });
    }
  });
}

