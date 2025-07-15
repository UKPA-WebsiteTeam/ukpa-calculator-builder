// Function to create the Address Details Section for each user
export function createAddressSection(userId) {
  const section = document.createElement('div');
  section.classList.add('address-section');

  // Create the HTML structure for the address details
  section.innerHTML = `
    <h3>Home Address - User ${userId}</h3>
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
  `;

  return section;
}
