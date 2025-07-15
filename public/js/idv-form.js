// ID Verification Form Main JavaScript
// This file imports and initializes the form modules

// Import functions from the form modules
import { createPersonalDetailsSection } from './modules/formPlugins/personalDetails.js';
import { createAddressSection } from './modules/formPlugins/addressDetails.js';
import { createDocumentDetailsSection } from './modules/formPlugins/documentDetails.js';
import { toggleNameFields } from './modules/formPlugins/samePersonLogic.js';
import { collectAndSendFormData } from './modules/formPlugins/collectAndSendFormData.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in the ID verification form container
    const formContainer = document.getElementById('ukpa-idv-form-container');
    if (!formContainer) {
        return; // Not on the ID verification form page
    }

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
    const formContainerDiv = document.getElementById('formContainer');

    let totalUsers = 0;
    let currentUserIndex = 0;
    let userForms = [];

    // Debug logs for troubleshooting
    console.log('[DEBUG] On page load:');
    console.log('formContainerDiv:', formContainerDiv);
    console.log('setupStep:', setupStep);

    // On initial load, show only setupStep, hide formContainer
    setupStep.style.display = '';
    if (formContainerDiv) formContainerDiv.style.display = 'none';

    // Function to generate the forms for the selected number of users
    function generateUserForms(userCount) {
        // Debug log
        console.log('[DEBUG] In generateUserForms');
        console.log('formContainerDiv:', formContainerDiv);
        totalUsers = userCount;
        currentUserIndex = 0;
        userForms = [];

        dynamicForm.innerHTML = '';
        if (formContainerDiv) formContainerDiv.style.display = '';
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
                if (formContainerDiv) formContainerDiv.style.display = 'none';
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
                input.id = `userName-${i}`;
                input.name = `userName-${i}`;
                input.placeholder = `User ${i} Name`;
                input.required = true;
                const label = document.createElement('label');
                label.htmlFor = `userName-${i}`;
                label.textContent = `User ${i} Name:`;
                div.appendChild(label);
                div.appendChild(input);
                userNamesContainer.appendChild(div);
            }
        }
    }

    // Start filing button event listener
    startFilingBtn.addEventListener('click', () => {
        // Debug log
        console.log('[DEBUG] Start Filing button clicked');
        console.log('formContainerDiv before generateUserForms:', formContainerDiv);
        console.log('setupStep before generateUserForms:', setupStep);
        // Validate setup form
        if (!filerFullName.value.trim()) {
            alert('Please enter your full name');
            filerFullName.focus();
            return;
        }
        if (!filerEmail.value.trim()) {
            alert('Please enter your email address');
            filerEmail.focus();
            return;
        }
        
        const selectedCount = parseInt(setupNumUsers.value);
        if (selectedCount > 1) {
            // Validate user names if multiple users
            let allNamesValid = true;
            for (let i = 1; i <= selectedCount; i++) {
                const userNameInput = document.getElementById(`userName-${i}`);
                if (!userNameInput || !userNameInput.value.trim()) {
                    alert(`Please enter a name for User ${i}`);
                    if (userNameInput) userNameInput.focus();
                    allNamesValid = false;
                    break;
                }
            }
            if (!allNamesValid) return;
        }
        
        generateUserForms(selectedCount);
    });

    // Custom element for info tooltip
    class InfoTooltip extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        position: relative;
                        display: inline-block;
                        margin-left: 5px;
                        cursor: help;
                    }
                    .tooltip-icon {
                        background: #007cba;
                        color: white;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .tooltip-content {
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #333;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        white-space: nowrap;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s ease;
                        z-index: 1000;
                    }
                    :host(:hover) .tooltip-content {
                        opacity: 1;
                        visibility: visible;
                    }
                </style>
                <div class="tooltip-icon">?</div>
                <div class="tooltip-content">
                    <slot></slot>
                </div>
            `;
        }
    }

    // Register the custom element
    if (!customElements.get('info-tooltip')) {
        customElements.define('info-tooltip', InfoTooltip);
    }

    // Initialize the form
    console.log('ID Verification Form initialized');
}); 