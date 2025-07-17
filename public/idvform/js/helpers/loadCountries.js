export async function loadCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca3");
    const countries = await response.json();

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // Get all country select elements
    const countrySelects = document.querySelectorAll("#passportCountrySelect, #irishpassportCountrySelect, .country-dropdown");

    if (countrySelects.length === 0) {
      console.warn("❌ No country select elements found in DOM");
      return;
    }

    // Populate all country dropdowns
    countrySelects.forEach(selectElement => {
      selectElement.innerHTML = '<option value="">Select Country</option>';

      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.cca3;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
      });
    });

    console.log(`✅ Loaded ${countries.length} countries into ${countrySelects.length} dropdown(s)`);

  } catch (error) {
    console.error("Failed to load country list:", error);
    
    // Set error message in all country dropdowns
    const countrySelects = document.querySelectorAll("#passportCountrySelect, #irishpassportCountrySelect, .country-dropdown");
    countrySelects.forEach(selectElement => {
      selectElement.innerHTML = '<option value="">Unable to load countries</option>';
    });
  }
}