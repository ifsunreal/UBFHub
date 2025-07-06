interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCode({ value, size = 128 }: QRCodeProps) {
  // Generate a simple QR code pattern using CSS
  // In a real app, you'd use a QR code library like qrcode.js
  return (
    <div className="text-center">
      <div 
        className="bg-white border-2 border-maroon-600 rounded-xl p-4 inline-block"
        style={{ width: size + 32, height: size + 32 }}
      >
        <div 
          className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"
          style={{ width: size, height: size }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📱</div>
            <div className="text-xs font-mono">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
