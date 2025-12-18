// index.js

import { createPersonalDetailsSection, bindPersonalDetailsValidation } from './personalDetails.js';
import { createAddressSection, bindAddressDetailsValidation } from './addressDetails.js';
import { createDocumentDetailsSection, hasAtLeastTwoDocumentsSelected } from './documentDetails.js';
import { collectAndSendFormData } from './collectAndSendFormData.js';
import { createInfoTooltip } from './tooltip.js';
// import { createFaceVerificationSection } from './faceVerificationSection.js';


document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('ukpa-idv-form-container');
  if (container) {
    container.innerHTML = `
      <!-- First Fold: Setup Step -->
      <div id="setupStep">
        <h2>UK Identity Verification Form</h2>
        <div class="requirement-box" style="padding:1em;margin-bottom:1.5em;background:#e3e3e354;">
          <b>About UK ID Verification</b>
          <p>The <a href="/a-complete-guide-to-identity-verification-in-uk/" target="_blank">Identity Verification</a> process brought up the Companies house requires the users to confirm their identity with them. This has been brought by the Companies house to maintain security and prevent fraud.</p>
          <b>Document Submission Requirement</b>
          <p>To complete the verification process, <b>you must provide a total of two identity documents</b>.
        </div>
        <div class="inputContainer">
          <label for="filerFullName">Your Full Name:</label>
          <input type="text" id="filerFullName" name="filerFullName" required placeholder="Enter your full name" />
        </div>
        <div class="inputContainer">
          <label for="filerEmail">Official Email:
            <info-tooltip>This email will be the official point of contact between the user and UKPA team.</info-tooltip>
          </label>
          <input type="email" id="filerEmail" name="filerEmail" required placeholder="Enter your email address" />
        </div>
        <div class="inputContainer">
          <label for="filerContactNumber">Contact Number:</label>
          <input type="tel" id="filerContactNumber" name="filerContactNumber" required placeholder="Enter your contact number" />
        </div>
        <div class="inputContainer">
          <label for="setupNumUsers">Number of users you are filing for:</label>
          <select id="setupNumUsers">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div id="userNamesContainer"></div>
        <div class="consent-box">
          <input type="checkbox" id="consentCheckbox" name="consentCheckbox" required />
          <label style="cursor:pointer;" for="consentCheckbox">I hereby confirm that the the engagement letter and invoice will be sent to the email address provided. The individual completing this form will be considered the primary contact and will assume responsibility for the roles, actions, and information of any additional users included in this submission.</label>
        </div>
        <button id="startFilingBtn" type="button">Start Filing</button>
      </div>
      <div id="formContainer">
        <form id="dynamicForm">
          <!-- Personal details and other sections will be rendered here -->
          <div id="livenessContainer"></div>
        </form>
        <!-- Pagination Controls -->
        <div id="pagination">
          <button id="prevBtn" class="navigationBtn" disabled>Previous</button>
          <button id="nextBtn" class="navigationBtn" disabled>Next</button>
          <button id="submitBtn" class="navigationBtn" style="display:none;">Submit</button>
          <div id="submitLoader" class="loader" style="display:none;vertical-align:middle;"></div>
          <span id="submitLoaderText" style="display:none;vertical-align:middle;margin-left:8px;font-weight:500;color:#ff3d00;">Validating and uploading documents...</span>
        </div>
      </div>
      <!-- Fullscreen Loader Overlay -->
      <div id="submitOverlay" style="display:none;position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.85);backdrop-filter:blur(2px);">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
          <div class="loader" style="margin:auto;"></div>
          <div id="submitOverlayText" style="margin-top:24px;font-size:1.2em;font-weight:600;color:#ff3d00;">Validating and uploading documents...</div>
          <div id="submitOverlayText" style="margin-top:24px;font-size:1em;font-weight:400;color:#000000;">You will be redirected to the payment method. Please hold on...</div>
        </div>
      </div>
    `;
  }
  // Tooltip for main email
  const tooltipSpan = document.getElementById('tooltip-email-main');
  if (tooltipSpan) {
    tooltipSpan.appendChild(
      createInfoTooltip("This email will be the official point of contact between the user and UKPA team.")
    );
  }
  flatpickr(".date-field", {
    dateFormat: "d/m/Y",   // or your preferred format, e.g. "Y-m-d"
    allowInput: true
  });
  const setupNumUsers = document.getElementById('setupNumUsers');
  const dynamicForm = document.getElementById('dynamicForm');
  let prevBtn = document.getElementById('prevBtn');
  let nextBtn = document.getElementById('nextBtn');
  let submitBtn = document.getElementById('submitBtn');
  const setupStep = document.getElementById('setupStep');
  const userNamesContainer = document.getElementById('userNamesContainer');
  const startFilingBtn = document.getElementById('startFilingBtn');
  const filerFullName = document.getElementById('filerFullName');
  const filerEmail = document.getElementById('filerEmail');
  const filerContactNumber = document.getElementById('filerContactNumber');
  const pagination = document.getElementById('pagination');
  const formContainer = document.getElementById('formContainer');

  let totalUsers = 0;
  let currentUserIndex = 0;
  let userForms = [];
  let userNames = [];

  if (setupStep) setupStep.style.display = '';
  if (formContainer) formContainer.style.display = 'none';

  function renderUserNamesInputs(userCount) {
    userNames = [];
    userNamesContainer.innerHTML = '';

    // Remove the checkbox if it's already added
    const existingCheckboxDiv = document.querySelector('.checkboxContainer');
    if (existingCheckboxDiv) {
      existingCheckboxDiv.remove();
    }

    if (userCount >= 1) {
      const label = document.createElement('label');
      label.textContent = 'Enter respective names of users';
      userNamesContainer.appendChild(label);

      for (let i = 1; i <= userCount; i++) {
        const div = document.createElement('div');
        div.className = 'inputContainer';
        div.style.position = 'relative';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `userNameInput-${i}`;
        input.name = `userNameInput-${i}`;
        input.placeholder = `User ${i} Name`;
        input.required = true;
        input.style.boxSizing = 'border-box';
        input.addEventListener('input', () => {
          userNames[i - 1] = input.value;
          updateUserNameDisplays(i, input.value);

          const namePattern = /^[a-zA-Z\s]{2,}$/;
          if (namePattern.test(input.value.trim())) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            input.setCustomValidity('');
          } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            input.setCustomValidity('Only letters and spaces are allowed.');
          }
        });
        div.appendChild(input);
        userNamesContainer.appendChild(div);
        userNames.push('');
      }

      // Add the checkbox only when the number of users is 1
      if (userCount === 1) {
        if (filerFullName) {
          filerFullName.addEventListener('input', toggleCheckboxVisibility);
          toggleCheckboxVisibility();
        }
      }
    } else {
      userNamesContainer.innerHTML = '';
      userNames = [''];
    }
  }

  // Render or remove the checkbox inside User 1 input
  function toggleCheckboxVisibility() {
    const filerFullNameValue = filerFullName ? filerFullName.value.trim() : '';
    const user1Input = document.getElementById('userNameInput-1');
    const inputContainer = user1Input ? user1Input.parentNode : null;
    const existingCheckboxDiv = inputContainer ? inputContainer.querySelector('.checkboxContainer') : null;

    if (filerFullNameValue !== '' && user1Input && inputContainer) {
      if (!existingCheckboxDiv) {
        user1Input.style.paddingRight = '170px';
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkboxContainer';
        checkboxDiv.style.position = 'absolute';
        checkboxDiv.style.top = '50%';
        checkboxDiv.style.right = '8px';
        checkboxDiv.style.transform = 'translateY(-50%)';
        checkboxDiv.style.display = 'flex';
        checkboxDiv.style.alignItems = 'center';
        checkboxDiv.style.background = '#fff';
        checkboxDiv.style.padding = '0 4px';
        checkboxDiv.style.zIndex = '2';

        const checkboxLabel = document.createElement('label');
        checkboxLabel.style.cursor = 'pointer';
        checkboxLabel.htmlFor = 'filingForMyself';
        checkboxLabel.style.fontSize = '0.95em';
        checkboxLabel.style.marginBottom = '0';
        checkboxLabel.style.whiteSpace = 'nowrap';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'filingForMyself';
        checkbox.name = 'filingForMyself';
        checkbox.style.marginRight = '4px';
        checkbox.addEventListener('change', (e) => handleCheckboxChange(e));

        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode('I am filing for myself'));
        checkboxDiv.appendChild(checkboxLabel);

        inputContainer.appendChild(checkboxDiv);
      }
    } else {
      if (existingCheckboxDiv && user1Input) {
        existingCheckboxDiv.remove();
        user1Input.style.paddingRight = '';
      }
    }
  }

  function handleCheckboxChange(event) {
    const filerNameInput = document.querySelector('#filerFullName');
    const userNameInput = document.querySelector(`#userNameInput-1`);
    if (event.target.checked) {
      const name = filerNameInput ? filerNameInput.value.trim() : '';
      userNames[0] = name;
      if (userNameInput) userNameInput.value = name;
      updateUserNameDisplays(1, name);
      const namePattern = /^[a-zA-Z\s]{2,}$/;
      if (namePattern.test(name)) {
        userNameInput.classList.remove('invalid');
        userNameInput.classList.add('valid');
        userNameInput.setCustomValidity('');
      } else {
        userNameInput.classList.remove('valid');
        userNameInput.classList.add('invalid');
        userNameInput.setCustomValidity('Only letters and spaces are allowed.');
      }
    } else {
      userNames[0] = '';
      if (userNameInput) userNameInput.value = '';
      userNameInput.classList.remove('valid', 'invalid');
      userNameInput.setCustomValidity('');
      updateUserNameDisplays(1, '');
    }
  }

  // Add null check before filerFullName.addEventListener
  if (filerFullName) {
    filerFullName.addEventListener('input', () => {
      const checkbox = document.querySelector('#filingForMyself');
      const userNameInput = document.querySelector(`#userNameInput-1`);
      if (checkbox && checkbox.checked) {
        const fullNameValue = filerFullName.value.trim();
        userNames[0] = fullNameValue;
        if (userNameInput) userNameInput.value = fullNameValue;
        updateUserNameDisplays(1, fullNameValue);
      }
    });
  }

  function updateUserNameDisplays(userIndex, newName) {
    const personalHeader = document.querySelector(`#userSection-${userIndex} .personal-details-section h3`);
    if (personalHeader) personalHeader.textContent = `Personal Details - ${newName || 'User ' + userIndex}`;
    const addressHeader = document.querySelector(`#userSection-${userIndex} .address-section h3`);
    if (addressHeader) addressHeader.textContent = `Home Address - ${newName || 'User ' + userIndex}`;
    const docHeader = document.querySelector(`#userSection-${userIndex} .document-details-section h3`);
    if (docHeader) docHeader.textContent = `Identity Documents - ${newName || 'User ' + userIndex}`;
  }

  function generateUserForms(userCount) {
    totalUsers = userCount;
    currentUserIndex = 0;
    userForms = [];

    dynamicForm.innerHTML = '';
    if (formContainer) formContainer.style.display = '';
    if (pagination) {
      pagination.style.display = '';
      prevBtn.disabled = false;
      prevBtn.style.display = '';
    }
    setupStep.style.display = 'none';

    for (let i = 1; i <= userCount; i++) {
      const userSection = document.createElement('div');
      userSection.classList.add('user-section');
      userSection.id = `userSection-${i}`;

      const displayName = userNames[i-1] || `User ${i}`;
      userSection.appendChild(createPersonalDetailsSection(i, displayName));
      userSection.appendChild(createAddressSection(i, displayName));
      userSection.appendChild(createDocumentDetailsSection(i, displayName));
      // Add hidden remoteFaceVerification checkbox
      const hiddenRemoteCheckbox = document.createElement('input');
      hiddenRemoteCheckbox.type = 'checkbox';
      hiddenRemoteCheckbox.id = `remoteFaceVerification-${i}`;
      hiddenRemoteCheckbox.name = `remoteFaceVerification-${i}`;
      hiddenRemoteCheckbox.checked = true;
      hiddenRemoteCheckbox.style.display = 'none';
      userSection.appendChild(hiddenRemoteCheckbox);

      if (i !== 1) {
        userSection.style.display = 'none';
      }

      userForms.push(userSection);
      dynamicForm.appendChild(userSection);

      bindPersonalDetailsValidation(i);
      bindAddressDetailsValidation(i);
    }

    updatePaginationButtons();

    // Remove previous event listeners by replacing the buttons
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    nextBtn = newNextBtn;
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    prevBtn = newPrevBtn;

    nextBtn.addEventListener('click', () => {
      const currentFormSection = userForms[currentUserIndex];
      const allInputs = currentFormSection.querySelectorAll('input');
      let isValid = true;
      allInputs.forEach((input) => {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
        }
      });
      // ADD DOCUMENT CHECK HERE:
      const userId = currentUserIndex + 1;
      if (!hasAtLeastTwoDocumentsSelected(userId)) {
        const docSection = document.querySelector(`#userSection-${userId} .document-details-section`);
        if (docSection && !docSection.querySelector('.doc-select-error')) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'doc-select-error';
          errorDiv.style.color = '#b00';
          errorDiv.style.marginBottom = '1em';
          errorDiv.style.fontWeight = 'bold';
          errorDiv.textContent = 'Please select at least two documents before proceeding.';
          docSection.prepend(errorDiv);
        }
        docSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      } else {
        const docSection = document.querySelector(`#userSection-${userId} .document-details-section`);
        const errorDiv = docSection && docSection.querySelector('.doc-select-error');
        if (errorDiv) errorDiv.remove();
      }
      if (!isValid) {
        return;
      }
      if (currentUserIndex < totalUsers - 1) {
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex++;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
        const formTop = userForms[currentUserIndex].offsetTop;
        window.scrollTo({ top: formTop > 0 ? formTop : 0, behavior: 'smooth' });
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentUserIndex === 0) {
        if (formContainer) formContainer.style.display = 'none';
        setupStep.style.display = '';
        if (pagination) pagination.style.display = 'none';
        const setupTop = setupStep.offsetTop;
        window.scrollTo({ top: setupTop > 0 ? setupTop : 0, behavior: 'smooth' });
      } else if (currentUserIndex > 0) {
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex--;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
        if (pagination) {
          pagination.style.display = '';
          prevBtn.disabled = false;
          prevBtn.style.display = '';
        }
        const formTop = userForms[currentUserIndex].offsetTop;
        window.scrollTo({ top: formTop > 0 ? formTop : 0, behavior: 'smooth' });
      }
    });
  }

  function updatePaginationButtons() {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    if (currentUserIndex === totalUsers - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = '';
    } else {
      nextBtn.style.display = '';
      submitBtn.style.display = 'none';
    }

    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    nextBtn = newNextBtn;

    if (currentUserIndex < totalUsers - 1) {
      nextBtn.addEventListener('click', () => {
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex++;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
        const formTop = userForms[currentUserIndex].offsetTop;
        window.scrollTo({ top: formTop > 0 ? formTop : 0, behavior: 'smooth' });
      });
    }

    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    submitBtn = newSubmitBtn;
    if (currentUserIndex === totalUsers - 1) {
      submitBtn.addEventListener('click', async () => {
        const currentFormSection = userForms[currentUserIndex];
        const allInputs = currentFormSection.querySelectorAll('input, select, textarea');
        for (let input of allInputs) {
          if (!input.checkValidity()) {
            input.reportValidity();
            return;
          }
        }
        const userId = currentUserIndex + 1;
        if (!hasAtLeastTwoDocumentsSelected(userId)) {
          const docSection = document.querySelector(`#userSection-${userId} .document-details-section`);
          if (docSection && !docSection.querySelector('.doc-select-error')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'doc-select-error';
            errorDiv.style.color = '#b00';
            errorDiv.style.marginBottom = '1em';
            errorDiv.style.fontWeight = 'bold';
            errorDiv.textContent = 'Please select at least two documents before submitting.';
            docSection.prepend(errorDiv);
          }
          docSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        } else {
          const docSection = document.querySelector(`#userSection-${userId} .document-details-section`);
          const errorDiv = docSection && docSection.querySelector('.doc-select-error');
          if (errorDiv) errorDiv.remove();
        }
        const overlay = document.getElementById('submitOverlay');
        submitBtn.disabled = true;
        if (overlay) overlay.style.display = 'block';
        const beforeUnloadHandler = (e) => {
          e.preventDefault();
          e.returnValue = 'Submission is in progress. Are you sure you want to leave?';
          return e.returnValue;
        };
        window.__submissionBeforeUnloadHandler = beforeUnloadHandler;
        window.addEventListener('beforeunload', beforeUnloadHandler);
        try {
          await collectAndSendFormData(totalUsers);
        } finally {
          if (overlay) overlay.style.display = 'none';
          submitBtn.disabled = false;
          window.removeEventListener('beforeunload', beforeUnloadHandler);
        }
      });
    }
  }

  if (setupNumUsers) {
    setupNumUsers.addEventListener('change', (e) => {
      const selectedCount = parseInt(e.target.value);
      renderUserNamesInputs(selectedCount);
      if (dynamicForm) dynamicForm.style.display = 'none';
      if (setupStep) setupStep.style.display = '';
    });
    setupNumUsers.addEventListener('change', (e) => {
      const userCount = parseInt(e.target.value);
      renderUserNamesInputs(userCount);
    });
  }

  if (setupNumUsers) {
    renderUserNamesInputs(parseInt(setupNumUsers.value));
  }

  // Add real-time validation for setup step fields
  const setupFilerFullName = document.getElementById('filerFullName');
  const setupFilerEmail = document.getElementById('filerEmail');
  const setupFilerContactNumber = document.getElementById('filerContactNumber');
  const setupConsentCheckbox = document.getElementById('consentCheckbox');

  if (setupFilerFullName) {
    setupFilerFullName.addEventListener('input', () => {
      const namePattern = /^[a-zA-Z\s]{2,}$/;
      const value = setupFilerFullName.value.trim();
      if (namePattern.test(value)) {
        setupFilerFullName.classList.remove('invalid');
        setupFilerFullName.classList.add('valid');
        setupFilerFullName.setCustomValidity('');
      } else {
        setupFilerFullName.classList.remove('valid');
        setupFilerFullName.classList.add('invalid');
        setupFilerFullName.setCustomValidity('Name must contain only letters and spaces.');
      }
    });
    setupFilerFullName.addEventListener('blur', () => {
      // setupFilerFullName.reportValidity();
    });
  }

  if (setupFilerEmail) {
    setupFilerEmail.addEventListener('input', () => {
      setupFilerEmail.checkValidity();
    });
    setupFilerEmail.addEventListener('blur', () => {
      // setupFilerEmail.reportValidity();
    });
  }

  if (setupFilerContactNumber) {
    setupFilerContactNumber.addEventListener('input', () => {
      const phonePattern = /^[\d\s\-\+\(\)]{10,}$/;
      const value = setupFilerContactNumber.value.trim();
      if (phonePattern.test(value)) {
        setupFilerContactNumber.classList.remove('invalid');
        setupFilerContactNumber.classList.add('valid');
        setupFilerContactNumber.setCustomValidity('');
      } else {
        setupFilerContactNumber.classList.remove('valid');
        setupFilerContactNumber.classList.add('invalid');
        setupFilerContactNumber.setCustomValidity('Please enter a valid contact number (at least 10 digits).');
      }
    });
    setupFilerContactNumber.addEventListener('blur', () => {
      // setupFilerContactNumber.reportValidity();
    });
  }

  if (setupConsentCheckbox) {
    setupConsentCheckbox.addEventListener('change', () => {
      setupConsentCheckbox.checkValidity();
    });
  }

  if (startFilingBtn) {
    startFilingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const filerFullName = document.getElementById('filerFullName');
      const filerEmail = document.getElementById('filerEmail');
      const filerContactNumber = document.getElementById('filerContactNumber');
      const consentCheckbox = document.getElementById('consentCheckbox');
      const userCount = parseInt(setupNumUsers.value);
      const fieldsToValidate = [
        filerFullName,
        filerEmail,
        filerContactNumber,
        consentCheckbox,
        ...Array.from({ length: userCount }, (_, i) =>
          document.getElementById(`userNameInput-${i + 1}`)
        )
      ];
      for (let field of fieldsToValidate) {
        if (field && !field.checkValidity()) {
          field.reportValidity();
          return;
        }
      }
      if (setupStep) setupStep.style.display = 'none';
      if (formContainer) formContainer.style.display = '';
      if (dynamicForm) dynamicForm.style.display = '';
      generateUserForms(userCount);
    });
  }
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'nextBtn') {
    console.log('Global: Next button was clicked!');
  }
});

export function setSubmitOverlayMessage(msg) {
  const overlayText = document.getElementById('submitOverlayText');
  if (overlayText) overlayText.textContent = msg;
}

// InfoTooltip Web Component for consistent tooltips
class InfoTooltip extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        .tooltip-container {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          max-width: 100%;
        }
        .icon {
          cursor: pointer;
        }
        /* Desktop tooltip styles - natural width, no forced breaking */
        .tooltip {
          position: absolute;
          top: -0.5em;
          left: 2.5em;
          background: #e3e3e3a8;
          padding: 0.5em 0.875em;
          border: 1px solid #e3e3e3;
          border-radius: 0.5em;
          font-size: 0.85em;
          white-space: normal;
          width: max-content;
          min-width: 200px;
          word-wrap: normal;
          overflow-wrap: normal;
          word-break: normal;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          z-index: 1000;
          box-sizing: border-box;
          line-height: 1.5;
        }
        .tooltip-container:hover .tooltip {
          opacity: 1;
          pointer-events: auto;
        }
        /* Mobile responsive - prevent overflow only on small screens */
        @media (max-width: 600px) {
          .tooltip {
            width: 210px;
            white-space: normal;
          }
        }
      </style>
      <span class="tooltip-container">
        <span class="icon">
          <img src="https://cdn-icons-png.flaticon.com/512/471/471664.png" width="18" alt="Info" />
        </span>
        <span class="tooltip"><slot></slot></span>
      </span>
    `;
  }
}
if (!customElements.get('info-tooltip')) {
  customElements.define('info-tooltip', InfoTooltip);
}