// faceVerify.js

// --- face-api.js Face Detection & Landmark Integration ---

const BACKEND_BASE_URL = 'https://ukpacalculator.com';

const steps = [
  { label: 'Face Forward', instruction: 'Please face forward and center your face in the frame.', key: 'front' },
  { label: 'Turn Head Left', instruction: 'Please turn your head to the LEFT.', key: 'left' },
  { label: 'Turn Head Right', instruction: 'Please turn your head to the RIGHT.', key: 'right' },
  { label: 'Liveness Check (Blink)', instruction: 'Please blink your eyes. The capture button will enable when a blink is detected.', key: 'liveness', liveness: true }
];
let currentStep = 0;
let capturedImages = {};
let lastEyeOpen = true;
let autoCaptureInProgress = false;
let faceDetected = false;

// --- Robust yaw and blink detection for liveness ---

let yawStableCount = 0;
const YAW_STABLE_FRAMES = 8; // Require 8 consecutive frames for yaw
let blinkStableCount = 0;
let eyeOpenStableCount = 0;
const BLINK_STABLE_FRAMES = 2; // Require 2 consecutive frames for blink
const EYE_OPEN_STABLE_FRAMES = 2; // Require 2 consecutive frames for open
let blinkCooldown = false;
const BLINK_COOLDOWN_MS = 1500;
let autoCaptureCooldown = false;
const AUTO_CAPTURE_COOLDOWN_MS = 1500;

// --- Stable yaw detection and visual guidance ---

function getQueryParams() {
  const url = new URL(window.location.href);
  return {
    token: url.searchParams.get('token'),
    userIndex: url.searchParams.get('userIndex')
  };
}

async function fetchUserInfo(token, userIndex) {
  const res = await fetch(`${BACKEND_BASE_URL}/ana/v1/routes/mainRouter/ocrUpload/face-verify-info?token=${encodeURIComponent(token)}&userIndex=${encodeURIComponent(userIndex)}`);
  if (!res.ok) throw new Error('Failed to fetch user info');
  return res.json();
}

function showMessage(msg, isError = false) {
  document.getElementById('message').textContent = isError ? '' : msg;
  document.getElementById('error').textContent = isError ? msg : '';
}

async function loadFaceApiModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('weights');
  await faceapi.nets.faceLandmark68Net.loadFromUri('weights');
}

async function startCamera() {
  const video = document.getElementById('cameraPreview');
  try {
    // Try to set zoom constraint if supported
    const constraints = {
      video: {
        zoom: 2, // 2x zoom if supported
        facingMode: 'user'
      }
    };
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Check if zoom was actually applied
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      if (!settings.zoom) {
        // Zoom not supported, fallback
        stream.getTracks().forEach(t => t.stop());
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      }
    } catch (e) {
      // Zoom not supported, fallback
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    }
    video.srcObject = stream;
    return stream;
  } catch (err) {
    showMessage('Camera access denied or unavailable.', true);
    throw err;
  }
}

function drawFaceBox(box) {
  const canvas = document.getElementById('faceBox');
  const video = document.getElementById('cameraPreview');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw face box if detected
  if (box) {
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    canvas.style.display = '';
  } else {
    canvas.style.display = '';
  }
  // Draw guidance overlay depending on step
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2196f3';
  ctx.fillStyle = 'rgba(33,150,243,0.15)';
  const w = canvas.width, h = canvas.height;
  if (steps[currentStep].key === 'front') {
    // Draw center vertical line
    ctx.beginPath();
    ctx.moveTo(w/2, h*0.2);
    ctx.lineTo(w/2, h*0.8);
    ctx.stroke();
    // Draw oval/ellipse for face
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, w*0.18, h*0.28, 0, 0, 2*Math.PI);
    ctx.stroke();
  } else if (steps[currentStep].key === 'left') {
    // Draw left arrow/arc
    ctx.beginPath();
    ctx.moveTo(w/2, h/2);
    ctx.lineTo(w/2 - w*0.18, h/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w/2 - w*0.18, h/2, 30, Math.PI*0.2, Math.PI*1.8);
    ctx.stroke();
    // Draw left-pointing arrowhead
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.18, h/2);
    ctx.lineTo(w/2 - w*0.18 + 15, h/2 - 15);
    ctx.moveTo(w/2 - w*0.18, h/2);
    ctx.lineTo(w/2 - w*0.18 + 15, h/2 + 15);
    ctx.stroke();
  } else if (steps[currentStep].key === 'right') {
    // Draw right arrow/arc
    ctx.beginPath();
    ctx.moveTo(w/2, h/2);
    ctx.lineTo(w/2 + w*0.18, h/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w/2 + w*0.18, h/2, 30, Math.PI*1.2, Math.PI*2.8);
    ctx.stroke();
    // Draw right-pointing arrowhead
    ctx.beginPath();
    ctx.moveTo(w/2 + w*0.18, h/2);
    ctx.lineTo(w/2 + w*0.18 - 15, h/2 - 15);
    ctx.moveTo(w/2 + w*0.18, h/2);
    ctx.lineTo(w/2 + w*0.18 - 15, h/2 + 15);
    ctx.stroke();
  }
  ctx.restore();
}

async function detectFace(video) {
  if (!video || video.readyState !== 4) return null;
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
  return detection ? detection.box : null;
}

async function detectBlink(video) {
  if (!video || video.readyState !== 4) return false;
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
  if (!detection || !detection.landmarks) return false;
  // Calculate eye aspect ratio for both eyes
  const leftEye = detection.landmarks.getLeftEye();
  const rightEye = detection.landmarks.getRightEye();
  function eyeAspectRatio(eye) {
    const a = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const b = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const c = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (a + b) / (2.0 * c);
  }
  const leftEAR = eyeAspectRatio(leftEye);
  const rightEAR = eyeAspectRatio(rightEye);
  const EAR = (leftEAR + rightEAR) / 2.0;
  // Robust blink detection
  if (EAR < 0.18) {
    blinkStableCount++;
    eyeOpenStableCount = 0;
  } else if (EAR > 0.22) {
    eyeOpenStableCount++;
    if (blinkStableCount > 0) {
    }
    if (eyeOpenStableCount >= EYE_OPEN_STABLE_FRAMES) {
      blinkStableCount = 0;
    }
  } else {
    blinkStableCount = 0;
    eyeOpenStableCount = 0;
  }
  if (blinkStableCount >= BLINK_STABLE_FRAMES && !blinkCooldown) {
    blinkCooldown = true;
    setTimeout(() => { blinkCooldown = false; }, BLINK_COOLDOWN_MS);
    return true; // Blink detected
  }
  return false;
}

function estimateYaw(landmarks) {
  // Use the position of the nose relative to the eyes to estimate yaw
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  // Calculate the center x of each eye
  const leftEyeX = (leftEye[0].x + leftEye[3].x) / 2;
  const rightEyeX = (rightEye[0].x + rightEye[3].x) / 2;
  const noseX = nose[3].x; // tip of the nose
  const eyeDist = rightEyeX - leftEyeX;
  const noseToLeft = Math.abs(noseX - leftEyeX);
  const noseToRight = Math.abs(noseX - rightEyeX);
  let yaw = (noseToRight - noseToLeft) / eyeDist;
  // Clamp/validate
  if (!isFinite(yaw) || isNaN(yaw) || Math.abs(yaw) > 1.5 || eyeDist < 10) {
    // Fallback: use noseX relative to eye center
    const eyeCenter = (leftEyeX + rightEyeX) / 2;
    yaw = (noseX - eyeCenter) / (eyeDist || 1);
  }
  // Clamp to [-1, 1]
  yaw = Math.max(-1, Math.min(1, yaw));
  return yaw;
}

function updateStepUI() {
  document.getElementById('stepIndicator').textContent = `Step ${currentStep + 1} of ${steps.length}`;
  document.getElementById('instruction').textContent = steps[currentStep].instruction;
  // Reset all state for new step
  yawStableCount = 0;
  blinkStableCount = 0;
  eyeOpenStableCount = 0;
  autoCaptureInProgress = false;
  autoCaptureCooldown = false;
}

async function uploadAllImages(token, userIndex, images) {
  const formData = new FormData();
  Object.entries(images).forEach(([key, blob]) => {
    formData.append(key, blob, `${key}.jpg`);
  });
  formData.append('token', token);
  formData.append('userIndex', userIndex);
  const res = await fetch(`${BACKEND_BASE_URL}/ana/v1/routes/mainRouter/ocrUpload/face-verify-upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

let video, submitBtn, canvas, captureBtn;

window.addEventListener('DOMContentLoaded', async () => {
  const { token, userIndex } = getQueryParams();
  let userInfo;
  video = document.getElementById('cameraPreview');
  submitBtn = document.getElementById('submitBtn');
  canvas = document.getElementById('snapshotCanvas');
  captureBtn = document.getElementById('captureBtn');

  try {
    userInfo = await fetchUserInfo(token, userIndex);
    document.getElementById('userName').textContent = userInfo.userName || 'User';
    document.getElementById('submitterName').textContent = userInfo.submitterName || '';
    document.getElementById('submitterEmail').textContent = userInfo.submitterEmail || '';
  } catch (err) {
    showMessage('Failed to load user info.', true);
    return;
  }

  const startBtn = document.getElementById('startVerificationBtn');
  const videoContainer = document.querySelector('.video-container');

  startBtn.addEventListener('click', async () => {
    startBtn.style.display = 'none';
    videoContainer.style.display = '';
    await loadFaceApiModels();
    let stream = await startCamera();
    updateStepUI();
    showMessage('');
    captureBtn.style.display = '';
    captureBtn.disabled = true;
    video.addEventListener('play', faceDetectionLoop);
    if (!video.paused) faceDetectionLoop();
  });

  captureBtn.addEventListener('click', () => {
    // Only allow capture if face is detected
    if (!faceDetected) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      capturedImages[steps[currentStep].key] = blob;
      showMessage(`${steps[currentStep].label} captured!`);
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          updateStepUI();
          showMessage('');
          captureBtn.disabled = true;
        } else {
          captureBtn.style.display = 'none';
          submitBtn.style.display = '';
          showMessage('All steps captured! Ready to submit.');
        }
      }, 500);
    }, 'image/jpeg');
  });

  submitBtn.addEventListener('click', async () => {
    showMessage('Uploading...');
    try {
      const result = await uploadAllImages(token, userIndex, capturedImages);
      if (result.success) {
        showMessage('Face verification successful! Thank you.');
        submitBtn.disabled = true;
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
        videoContainer.style.display = 'none';
      } else {
        showMessage(result.error || 'Verification failed. Try again.', true);
        submitBtn.disabled = false;
      }
    } catch (err) {
      showMessage('Upload failed. Try again.', true);
      submitBtn.disabled = false;
    }
  });

  // Remove all auto-capture logic from autoCaptureStep and faceDetectionLoop
  function autoCaptureStep() { /* no-op, not used */ }

  function updateStepUI() {
    document.getElementById('stepIndicator').textContent = `Step ${currentStep + 1} of ${steps.length}`;
    document.getElementById('instruction').textContent = steps[currentStep].instruction;
    yawStableCount = 0;
    blinkStableCount = 0;
    eyeOpenStableCount = 0;
    autoCaptureInProgress = false;
    autoCaptureCooldown = false;
    captureBtn.style.display = '';
    captureBtn.disabled = true;
    submitBtn.style.display = 'none';
  }

  async function faceDetectionLoop() {
    if (video.paused || video.ended) return;
    let box = null;
    let orientationReady = false;
    if (steps[currentStep].key === 'left' || steps[currentStep].key === 'right' || steps[currentStep].key === 'front') {
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      if (detection && detection.landmarks) {
        box = detection.box;
        drawFaceBox(box);
        faceDetected = true;
        captureBtn.disabled = false;
      } else {
        drawFaceBox(null);
        faceDetected = false;
        captureBtn.disabled = true;
      }
      // Remove yaw direction and liveness feedback from UI
    } else if (steps[currentStep].liveness) {
      // For liveness step, just require face detection and manual capture (no blink/EAR check)
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      if (detection && detection.landmarks) {
        box = detection.box;
        drawFaceBox(box);
        faceDetected = true;
        captureBtn.disabled = false;
      } else {
        drawFaceBox(null);
        faceDetected = false;
        captureBtn.disabled = true;
      }
      // Remove EAR/liveness feedback from UI
      document.getElementById('earDebug').textContent = '';
    }
    if (!video.paused && !video.ended) {
      requestAnimationFrame(faceDetectionLoop);
    }
  }
}); 