import { collectFormData } from './collectFormData.js';

// Function to hide/show steps
function showStep(stepToShow) {
  const steps = ['step1', 'step2', 'step3'];

  // Hide all steps
  steps.forEach(step => {
    document.getElementById(step).style.display = "none";
  });

  // Show the target step
  document.getElementById(stepToShow).style.display = "block";
}

// Next step logic (Step 1 to Step 2)
export function nextStep() {
  showStep('step2'); // Show step 2 after clicking next on step 1
}

// Previous step logic (Step 2 to Step 1)
export function previousStep() {
  showStep('step1');  // Show step 1 after clicking previous on step 2
}

// Show Preview function (Step 2 to Step 3)
export function showPreview() {
  const data = collectFormData(); // Collect form data

  // Personal details preview
  const personalPreview = `
    <h3>Personal Details</h3>
    <p><strong>First Name:</strong> ${data.personal.firstName}</p>
    <p><strong>Middle Name:</strong> ${data.personal.middleName}</p>
    <p><strong>Last Name:</strong> ${data.personal.lastName}</p>
    <p><strong>Email:</strong> ${data.personal.email}</p>
    <p><strong>Date of Birth:</strong> ${data.personal.dob}</p>
    <p><strong>Statement Name:</strong> ${data.personal.statementName}</p>
  `;
  document.getElementById("personalPreview").innerHTML = personalPreview;

  // Address details preview
  const addressPreview = `
    <h3>Address</h3>
    <p><strong>Address 1:</strong> ${data.address.address1}</p>
    <p><strong>Address 2:</strong> ${data.address.address2}</p>
    <p><strong>City:</strong> ${data.address.city}</p>
    <p><strong>State:</strong> ${data.address.state}</p>
    <p><strong>Country:</strong> ${data.address.country}</p>
    <p><strong>Postcode:</strong> ${data.address.postcode}</p>
  `;
  document.getElementById("addressPreview").innerHTML = addressPreview;

  // Documents preview - Dynamically handling document fields
  let documentsPreview = `<h3>Documents</h3>`;

  // Display Group A Documents if selected
  if (data.documents.groupA.length > 0) {
    documentsPreview += `<p><strong>Group A Documents:</strong> ${data.documents.groupA.join(", ")}</p>`;
  }

  // Display Group B Documents if selected
  if (data.documents.groupB.length > 0) {
    documentsPreview += `<p><strong>Group B Documents:</strong> ${data.documents.groupB.join(", ")}</p>`;
  }

  // Loop through document fields (passportNumber, expiry, country, etc.)
  if (Object.keys(data.documents.fields).length > 0) {
    documentsPreview += `<p><strong>Other Fields:</strong></p>`;
    for (let [field, value] of Object.entries(data.documents.fields)) {
      // Only include Passport Number, Expiry Date, Country of Issue (adjust as needed)
      if (field === 'passportNumber' || field === 'passportExpiry' || field === 'passportCountry') {
        documentsPreview += `<p><strong>${formatFieldName(field)}:</strong> ${value}</p>`;
      }
    }
  }

  document.getElementById("documentsPreview").innerHTML = documentsPreview;

  // Show step 3 (preview)
  showStep('step3');
}

// Function to format field names for display (i.e., 'passportNumber' => 'Passport Number')
// function formatFieldName(field) {
//   switch (field) {
//     case 'passportNumber':
//       return 'Passport Number';
//     case 'passportExpiry':
//       return 'Expiry Date';
//     case 'passportCountry':
//       return 'Country of Issue';
//     default:
//       return field;
//   }
// }

// Go back to Step 2 (for editing)
export function goBackToStep2() {
  showStep('step2'); // Show step 2 when "edit" button is clicked
}
