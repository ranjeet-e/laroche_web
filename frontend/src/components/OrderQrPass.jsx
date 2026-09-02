import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, ShieldCheck, Coffee, Sparkles } from 'lucide-react';
import './OrderQrPass.css';

const OrderQrPass = ({ order }) => {
  const qrCardRef = useRef(null);

  if (!order) return null;

  const shortToken = order._id.slice(-4).toUpperCase();
  const orderId = order._id;

  const qrData = JSON.stringify({
    cafe: 'La Roche Cafe',
    orderId,
    token: shortToken,
    student: order.student?.name || 'Customer',
    total: order.totalAmount,
    status: order.status,
    verified: true,
  });

  const handleDownloadQr = () => {
    const svg = document.getElementById(`qr-svg-${orderId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Scale up for high-resolution 600x600 download
    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 500, 500);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `LaRoche-OrderPass-${shortToken}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="order-qr-pass-card" ref={qrCardRef}>
      <div className="qr-pass-header">
        <div className="qr-pass-badge">
          <QrCode size={14} />
          <span>Counter Pickup Pass</span>
        </div>
        <span className="qr-pass-token">Token #{shortToken}</span>
      </div>

      <div className="qr-code-wrapper">
        <div className="qr-code-frame">
          <QRCodeSVG
            id={`qr-svg-${orderId}`}
            value={qrData}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#1a1615"
            bgColor="#ffffff"
          />
          <div className="qr-center-badge">
            <Coffee size={18} className="text-terracotta" />
          </div>
        </div>

        <p className="qr-scan-hint">
          Scan or show this QR at the counter for contactless pickup verification
        </p>
      </div>

      <div className="qr-pass-actions">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="qr-download-btn"
        >
          <Download size={15} />
          <span>Save Digital Pass (PNG)</span>
        </button>

        <div className="qr-security-note">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Verified Digital Order Receipt</span>
        </div>
      </div>
    </div>
  );
};

export default OrderQrPass;
