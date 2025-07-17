export async function loadCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca3");
    const countries = await response.json();
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    return countries;
  } catch (error) {
    console.error("Failed to load country list:", error);
    return [];
  }
}