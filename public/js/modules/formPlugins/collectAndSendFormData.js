
export async function collectAndSendFormData(totalUsers) {
  // Collect parent contact details from setup step
  const filer = {
    fullName: getValue('filerFullName'),
    email: getValue('filerEmail')
  };

  const users = [];

  for (let i = 1; i <= totalUsers; i++) {
    // Group fields for each user
    const personalDetails = {
      firstName: getValue(`firstName-${i}`),
      middleName: getValue(`middleName-${i}`),
      lastName: getValue(`lastName-${i}`),
      firstNameDifferent: getValue(`firstName-different-${i}`),
      middleNameDifferent: getValue(`middleName-different-${i}`),
      lastNameDifferent: getValue(`lastName-different-${i}`),
      verificationName: getValue(`verificationName-${i}`),
      email: getValue(`email-${i}`),
      dateOfBirth: getValue(`dob-${i}`),
      nationality: getValue(`nationality-${i}`),
      passportNumber: getValue(`passportNumber-${i}`),
      ukResident: getRadioValue(`ukResident-${i}`),
      samePerson: getRadioValue(`samePerson-${i}`)
    };

    const address = {
      streetAddress: getValue(`addressLine1-${i}`),
      addressLine2: getValue(`addressLine2-${i}`),
      city: getValue(`city-${i}`),
      county: getValue(`county-${i}`),
      country: getValue(`country-${i}`),
      postalCode: getValue(`postcode-${i}`)
    };

    const documents = {
      documentType1: getValue(`documentType1-${i}`),
      documentType2: getValue(`documentType2-${i}`),
      document1Uploaded: document.getElementById(`document1-${i}`)?.files?.length > 0,
      document2Uploaded: document.getElementById(`document2-${i}`)?.files?.length > 0,
      groupA: Array.from(document.querySelectorAll(`.groupA-checkbox[id$='-${i}']:checked`)).map(cb => cb.value),
      groupB: Array.from(document.querySelectorAll(`.groupB-checkbox[id$='-${i}']:checked`)).map(cb => cb.value),
      confirmDocs: document.getElementById(`confirmDocs-${i}`)?.checked || false
    };

    const userData = { personalDetails, address, documents };
    console.log(`Grouped data for user ${i}:`, userData);
    users.push(userData);
  }

  // Send to WordPress AJAX endpoint
  try {
    const formData = { filer, users };
    console.log('SENDING TO WORDPRESS AJAX:', formData);
    
    const formDataObj = new FormData();
    formDataObj.append('action', 'ukpa_idv_form_submit');
    formDataObj.append('nonce', ukpa_idv_form_data.nonce);
    formDataObj.append('form_data', JSON.stringify(formData));

    const response = await fetch(ukpa_idv_form_data.ajaxurl, {
      method: 'POST',
      body: formDataObj
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Form submitted successfully! Submission ID: ' + result.data.submission_id);
      
      // Optionally redirect to a thank you page or show success message
      // window.location.href = '/thank-you';
    } else {
      alert('Submission failed: ' + (result.data?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Submission error: ' + err.message);
  }
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name='${name}']:checked`);
  return checked ? checked.value : '';
} 