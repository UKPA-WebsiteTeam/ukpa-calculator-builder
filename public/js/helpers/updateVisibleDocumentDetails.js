export function updateVisibleDocumentDetails() {
  const selectedCheckboxes = [
    ...document.querySelectorAll('#groupA-checkboxes input:checked, #groupB-checkboxes input:checked')
  ];

  const container = document.getElementById('document-details-container');
  const allDetails = container.querySelectorAll('.document-details');

  // Hide all fieldsets first
  allDetails.forEach(div => {
    div.classList.add('hidden');
    div.classList.remove('half-width');
  });

  if (selectedCheckboxes.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  selectedCheckboxes.forEach(cb => {
    const docValue = cb.value;
    const targetId = {
      passport: 'docDetails-passport',
      irish_passport: 'docDetails-irishPassport',
      biometric_id: 'docDetails-biometric_id',
      brp: 'docDetails-brp',
      brc: 'docDetails-brc',
      pass_card: 'docDetails-pass_card',
      tachograph: 'docDetails-tachograph',
      driving_license: 'docDetails-driving_license',
      armed_forces_id: 'docDetails-armed_forces_id',
      veteran_card: 'docDetails-veteran_card',
      frontier_permit: 'docDetails-frontier_permit',
      work_permit_photo: 'docDetails-work_permit_photo',
      immigration_doc: 'docDetails-immigration_doc',
      visa_photo: 'docDetails-visa_photo',
      firearms: 'docDetails-firearms',
      prado: 'docDetails-prado',
      birth_cert: 'docDetails-birth_cert',
      utility_bill: 'docDetails-utility_bill',
      bank_statement: 'docDetails-bank_statement',
      marrigate_certificate: 'docDetails-marrigate_certificate',
      immigration_document: 'docDetails-immigration_document',
      nonPhotographic_visa: 'docDetails-nonPhotographic_visa',
      nonPhotographic_workPermit: 'docDetails-nonPhotographic_workPermit',
      rental_agreement: 'docDetails-rental_agreement',
      tax_statement: 'docDetails-tax_statement',
    }[docValue];

    if (targetId) {
      const fieldset = document.getElementById(targetId);
      if (fieldset) {
        fieldset.classList.remove('hidden');
        if (selectedCheckboxes.length === 2) {
          fieldset.classList.add('half-width');
        }
      }
    }
  });
}
