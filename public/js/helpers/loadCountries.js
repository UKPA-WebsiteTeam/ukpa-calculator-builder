const REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca3";
const LOCAL_COUNTRIES_PATH = "https://www.ukpropertyaccountants.co.uk/wp-content/plugins/ukpa-calculator-builder/public/idvform-modular-testing/data/countries.json";

function getLocalCountriesUrl() {
  const pluginUrl = window?.ukpa_idv_form_data?.plugin_url;
  if (!pluginUrl) {
    return LOCAL_COUNTRIES_PATH;
  }
  return `${pluginUrl}${LOCAL_COUNTRIES_PATH}`;
}

async function fetchCountriesFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Country list request failed (${response.status})`);
  }
  const countries = await response.json();
  countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
  return countries;
}

async function fetchLocalCountries() {
  const localUrl = getLocalCountriesUrl();
  try {
    console.warn("[loadCountries] Falling back to local countries file:", localUrl);
    return await fetchCountriesFromUrl(localUrl);
  } catch (localError) {
    console.error("[loadCountries] Failed to load local country list:", localError);
    return [];
  }
}

export async function loadCountries() {
  // Temporarily skip REST Countries API to avoid lag; use local fallback directly.
  // try {
  //   return await fetchCountriesFromUrl(REST_COUNTRIES_URL);
  // } catch (remoteError) {
  //   console.warn("[loadCountries] Remote country list failed (will use local copy):", remoteError);
  //   return fetchLocalCountries();
  // }
  return fetchLocalCountries();
}