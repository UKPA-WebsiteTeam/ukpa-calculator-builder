// faceVerificationSection.js

export function createFaceVerificationSection(userId, displayName) {
  const section = document.createElement('section');
  section.className = 'face-verification-section';
  section.innerHTML = `
    <h3>Face Verification - ${displayName || 'User ' + userId}</h3>
    <div class="disclaimer-box">
      <p>Please share the below generated URL to the respective individual who will be able to access this step through this link and complete their face verification.

Please note that only upon completion of this step you will be able to submit the form.</p>
    </div>
    <div class="inputContainer" style="display: flex; gap: 1em; justify-content: space-between;">
      <!-- Start Camera button will be inserted here by JS -->
      <label for="remoteFaceVerification-${userId}" style="margin: 0; display: flex; align-items: center; gap: 0.5em;">
        <input type="checkbox" id="remoteFaceVerification-${userId}" name="remoteFaceVerification-${userId}" />
        <span style="font-weight: 600;">Remote Face Verification</span>
      </label>
    </div>
    <div id="faceVerificationArea-${userId}" style="margin-top: 0;"></div>
  `;

  const remoteCheckbox = section.querySelector(`#remoteFaceVerification-${userId}`);
  const inputContainer = section.querySelector('.inputContainer');
  const faceVerificationArea = section.querySelector(`#faceVerificationArea-${userId}`);

  let stream = null;

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  function showStartCameraButton() {
    let btn = inputContainer.querySelector(`#startCameraBtn-${userId}`);
    let stopBtn = inputContainer.querySelector(`#stopCameraBtn-${userId}`);
    if (!btn) {
      if (stopBtn) stopBtn.remove();
      btn = document.createElement('button');
      btn.id = `startCameraBtn-${userId}`;
      btn.type = 'button';
      btn.style.margin = '0';
      btn.style.padding = '6px 8px';
      btn.textContent = 'Start Camera';
      inputContainer.insertBefore(btn, inputContainer.firstChild);
      btn.onclick = startCameraHandler;
    }
  }

  function showStopCameraButton() {
    let btn = inputContainer.querySelector(`#stopCameraBtn-${userId}`);
    let startBtn = inputContainer.querySelector(`#startCameraBtn-${userId}`);
    if (!btn) {
      if (startBtn) startBtn.remove();
      btn = document.createElement('button');
      btn.id = `stopCameraBtn-${userId}`;
      btn.type = 'button';
      btn.style.margin = '0';
      btn.style.padding = '6px 8px';
      btn.textContent = 'Stop Camera';
      inputContainer.insertBefore(btn, inputContainer.firstChild);
      btn.onclick = stopCameraHandler;
    }
  }

  function startCameraHandler() {
    faceVerificationArea.innerHTML = `
      <div class="direct-face-verification" style="margin-top: 1em; display: flex; flex-direction: column; align-items: flex-start;">
        <video id="cameraPreview-${userId}" width="320" height="240" autoplay playsinline style="border-radius:8px; border:1px solid #e0e4ea; margin-bottom: 0.5em;"></video>
        <div style="display: flex; gap: 0.5em; margin-bottom: 0.5em;">
          <button id="zoomOutBtn-${userId}" type="button" style="padding: 2px 10px; font-size: 1.2em; border:1px solid #012169; background-color: #fff; color:#1a1a1a;">-</button>
          <button id="zoomInBtn-${userId}" type="button" style="padding: 2px 10px; font-size: 1.2em; border:1px solid #012169; background-color: #fff; color:#1a1a1a;">+</button>
        </div>
        <button id="captureBtn-${userId}" type="button" style="margin: 0 0 0.5em 0; border:1px solid #012169; background-color: #fff; color:#1a1a1a;">Capture Photo</button>
        <canvas id="snapshotCanvas-${userId}" style="display:none;"></canvas>
      </div>
    `;
    showStopCameraButton();

    const video = faceVerificationArea.querySelector(`#cameraPreview-${userId}`);
    const captureBtn = faceVerificationArea.querySelector(`#captureBtn-${userId}`);
    const canvas = faceVerificationArea.querySelector(`#snapshotCanvas-${userId}`);
    const zoomInBtn = faceVerificationArea.querySelector(`#zoomInBtn-${userId}`);
    const zoomOutBtn = faceVerificationArea.querySelector(`#zoomOutBtn-${userId}`);

    let currentZoom = 1;
    let maxZoom = 2;
    let minZoom = 1;
    let videoTrack = null;

    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      stream = s;
      video.srcObject = stream;
      videoTrack = stream.getVideoTracks()[0];
      // Check if zoom is supported
      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
      if (capabilities.zoom) {
        maxZoom = Math.min(capabilities.zoom.max, 2);
        minZoom = Math.max(capabilities.zoom.min, 1);
        currentZoom = videoTrack.getSettings().zoom || 1;
        zoomInBtn.disabled = currentZoom >= maxZoom;
        zoomOutBtn.disabled = currentZoom <= minZoom;
        zoomInBtn.onclick = () => {
          if (currentZoom < maxZoom) {
            currentZoom = Math.min(currentZoom + 0.1, maxZoom);
            videoTrack.applyConstraints({ advanced: [{ zoom: currentZoom }] });
            zoomInBtn.disabled = currentZoom >= maxZoom;
            zoomOutBtn.disabled = currentZoom <= minZoom;
          }
        };
        zoomOutBtn.onclick = () => {
          if (currentZoom > minZoom) {
            currentZoom = Math.max(currentZoom - 0.1, minZoom);
            videoTrack.applyConstraints({ advanced: [{ zoom: currentZoom }] });
            zoomInBtn.disabled = currentZoom >= maxZoom;
            zoomOutBtn.disabled = currentZoom <= minZoom;
          }
        };
      } else {
        // If zoom not supported, disable buttons
        zoomInBtn.disabled = true;
        zoomOutBtn.disabled = true;
        zoomInBtn.title = zoomOutBtn.title = "Zoom not supported on this device";
      }
    }).catch(() => {
      alert('Camera access denied or unavailable.');
      showStartCameraButton();
      faceVerificationArea.innerHTML = '';
    });

    captureBtn.onclick = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.style.display = 'none';
      canvas.style.display = '';
      captureBtn.style.display = 'none';
      stopStream();
    };
  }

  function stopCameraHandler() {
    stopStream();
    faceVerificationArea.innerHTML = '';
    showStartCameraButton();
  }

  function updateFaceVerificationUI() {
    faceVerificationArea.innerHTML = '';
    stopStream();
    showStartCameraButton();
    if (remoteCheckbox.checked) {
      inputContainer.querySelector(`#startCameraBtn-${userId}`)?.remove();
      inputContainer.querySelector(`#stopCameraBtn-${userId}`)?.remove();
      faceVerificationArea.innerHTML = `
        <div class="remote-face-verification" style="margin-top: 1em;">
          <p>Remote face verification link will be generated for this user after form submission.</p>
        </div>
      `;
    }
  }

  remoteCheckbox.addEventListener('change', updateFaceVerificationUI);

  // Ensure the Start Camera button is present and functional on initial render
  showStartCameraButton();

  updateFaceVerificationUI();

  section.getFaceVerificationData = function () {
    return {
      remoteFaceVerification: remoteCheckbox.checked,
      // Optionally, you can add logic to return the captured image data here
    };
  };

  return section;
} 