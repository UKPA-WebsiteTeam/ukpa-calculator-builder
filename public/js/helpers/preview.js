import collectFormData from "../helpers/preview.js"

// Populate the preview section with collected form data
//   export function showPreview() {
//     const data = collectFormData(); // Gather data from the form

//     // Personal details preview
//     const personalPreview = `
//       <h3>Personal Details</h3>
//       <p>First Name: ${data.personal.firstName}</p>
//       <p>Middle Name: ${data.personal.middleName}</p>
//       <p>Last Name: ${data.personal.lastName}</p>
//       <p>Email: ${data.personal.email}</p>
//       <p>Date of Birth: ${data.personal.dob}</p>
//       <p>Statement Name: ${data.personal.statementName}</p>
//     `;
//     document.getElementById("personalPreview").innerHTML = personalPreview;

//     // Address details preview
//     const addressPreview = `
//       <h3>Address</h3>
//       <p>Address 1: ${data.address.address1}</p>
//       <p>Address 2: ${data.address.address2}</p>
//       <p>City: ${data.address.city}</p>
//       <p>State: ${data.address.state}</p>
//       <p>Country: ${data.address.country}</p>
//       <p>Postcode: ${data.address.postcode}</p>
//     `;
//     document.getElementById("addressPreview").innerHTML = addressPreview;

//     // Documents preview
//     let documentsPreview = `<h3>Documents</h3>`;
  
  

//     // Show the preview section and hide the form
//     document.getElementById("step3").style.display = "block";
//     document.getElementById("step2").style.display = "none";
//   }

//   export function goBackToStep2() {
//     document.getElementById("step3").style.display = "none"; // Hide Step 3
//     document.getElementById("step2").style.display = "block"; // Show Step 2
//   }
