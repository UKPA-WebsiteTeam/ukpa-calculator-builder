import { createInfoTooltip } from './tooltip.js';

// Function to create the Personal Details Section for each user
export function createPersonalDetailsSection(userId, displayName) {
  const section = document.createElement('div');
  section.classList.add('personal-details-section');
  
  // Create the HTML structure for the personal details
  section.innerHTML = `
    <h3>Personal Details - ${displayName}</h3>
    
    <!-- Name Fields Section -->
    <div class="nameFields" id="nameFields-${userId}">
    
      <!-- First Name -->
      <div class="inputContainer">
        <label for="firstName-${userId}">First Name:</label>
        <input type="text" id="firstName-${userId}" placeholder="Enter first name" name="firstName-${userId}" required />
      </div>
    
      <!-- Middle Name -->
      <div class="inputContainer">
        <label for="middleName-${userId}">Middle Name:</label>
        <input type="text" id="middleName-${userId}" placeholder="Enter middle name" name="middleName-${userId}" />
      </div>
    
      <!-- Last Name -->
      <div class="inputContainer">
        <label for="lastName-${userId}">Last Name:</label>
        <input type="text" id="lastName-${userId}" placeholder="Enter last name" name="lastName-${userId}" required />
      </div>
    
    </div>
    
    
    
    <!-- What name can we use for the identity verification statement? -->
    <div class="inputContainer">
      <label for="verificationName-${userId}">What name can we use for the identity verification statement?</label>
      <input type="text" id="verificationName-${userId}" name="verificationName-${userId}" placeholder="Enter your official name"  />
    </div>
    
    <!-- Email Address -->
    <div class="inputContainer">
      <label for="email-${userId}">Email Address <span id="tooltip-email-${userId}"></span> </label>
      <input type="email" id="email-${userId}" name="email-${userId}" required placeholder="Enter email address" />
    </div>
    
    <!-- Date of Birth -->
    <div class="inputContainer">
      <label for="dob-${userId}">Date of Birth:</label>
      <input type="text" class="date-field" id="dob-${userId}" name="dob-${userId}" placeholder="Select date (Date Month Year)" />
    </div>
    
    <!-- Are you a UK Resident? -->
    <div class="inputContainer">
      <label for="ukResident-${userId}">Are you a UK Resident?</label>
      <input type="radio" id="ukResidentYes-${userId}" name="ukResident-${userId}" value="yes" checked> Yes
      <input type="radio" id="ukResidentNo-${userId}" name="ukResident-${userId}" value="no"> No
    </div>
  `;
  const tooltipSpan = section.querySelector(`#tooltip-email-${userId}`);
  if (tooltipSpan) {
    tooltipSpan.appendChild(
      createInfoTooltip("This email will be submitted to the Companies House for identity verification.")
    );
  }

  
  // Ensure toggleNameFields is called after rendering the form
  setTimeout(() => {
    const dobInput = section.querySelector(`#dob-${userId}`);
    if (dobInput && window.flatpickr) {
      flatpickr(dobInput, {
        dateFormat: "d M Y",
        allowInput: true
      });
    }
  }, 50);
    // Increased delay to ensure the DOM is ready
  
  return section;

  
}
// 🔒 Add validation listeners
export function bindPersonalDetailsValidation(userId) {
  const namePattern = /^[A-Za-z\s'-]+$/;

  const nameFields = [
    `firstName-${userId}`,
    `middleName-${userId}`,
    `lastName-${userId}`,
    `verificationName-${userId}`
  ];

  nameFields.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        if (input.value && !namePattern.test(input.value)) {
          input.setCustomValidity("Only letters, spaces, hyphens, and apostrophes allowed.");
          input.classList.add('invalid');
          input.classList.remove('valid');
        } else if (input.value) {
          input.setCustomValidity('');
          input.classList.remove('invalid');
          input.classList.add('valid');
        } else {
          // Empty (optional): remove both classes
          input.setCustomValidity('');
          input.classList.remove('invalid', 'valid');
        }
      });
    }
  });

  const emailInput = document.getElementById(`email-${userId}`);
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.setCustomValidity(''); // Always clear first
      if (emailInput.value) {
        if (!emailInput.checkValidity()) {
          emailInput.setCustomValidity("Enter a valid email address.");
          emailInput.classList.add('invalid');
          emailInput.classList.remove('valid');
        } else {
          emailInput.classList.remove('invalid');
          emailInput.classList.add('valid');
        }
      } else {
        // If empty, just clear styles and let HTML5 required handle it
        emailInput.classList.remove('invalid', 'valid');
      }
    });
  }
}


