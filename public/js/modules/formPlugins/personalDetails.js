// personalDetails.js

import { toggleNameFields } from './samePersonLogic.js'; // Import the toggleNameFields function

// Function to create the Personal Details Section for each user
export function createPersonalDetailsSection(userId) {
  const section = document.createElement('div');
  section.classList.add('personal-details-section');
  
  // Create the HTML structure for the personal details
  section.innerHTML = `
    <h3>Personal Details - User ${userId}</h3>
    
    <!-- Name Fields Section -->
    <div class="nameFields" id="nameFields-${userId}">
    
      <!-- First Name -->
      <div class="inputContainer">
        <label for="firstName-${userId}">First Name:</label>
        <input type="text" id="firstName-${userId}" name="firstName-${userId}" required />
      </div>
    
      <!-- Middle Name -->
      <div class="inputContainer">
        <label for="middleName-${userId}">Middle Name:</label>
        <input type="text" id="middleName-${userId}" name="middleName-${userId}" />
      </div>
    
      <!-- Last Name -->
      <div class="inputContainer">
        <label for="lastName-${userId}">Last Name:</label>
        <input type="text" id="lastName-${userId}" name="lastName-${userId}" required />
      </div>
    
    </div>
    
    <!-- Can we use this name in the identity verification statement? -->
    <div class="inputContainer">
      <label for="samePerson-${userId}">Can we use this name in the identity verification statement for this person?</label>
      <input type="radio" id="samePersonYes-${userId}" name="samePerson-${userId}" value="yes" checked disabled> Yes
      <input type="radio" id="samePersonNo-${userId}" name="samePerson-${userId}" value="no" disabled> No, I need to provide a different name
    </div>
    
    <!-- Name Fields to be duplicated if "No" is selected -->
    <div class="inputContainer" id="samePerson-nameFields-${userId}" style="display: none;">
      <h4>Additional Name Information</h4>
    <div class="nameFields">
      <!-- First Name -->
      <div class="inputContainer">
        <label for="firstName-different-${userId}">First Name:</label>
        <input type="text" id="firstName-different-${userId}" name="firstName-different-${userId}" required />
      </div>
    
      <!-- Middle Name -->
      <div class="inputContainer">
        <label for="middleName-different-${userId}">Middle Name:</label>
        <input type="text" id="middleName-different-${userId}" name="middleName-different-${userId}" />
      </div>
    
      <!-- Last Name -->
      <div class="inputContainer">
        <label for="lastName-different-${userId}">Last Name:</label>
        <input type="text" id="lastName-different-${userId}" name="lastName-different-${userId}" required />
      </div>
    </div>
    </div>
    
    <!-- What name can we use for the identity verification statement? -->
    <div class="inputContainer">
      <label for="verificationName-${userId}">What name can we use for the identity verification statement?</label>
      <input type="text" id="verificationName-${userId}" name="verificationName-${userId}" placeholder="Enter the name"  />
    </div>
    
    <!-- Email Address -->
    <div class="inputContainer">
      <label for="email-${userId}">Email Address:</label>
      <input type="email" id="email-${userId}" name="email-${userId}" required placeholder="Enter email address" />
    </div>
    
    <!-- Date of Birth -->
    <div class="inputContainer">
      <label for="dob-${userId}">Date of Birth:</label>
      <input type="date" id="dob-${userId}" name="dob-${userId}" placeholder="dd/mm/yyyy" required />
    </div>
    
    <!-- Are you a UK Resident? -->
    <div class="inputContainer">
      <label for="ukResident-${userId}">Are you a UK Resident?</label>
      <input type="radio" id="ukResidentYes-${userId}" name="ukResident-${userId}" value="yes"> Yes
      <input type="radio" id="ukResidentNo-${userId}" name="ukResident-${userId}" value="no"> No
    </div>
  `;
  
  // Ensure toggleNameFields is called after rendering the form
  setTimeout(() => {
    toggleNameFields(userId);
    bindValidationListeners(userId)
  }, 50);  // Increased delay to ensure the DOM is ready
  
  return section;

  
}
// 🔒 Add validation listeners
function bindValidationListeners(userId) {
  const namePattern = /^[A-Za-z\s'-]+$/;
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const fieldsToValidate = [
    `firstName-${userId}`,
    `middleName-${userId}`,
    `lastName-${userId}`,
    `firstName-different-${userId}`,
    `middleName-different-${userId}`,
    `lastName-different-${userId}`,
    `verificationName-${userId}`,
  ];

  fieldsToValidate.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        if (input.value && !namePattern.test(input.value)) {
          input.setCustomValidity('Only letters, spaces, hyphens, and apostrophes allowed');
        } else {
          input.setCustomValidity('');
        }
        input.reportValidity(); // Show prompt immediately
      });
    }
  });

  const emailInput = document.getElementById(`email-${userId}`);
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (!emailPattern.test(emailInput.value)) {
        emailInput.setCustomValidity('Enter a valid email address');
      } else {
        emailInput.setCustomValidity('');
      }
      emailInput.reportValidity(); // Show prompt immediately
    });
  }

  const dobInput = document.getElementById(`dob-${userId}`);
  if (dobInput) {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0]; // today
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0]; // 100 years ago

    dobInput.setAttribute('max', maxDate);
    dobInput.setAttribute('min', minDate);

    dobInput.addEventListener('change', () => {
      const selectedDate = new Date(dobInput.value);
      const now = new Date();
      const min = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());

      if (selectedDate > now) {
        dobInput.setCustomValidity('Date of birth cannot be in the future');
      } else if (selectedDate < min) {
        dobInput.setCustomValidity('Date of birth cannot be more than 100 years ago');
      } else {
        dobInput.setCustomValidity('');
      }
      dobInput.reportValidity(); // Show prompt
    });
  }
}

