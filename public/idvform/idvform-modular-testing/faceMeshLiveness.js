// faceMeshLiveness.js
// Modular liveness detection component using MediaPipe Face Mesh
// Usage: new FaceMeshLiveness({ container: HTMLElement, onComplete: (imageBlob) => {} })

class FaceMeshLiveness {
  constructor({ container, onComplete }) {
    this.container = container;
    this.onComplete = onComplete;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.model = null;
    this.stream = null;
    this.statusDiv = null;
    this.challengeIndex = 0;
    this.challenges = [
      { label: 'Blink twice', key: 'blink', count: 2, done: false },
      { label: 'Turn head left', key: 'left', done: false },
      { label: 'Turn head right', key: 'right', done: false }
    ];
    this.blinkCount = 0;
    this.lastEyeOpen = true;
    this.leftTurnDetected = false;
    this.rightTurnDetected = false;
    this.earHistory = [];
    this.yawHistory = [];
    this.currentChallengeSatisfied = false;
    this.init();
  }

  async init() {
    this.container.innerHTML = `
      <div style="text-align:center;max-width:350px;margin:auto;">
        <div id="livenessProgress" style="margin-bottom:1em;height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden;">
          <div id="livenessProgressBar" style="height:100%;width:0;background:#1976d2;transition:width 0.3s;"></div>
        </div>
        <div style="position:relative;display:inline-block;width:320px;height:240px;">
          <video id="livenessVideo" autoplay playsinline style="width:320px;height:240px;border-radius:8px;box-shadow:0 2px 12px #0001;position:relative;z-index:1;"></video>
          <canvas id="livenessCanvas" width="320" height="240" style="position:absolute;left:0;top:0;z-index:2;pointer-events:none;"></canvas>
        </div>
        <div id="livenessStatus" style="margin-top:1em;font-weight:bold;min-height:2.5em;"></div>
        <button id="livenessCaptureBtn" style="margin-top:1em;width:90%;padding:0.7em;font-size:1em;border-radius:6px;background:#1976d2;color:#fff;border:none;box-shadow:0 1px 4px #0002;cursor:pointer;opacity:0.7;transition:opacity 0.2s;">Capture & Continue</button>
      </div>
    `;
    this.video = this.container.querySelector('#livenessVideo');
    this.canvas = this.container.querySelector('#livenessCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.statusDiv = this.container.querySelector('#livenessStatus');
    this.captureBtn = this.container.querySelector('#livenessCaptureBtn');
    this.progressBar = this.container.querySelector('#livenessProgressBar');
    this.captureBtn.disabled = true;
    await this.startCamera();
    await this.loadModel();
    this.runDetection();
    this.captureBtn.onclick = () => this.captureSnapshot();
  }

  async startCamera() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
    this.video.srcObject = this.stream;
    await new Promise(res => this.video.onloadedmetadata = res);
  }

  async loadModel() {
    if (!window.faceLandmarksDetection) {
      throw new Error('MediaPipe FaceMesh (faceLandmarksDetection) not loaded.');
    }
    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 }
    );
  }

  async runDetection() {
    if (!this.model) return;
    const detect = async () => {
      if (this.video.paused || this.video.ended) return;
      const predictions = await this.model.estimateFaces({ input: this.video });
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (predictions.length > 0) {
        const keypoints = predictions[0].scaledMesh;
        this.drawMesh(keypoints);
        this.handleLiveness(keypoints);
      } else {
        this.statusDiv.innerHTML = '<span style="color:#d32f2f;">Face not detected. Please center your face.</span>';
        this.captureBtn.disabled = true;
        this.currentChallengeSatisfied = false;
      }
      requestAnimationFrame(detect);
    };
    detect();
  }

  drawMesh(keypoints) {
    // Draw points
    this.ctx.strokeStyle = '#1976d2';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < keypoints.length; i++) {
      const [x, y] = keypoints[i];
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    // Draw wireframe
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000'; // bright red for visibility
    this.ctx.lineWidth = 2.5;
    // MediaPipe Face Mesh connections (subset for wireframe)
    const FACEMESH_CONNECTIONS = [
      [10, 338],[338, 297],[297, 332],[332, 284],[284, 251],[251, 389],[389, 356],[356, 454],[454, 323],[323, 361],[361, 288],[288, 397],[397, 365],[365, 379],[379, 378],[378, 400],[400, 377],[377, 152],[152, 148],[148, 176],[176, 149],[149, 150],[150, 136],[136, 172],[172, 58],[58, 132],[132, 93],[93, 234],[234, 127],[127, 162],[162, 21],[21, 54],[54, 103],[103, 67],[67, 109],[109, 10], // face oval
      [70, 63],[63, 105],[105, 66],[66, 107],[107, 55],[55, 65],[65, 52],[52, 53],[53, 46],[46, 70], // left eye
      [336, 296],[296, 334],[334, 293],[293, 300],[300, 276],[276, 283],[283, 282],[282, 295],[295, 336], // right eye
      [61, 185],[185, 40],[40, 39],[39, 37],[37, 0],[0, 267],[267, 269],[269, 270],[270, 409],[409, 291],[291, 61], // lips
      [78, 95],[95, 88],[88, 178],[178, 87],[87, 14],[14, 317],[317, 402],[402, 318],[318, 324],[324, 308],[308, 78] // inner lips
    ];
    FACEMESH_CONNECTIONS.forEach(([start, end]) => {
      const p1 = keypoints[start];
      const p2 = keypoints[end];
      if (p1 && p2) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1[0], p1[1]);
        this.ctx.lineTo(p2[0], p2[1]);
        this.ctx.stroke();
      }
    });
    this.ctx.restore();
  }

  handleLiveness(keypoints) {
    // Progress bar
    const completed = this.challenges.filter(c => c.done).length;
    const progress = Math.round((completed / this.challenges.length) * 100);
    this.progressBar.style.width = progress + '%';

    let status = [];
    let canCapture = false;
    let errorMsg = '';
    // Blink detection (EAR)
    const leftEAR = this.eyeAspectRatio([33, 160, 158, 133, 153, 144], keypoints);
    const rightEAR = this.eyeAspectRatio([362, 385, 387, 263, 373, 380], keypoints);
    const EAR = (leftEAR + rightEAR) / 2.0;
    this.earHistory.push(EAR);
    if (this.earHistory.length > 10) this.earHistory.shift();
    // Yaw detection (head turn)
    const yaw = this.estimateYaw(keypoints);
    this.yawHistory.push(yaw);
    if (this.yawHistory.length > 10) this.yawHistory.shift();

    // Blink challenge
    if (this.challenges[0] && !this.challenges[0].done) {
      status.push(`<span style='color:#1976d2;'>Challenge: Blink twice</span>`);
      status.push(`<span>Blinks detected: <b>${this.blinkCount}/2</b></span>`);
      if (this.lastEyeOpen && EAR < 0.18) {
        this.blinkCount++;
      }
      this.lastEyeOpen = EAR >= 0.18;
      if (this.blinkCount >= 2) {
        this.challenges[0].done = true;
        status.push(`<span style='color:green;'>Blink challenge complete!</span>`);
        canCapture = false;
      } else {
        canCapture = false;
      }
    }
    // Left turn challenge
    else if (this.challenges[1] && !this.challenges[1].done) {
      status.push(`<span style='color:#1976d2;'>Challenge: Turn your head to the left</span>`);
      if (yaw < -0.2) {
        this.leftTurnDetected = true;
        this.challenges[1].done = true;
        status.push(`<span style='color:green;'>Left turn detected!</span>`);
        canCapture = false;
      } else if (yaw > 0.2) {
        errorMsg = "You are turning right, please turn left!";
        canCapture = false;
      } else {
        status.push(`<span>Keep turning left until detected.</span>`);
        canCapture = false;
      }
    }
    // Right turn challenge
    else if (this.challenges[2] && !this.challenges[2].done) {
      status.push(`<span style='color:#1976d2;'>Challenge: Turn your head to the right</span>`);
      if (yaw > 0.2) {
        this.rightTurnDetected = true;
        this.challenges[2].done = true;
        status.push(`<span style='color:green;'>Right turn detected!</span>`);
        canCapture = true;
      } else if (yaw < -0.2) {
        errorMsg = "You are turning left, please turn right!";
        canCapture = false;
      } else {
        status.push(`<span>Keep turning right until detected.</span>`);
        canCapture = false;
      }
    }
    // All done
    else if (this.challenges.every(c => c.done)) {
      status.push(`<span style='color:green;'>Liveness check complete! Please capture your photo.</span>`);
      canCapture = true;
    }
    // Error message
    if (errorMsg) {
      status.push(`<span style='color:#d32f2f;font-weight:bold;'>${errorMsg}</span>`);
    }
    this.statusDiv.innerHTML = status.map(s => `<div>${s}</div>`).join('');
    this.captureBtn.disabled = !canCapture;
    this.captureBtn.style.opacity = canCapture ? '1' : '0.7';
  }

  eyeAspectRatio(indices, keypoints) {
    const [p1, p2, p3, p4, p5, p6] = indices.map(i => keypoints[i]);
    const a = Math.hypot(p2[0] - p6[0], p2[1] - p6[1]);
    const b = Math.hypot(p3[0] - p5[0], p3[1] - p5[1]);
    const c = Math.hypot(p1[0] - p4[0], p1[1] - p4[1]);
    return (a + b) / (2.0 * c);
  }

  estimateYaw(keypoints) {
    // Use nose tip (1), left eye (33), right eye (263)
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const nose = keypoints[1];
    const eyeDist = rightEye[0] - leftEye[0];
    const noseToLeft = Math.abs(nose[0] - leftEye[0]);
    const noseToRight = Math.abs(nose[0] - rightEye[0]);
    let yaw = (noseToRight - noseToLeft) / eyeDist;
    yaw = Math.max(-1, Math.min(1, yaw));
    return yaw;
  }

  captureSnapshot() {
    // Draw current video frame to canvas and get blob
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.canvas.toBlob(blob => {
      if (this.onComplete) this.onComplete(blob);
      this.statusDiv.innerHTML += '<div style="color:green;">Snapshot captured and ready for upload.</div>';
      this.captureBtn.style.display = 'none';
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    }, 'image/jpeg');
  }
}

// Export for use in other modules
window.FaceMeshLiveness = FaceMeshLiveness;
export default FaceMeshLiveness; 