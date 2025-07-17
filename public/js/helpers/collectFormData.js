export class PersonalInfo {
  constructor({ firstName, middleName, lastName, email, dob, statementName }) {
    this.firstName = firstName.trim();
    this.middleName = middleName?.trim() || "";
    this.lastName = lastName.trim();
    this.email = email.trim().toLowerCase();
    this.dob = dob;
    this.statementName = statementName.trim();
  }
}

export class AddressInfo {
  constructor({ address1, address2, city, state, country, postcode }) {
    this.address1 = address1.trim();
    this.address2 = address2?.trim() || "";
    this.city = city.trim();
    this.state = state?.trim() || "";
    this.country = country.trim();
    this.postcode = postcode.trim().toUpperCase();
  }
}

export class DocumentInfo {
  constructor(documents) {
    this.groupA = documents.groupA || [];
    this.groupB = documents.groupB || [];
    this.fields = documents.fields || {};
  }
}

export function collectDocumentFields() {
  const fields = {};
  const container = document.querySelector("#document-details-container");
  container.querySelectorAll(".document-details:not(.hidden)").forEach(section => {
    const id = section.id;
    const docType = id.replace("docDetails-", "");
    fields[docType] = {};
    section.querySelectorAll("input, select").forEach(el => {
      const name = el.getAttribute("name");
      if (name && el.value.trim() !== "") {
        fields[docType][name] = el.value.trim();
      }
    });
  });
  return fields;
}

export function collectFormData() {
  const personal = new PersonalInfo({
    firstName: document.querySelector('[name="firstName"]').value,
    middleName: document.querySelector('[name="middleName"]').value,
    lastName: document.querySelector('[name="lastName"]').value,
    email: document.querySelector('[name="email"]').value,
    dob: document.querySelector('[name="dob"]').value,
    statementName: document.querySelector('[name="statementName"]').value
  });

  const address = new AddressInfo({
    address1: document.querySelector('[name="address1"]').value,
    address2: document.querySelector('[name="address2"]').value,
    city: document.querySelector('[name="city"]').value,
    state: document.querySelector('[name="state"]').value,
    country: document.querySelector('[name="country"]').value,
    postcode: document.querySelector('[name="postcode"]').value
  });

  const groupA = Array.from(document.querySelectorAll('[name="groupA_doc[]"]:checked')).map(cb => cb.value);
  const groupB = Array.from(document.querySelectorAll('[name="groupB_doc[]"]:checked')).map(cb => cb.value);

  const fields = collectDocumentFields();
  const documents = new DocumentInfo({ groupA, groupB, fields });

  return { personal, address, documents };
}
