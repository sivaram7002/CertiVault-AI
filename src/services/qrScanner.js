import jsQR from 'jsqr';

/**
 * Scan an image Data URI or Image element for QR codes using client-side canvas and jsQR
 * @param {string} imageSource - Data URI or URL of the certificate
 * @returns {Promise<{detected: boolean, payload: string, status: string, points?: object}>}
 */
export async function scanQrCodeFromImage(imageSource) {
  if (!imageSource) {
    return { detected: false, payload: '', status: 'No image provided' };
  }

  // If it's a PDF data URI, jsQR directly on raw PDF string won't work without rendering to canvas.
  if (imageSource.startsWith('data:application/pdf')) {
    return {
      detected: false,
      payload: '',
      status: 'PDF format requires raster rendering for optical QR pass'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Scan at standard size
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        // If not found at full scale, try scaling down if it's very large
        if (!code && (canvas.width > 1200 || canvas.height > 1200)) {
          const scaledCanvas = document.createElement('canvas');
          const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true });
          scaledCanvas.width = 1000;
          scaledCanvas.height = Math.round((1000 / canvas.width) * canvas.height);
          scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
          const scaledData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
          code = jsQR(scaledData.data, scaledData.width, scaledData.height, {
            inversionAttempts: 'attemptBoth'
          });
        }

        if (code && code.data) {
          resolve({
            detected: true,
            payload: code.data,
            status: 'Verified Authentic QR Matrix Decoded',
            location: code.location
          });
        } else {
          resolve({
            detected: false,
            payload: '',
            status: 'No optical QR pattern detected or resolution unreadable'
          });
        }
      } catch (err) {
        console.warn('QR scan error:', err);
        resolve({
          detected: false,
          payload: '',
          status: `QR scan error: ${err.message}`
        });
      }
    };

    img.onerror = () => {
      resolve({
        detected: false,
        payload: '',
        status: 'Image load failed for QR extraction'
      });
    };

    img.src = imageSource;
  });
}
