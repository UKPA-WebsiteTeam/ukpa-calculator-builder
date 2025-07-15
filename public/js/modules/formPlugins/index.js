// index.js

// Import functions from the other module files
import { createPersonalDetailsSection } from './personalDetails.js';
import { createAddressSection } from './addressDetails.js';
import { createDocumentDetailsSection } from './documentDetails.js';
import { toggleNameFields } from './samePersonLogic.js'; // Import the toggleNameFields function
import { collectAndSendFormData } from './collectAndSendFormData.js';

document.addEventListener('DOMContentLoaded', () => {
  const setupNumUsers = document.getElementById('setupNumUsers');
  const dynamicForm = document.getElementById('dynamicForm');
  let prevBtn = document.getElementById('prevBtn');
  let nextBtn = document.getElementById('nextBtn');
  let submitBtn = document.getElementById('submitBtn');
  // Setup step elements
  const setupStep = document.getElementById('setupStep');
  const userNamesContainer = document.getElementById('userNamesContainer');
  const startFilingBtn = document.getElementById('startFilingBtn');
  const filerFullName = document.getElementById('filerFullName');
  const filerEmail = document.getElementById('filerEmail');
  const pagination = document.getElementById('pagination');
  const formContainer = document.getElementById('formContainer');

  let totalUsers = 0;
  let currentUserIndex = 0;
  let userForms = [];

  // On initial load, show only setupStep, hide formContainer
  setupStep.style.display = '';
  if (formContainer) formContainer.style.display = 'none';

  // Function to generate the forms for the selected number of users
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

      userSection.appendChild(createPersonalDetailsSection(i));
      userSection.appendChild(createAddressSection(i));
      userSection.appendChild(createDocumentDetailsSection(i));

      if (i !== 1) {
        userSection.style.display = 'none';
      }

      userForms.push(userSection);
      dynamicForm.appendChild(userSection);
    }

    bindEventsToDynamicElements();
    updatePaginationButtons();

    // Remove previous event listeners by replacing the buttons
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    nextBtn = newNextBtn;
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    prevBtn = newPrevBtn;

    // Attach new event listeners
    nextBtn.addEventListener('click', () => {
      console.log('Next clicked. currentUserIndex:', currentUserIndex, 'userForms:', userForms.map(f=>f.id));
      const currentFormSection = userForms[currentUserIndex];
      // Check validity of all inputs in the current section
      const allInputs = currentFormSection.querySelectorAll('input');
      let isValid = true;
      allInputs.forEach((input) => {
        if (!input.checkValidity()) {
          input.reportValidity(); // Shows native browser prompt
          isValid = false;
        }
      });
      if (!isValid) {
        return; // Stop if any validation fails
      }
      //Proceed to next user section
      if (currentUserIndex < totalUsers - 1) {
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex++;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
      }
    });

    prevBtn.addEventListener('click', () => {
      console.log('Prev clicked. currentUserIndex:', currentUserIndex, 'userForms:', userForms.map(f=>f.id));
      if (currentUserIndex === 0) {
        // On first user form: go back to setup step
        if (formContainer) formContainer.style.display = 'none';
        setupStep.style.display = '';
        if (pagination) pagination.style.display = 'none';
      } else if (currentUserIndex > 0) {
        // On other user forms: go to previous user
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex--;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
        if (pagination) {
          pagination.style.display = '';
          prevBtn.disabled = false;
          prevBtn.style.display = '';
        }
      }
    });
    console.log('User forms created:', userForms.map(f=>f.id));
  }

  // Function to create the Document Upload Section for each user
  // function createDocumentUploadSection(userId) {
  //   const section = document.createElement('div');
  //   section.classList.add('document-upload-section');
  //   section.innerHTML = `
  //     <h3>Document Upload - User ${userId}</h3>
  //     <label for="document-${userId}">Upload Document:</label>
  //     <input type="file" id="document-${userId}" name="document-${userId}" />
  //   `;
  //   return section;
  // }

  // ✅ FIXED: Pass userId instead of radio DOM element
  function bindEventsToDynamicElements() {
    document.querySelectorAll('input[name^="samePerson-"]').forEach(radio => {
      const userId = radio.name.split('-')[1];
      radio.addEventListener('change', () => toggleNameFields(userId));
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

    // Remove previous event listeners by replacing the buttons
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    nextBtn = newNextBtn;
    console.log('Next button replaced. Is it in DOM?', document.body.contains(nextBtn), 'currentUserIndex:', currentUserIndex);

    if (currentUserIndex < totalUsers - 1) {
      nextBtn.addEventListener('click', () => {
        console.log('Next button clicked. currentUserIndex before increment:', currentUserIndex);
        userForms[currentUserIndex].style.display = 'none';
        currentUserIndex++;
        userForms[currentUserIndex].style.display = 'block';
        updatePaginationButtons();
      });
    }

    // Remove previous event listeners by replacing the submit button
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    submitBtn = newSubmitBtn;
    if (currentUserIndex === totalUsers - 1) {
      submitBtn.addEventListener('click', () => {
        collectAndSendFormData(totalUsers);
      });
    }
  }

  setupNumUsers.addEventListener('change', (e) => {
    const selectedCount = parseInt(e.target.value);
    renderUserNamesInputs(selectedCount);
    // Optionally, reset the form view if needed
    dynamicForm.style.display = 'none';
    setupStep.style.display = '';
  });

  // Add this after DOMContentLoaded and variable declarations
  function renderUserNamesInputs(userCount) {
    userNamesContainer.innerHTML = '';
    if (userCount > 1) {
      const label = document.createElement('label');
      label.textContent = 'Enter each user\'s name:';
      userNamesContainer.appendChild(label);
      for (let i = 1; i <= userCount; i++) {
        const div = document.createElement('div');
        div.className = 'inputContainer';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `userNameInput-${i}`;
        input.name = `userNameInput-${i}`;
        input.placeholder = `User ${i} Name`;
        input.required = true;
        div.appendChild(input);
        userNamesContainer.appendChild(div);
      }
    } else {
      userNamesContainer.innerHTML = '';
    }
  }

  // Listen for changes on setupNumUsers
  setupNumUsers.addEventListener('change', (e) => {
    const userCount = parseInt(e.target.value);
    renderUserNamesInputs(userCount);
  });

  // Also render on initial load
  renderUserNamesInputs(parseInt(setupNumUsers.value));

  // Prevent proceeding if user names are missing (for >1 user)
  if (startFilingBtn) {
    startFilingBtn.addEventListener('click', (e) => {
      const userCount = parseInt(setupNumUsers.value);
      if (userCount > 1) {
        let allFilled = true;
        for (let i = 1; i <= userCount; i++) {
          const input = document.getElementById(`userNameInput-${i}`);
          if (!input || !input.value.trim()) {
            input && input.focus();
            allFilled = false;
            break;
          }
        }
        if (!allFilled) {
          e.preventDefault();
          alert('Please enter a name for each user.');
          return;
        }
      }
      // Hide setup, show form container, and generate forms
      setupStep.style.display = 'none';
      if (formContainer) formContainer.style.display = '';
      dynamicForm.style.display = '';
      generateUserForms(userCount);
    });
  }
});

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
        }
        .icon {
          cursor: pointer;
        }
        .tooltip {
          position: absolute;
          top: -0.5em;
          left: 2em;
          /* transform: translateX(50%) scale(0); */
          background: #e3e3e354;
          /* color: #fff; */
          padding: 0.3em 0.6em;
          border: 1px solid #e3e3e3;
          border-radius: 0.5em;
          font-size: 0.95em;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          z-index: 10;
        }
        .tooltip-container:hover .tooltip {
          opacity: 1;
          pointer-events: auto;
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
customElements.define('info-tooltip', InfoTooltip);

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'nextBtn') {
    console.log('Global: Next button was clicked!');
  }
});