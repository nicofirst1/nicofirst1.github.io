/**
 * Theme Mode Switch
 * Switch betwen light/dark mode. The chosen mode is saved to browser's local storage
*/
let root = document.getElementsByTagName('html')[0];
let checkbox = document.getElementById('theme-mode');
let locMode = getLightingMode();
let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
if ((!darkMode && locMode == undefined) || (locMode == 'light')) {
  root.classList.remove('dark-mode');
  checkbox.checked = false;
} else {
  root.classList.add('dark-mode')
  checkbox.checked = true
}

function getLightingMode() {
  const storedPreference = localStorage.getItem('lightingModePreference');

  if (storedPreference) {
    const parsedPreference = JSON.parse(storedPreference);
    const currentTime = new Date().getTime();

    if (currentTime < parsedPreference.expires) {
      return parsedPreference.mode;
    } else {
      localStorage.removeItem('lightingModePreference');
    }
  }
  return undefined;
}

function setLightingMode(mode) {
  const currentTime = new Date().getTime();
  const expirationTime = currentTime + 7 * 24 * 60 * 60 * 1000; // 7 days

  const preferenceData = {
    mode: mode,
    expires: expirationTime,
  };

  localStorage.setItem('lightingModePreference', JSON.stringify(preferenceData));
}

const themeModeSwitch = (() => {
  let modeSwitch = document.querySelector('[data-bss-toggle="mode"]')
  if (modeSwitch === null) return;
  let checkbox = modeSwitch.querySelector('.form-check-input')

  modeSwitch.addEventListener('click', (e) => {
    if (checkbox.checked) {
      root.classList.add('dark-mode');
      setLightingMode('dark');
    } else {
      root.classList.remove('dark-mode');
      setLightingMode('light');
    }
  });
})();
