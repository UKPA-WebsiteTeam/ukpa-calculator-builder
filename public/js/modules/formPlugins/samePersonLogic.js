// samePersonLogic.js

// Function to handle the toggling of additional name fields based on the "samePerson" radio selection
export function toggleNameFields(userId) {
  console.log(`Toggling name fields for user ${userId}`);

  // Find the radio buttons for "samePerson" (Yes/No)
  const samePersonYes = document.getElementById(`samePersonYes-${userId}`);
  const samePersonNo = document.getElementById(`samePersonNo-${userId}`);

  if (!samePersonYes || !samePersonNo) {
    console.error(`Radio buttons not found for user ${userId}`);
    return;
  }

  // Find the additional name fields container
  const samePersonFields = document.getElementById(`samePerson-nameFields-${userId}`);
  if (!samePersonFields) {
    console.error(`Name fields container not found for user ${userId}`);
    return;
  }

  // MutationObserver to ensure form is ready before we add event listeners
  const observer = new MutationObserver(() => {
    if (samePersonYes && samePersonNo && samePersonFields) {
      samePersonYes.addEventListener('change', () => {
        samePersonFields.style.display = 'none';  // Hide the fields
      });
      samePersonNo.addEventListener('change', () => {
        samePersonFields.style.display = 'block';  // Show the fields
      });
      observer.disconnect(); // Disconnect observer once we set the event listeners
    }
  });

  // Observe changes in the target element (the form)
  observer.observe(document.getElementById(`userSection-${userId}`), {
    childList: true,
    subtree: true,
  });
}
