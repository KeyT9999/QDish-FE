import QRCode from 'qrcode';
import JSZip from 'jszip';

/**
 * Universal browser file saver for Blobs
 */
export function saveBlobAs(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, 300);
}

// ────────────────────────────────────────────────────
// Dimension & Style Constants for High-Res Print Card
// Standard 3:4 portrait aspect ratio (800 x 1080 px)
// ────────────────────────────────────────────────────
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1080;
const QR_SIZE = 480;

/**
 * Format download file name according to user specification:
 * ban1.jpg, ban2.jpg, etc.
 */
export function getTableFileName(tableCode: string): string {
  const cleanCode = tableCode.trim();
  const matchNum = cleanCode.match(/\d+/);
  if (matchNum) {
    const num = parseInt(matchNum[0], 10);
    return `ban${num}.jpg`;
  }
  const fallback = cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `ban${fallback || '1'}.jpg`;
}

/**
 * Render a high-resolution, print-ready branded QR standee card onto a canvas.
 * Designed with UI/UX PRO MAX standards for restaurant table displays.
 */
export async function renderQRCanvas(
  qrValue: string,
  tableCode: string,
  restaurantName: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // 1. MUST fill entire canvas with solid white first (prevents black background in JPEG)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Outer decorative frame / border
  const margin = 28;
  const cardW = CANVAS_WIDTH - margin * 2;
  const cardH = CANVAS_HEIGHT - margin * 2;
  const cardRadius = 36;

  // Background subtle gradient for card body
  const bodyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.7, '#fafdfb');
  bodyGrad.addColorStop(1, '#f0fdf4'); // soft emerald tint at bottom

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, cardW, cardH, cardRadius);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.clip(); // clip contents to rounded outer card

  // 3. Top Header Bar (Rich Emerald Gradient)
  const headerH = 160;
  const headerGrad = ctx.createLinearGradient(0, margin, 0, margin + headerH);
  headerGrad.addColorStop(0, '#064e3b'); // emerald-900
  headerGrad.addColorStop(0.6, '#065f46'); // emerald-800
  headerGrad.addColorStop(1, '#047857'); // emerald-700

  ctx.fillStyle = headerGrad;
  ctx.fillRect(margin, margin, cardW, headerH);

  // Decorative subtle gold/accent bottom line for header
  ctx.fillStyle = '#10b981';
  ctx.fillRect(margin, margin + headerH - 6, cardW, 6);

  // Header Subtitle: ✦ QUÉT QR GỌI MÓN TẠI BÀN ✦
  ctx.fillStyle = '#a7f3d0'; // emerald-200
  ctx.font = '700 15px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('✦ QUÉT QR GỌI MÓN TẠI BÀN ✦', CANVAS_WIDTH / 2, margin + 42);
  ctx.letterSpacing = '0px';

  // Restaurant Name in Header
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 32px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
  const rawName = restaurantName?.trim() || 'Nhà hàng';
  const displayName = rawName.length > 28 ? rawName.substring(0, 26) + '…' : rawName;
  ctx.fillText(displayName, CANVAS_WIDTH / 2, margin + 88);

  // Sub-badge under restaurant name
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  const tagW = 160;
  const tagH = 26;
  ctx.beginPath();
  ctx.roundRect((CANVAS_WIDTH - tagW) / 2, margin + 116, tagW, tagH, 13);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px "Inter", -apple-system, sans-serif';
  ctx.fillText('THỰC ĐƠN ĐIỆN TỬ', CANVAS_WIDTH / 2, margin + 129);

  // 4. White Card Container for QR Code
  const qrContainerY = margin + headerH + 34;
  const qrBoxSize = QR_SIZE + 44; // 524px
  const qrBoxX = (CANVAS_WIDTH - qrBoxSize) / 2;

  // QR Container Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(6, 78, 59, 0.12)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrContainerY, qrBoxSize, qrBoxSize, 28);
  ctx.fill();
  ctx.restore();

  // QR Container Border
  ctx.strokeStyle = '#d1fae5'; // emerald-100
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrContainerY, qrBoxSize, qrBoxSize, 28);
  ctx.stroke();

  // 5. Generate and Draw High-Contrast QR Code
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, qrValue, {
    width: QR_SIZE,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#0f172a', // Slate 900 for crisp scanner contrast
      light: '#ffffff',
    },
  });

  const qrX = qrBoxX + (qrBoxSize - QR_SIZE) / 2;
  const qrY = qrContainerY + (qrBoxSize - QR_SIZE) / 2;
  ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE);

  // Decorative corner brackets on QR container
  const bracketLen = 22;
  const bracketPad = 12;
  ctx.strokeStyle = '#059669'; // emerald-600
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  // Top-left bracket
  ctx.beginPath();
  ctx.moveTo(qrBoxX + bracketPad, qrContainerY + bracketPad + bracketLen);
  ctx.lineTo(qrBoxX + bracketPad, qrContainerY + bracketPad);
  ctx.lineTo(qrBoxX + bracketPad + bracketLen, qrContainerY + bracketPad);
  ctx.stroke();

  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(qrBoxX + qrBoxSize - bracketPad - bracketLen, qrContainerY + bracketPad);
  ctx.lineTo(qrBoxX + qrBoxSize - bracketPad, qrContainerY + bracketPad);
  ctx.lineTo(qrBoxX + qrBoxSize - bracketPad, qrContainerY + bracketPad + bracketLen);
  ctx.stroke();

  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(qrBoxX + bracketPad, qrContainerY + qrBoxSize - bracketPad - bracketLen);
  ctx.lineTo(qrBoxX + bracketPad, qrContainerY + qrBoxSize - bracketPad);
  ctx.lineTo(qrBoxX + bracketPad + bracketLen, qrContainerY + qrBoxSize - bracketPad);
  ctx.stroke();

  // Bottom-right bracket
  ctx.beginPath();
  ctx.moveTo(qrBoxX + qrBoxSize - bracketPad - bracketLen, qrContainerY + qrBoxSize - bracketPad);
  ctx.lineTo(qrBoxX + qrBoxSize - bracketPad, qrContainerY + qrBoxSize - bracketPad);
  ctx.lineTo(qrBoxX + qrBoxSize - bracketPad, qrContainerY + qrBoxSize - bracketPad - bracketLen);
  ctx.stroke();

  // 6. Prominent Table Number Pill Badge
  const tableBadgeY = qrContainerY + qrBoxSize + 30;
  const tableNumberOnly = tableCode.trim().replace(/^b[aà]n\s*/i, '');
  const badgeText = `BÀN ${tableNumberOnly}`;

  ctx.font = '800 40px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
  const badgeTextMetrics = ctx.measureText(badgeText);
  const badgeW = Math.max(badgeTextMetrics.width + 64, 260);
  const badgeH = 70;
  const badgeX = (CANVAS_WIDTH - badgeW) / 2;

  // Badge gradient
  const badgeGrad = ctx.createLinearGradient(badgeX, 0, badgeX + badgeW, 0);
  badgeGrad.addColorStop(0, '#065f46'); // emerald-800
  badgeGrad.addColorStop(1, '#059669'); // emerald-600

  ctx.save();
  ctx.shadowColor = 'rgba(5, 150, 105, 0.3)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect(badgeX, tableBadgeY, badgeW, badgeH, 35);
  ctx.fill();
  ctx.restore();

  // Badge text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 40px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
  ctx.fillText(badgeText, CANVAS_WIDTH / 2, tableBadgeY + badgeH / 2);

  // 7. Visual 3-step Instructions Box
  const stepsY = tableBadgeY + badgeH + 28;
  ctx.font = '700 16px "Inter", -apple-system, sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.fillText('1. Mở Camera / Zalo   •   2. Quét mã QR   •   3. Chọn món & Gọi', CANVAS_WIDTH / 2, stepsY);

  ctx.font = '500 14px "Inter", -apple-system, sans-serif';
  ctx.fillStyle = '#64748b'; // slate-500
  ctx.fillText('Đơn đặt sẽ được chuyển tự động vào quầy & bếp của nhà hàng', CANVAS_WIDTH / 2, stepsY + 28);

  // 8. Bottom Footer Brand
  const footerY = CANVAS_HEIGHT - margin - 24;
  ctx.font = '600 12px "Inter", -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.fillText('QR FOOD ORDER • CHÚC QUÝ KHÁCH NGON MIỆNG', CANVAS_WIDTH / 2, footerY);

  ctx.restore(); // restore clipping

  return canvas;
}

/**
 * Convert canvas to high-quality JPEG blob.
 * Quality 0.95 ensures crisp printing without file bloat.
 */
export function canvasToJPEGBlob(canvas: HTMLCanvasElement, quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Không thể tạo file ảnh từ canvas'));
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Download a single table's QR image as a JPG file named: ban1.jpg, ban2.jpg, etc.
 */
export async function downloadSingleTableQR(
  restaurantId: string,
  tableCode: string,
  restaurantName: string
): Promise<void> {
  const qrValue = `${window.location.origin}/order?r=${restaurantId}&t=${tableCode}`;
  const canvas = await renderQRCanvas(qrValue, tableCode, restaurantName);
  const blob = await canvasToJPEGBlob(canvas);
  const fileName = getTableFileName(tableCode);
  saveBlobAs(blob, fileName);
}

/**
 * Download all tables' QR codes packaged into a single ZIP file.
 * Each file inside the ZIP is named ban1.jpg, ban2.jpg, etc.
 */
export async function downloadAllTablesQRAsZip(
  restaurantId: string,
  tables: { code: string }[],
  restaurantName: string,
  onProgress?: (current: number, total: number, currentTableName: string) => void
): Promise<void> {
  if (!tables || tables.length === 0) {
    throw new Error('Chưa có bàn nào để tải mã QR');
  }

  const zip = new JSZip();
  const total = tables.length;

  for (let i = 0; i < total; i++) {
    const table = tables[i];
    const qrValue = `${window.location.origin}/order?r=${restaurantId}&t=${table.code}`;
    const canvas = await renderQRCanvas(qrValue, table.code, restaurantName);
    const blob = await canvasToJPEGBlob(canvas);
    const fileName = getTableFileName(table.code);

    zip.file(fileName, blob);
    onProgress?.(i + 1, total, fileName);

    // Yield back to main thread briefly for responsive UI animation
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const safeRestaurantName = (restaurantName || 'NhaHang')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  saveBlobAs(zipBlob, `QR_BanAn_${safeRestaurantName}.zip`);
}

/**
 * Download all tables individually one by one (direct sequential downloads).
 * Useful if the user prefers direct JPG files saved to their Downloads folder without unzipping.
 */
export async function downloadAllTablesQRIndividual(
  restaurantId: string,
  tables: { code: string }[],
  restaurantName: string,
  onProgress?: (current: number, total: number, currentTableName: string) => void
): Promise<void> {
  if (!tables || tables.length === 0) {
    throw new Error('Chưa có bàn nào để tải mã QR');
  }

  const total = tables.length;

  for (let i = 0; i < total; i++) {
    const table = tables[i];
    const qrValue = `${window.location.origin}/order?r=${restaurantId}&t=${table.code}`;
    const canvas = await renderQRCanvas(qrValue, table.code, restaurantName);
    const blob = await canvasToJPEGBlob(canvas);
    const fileName = getTableFileName(table.code);

    saveBlobAs(blob, fileName);
    onProgress?.(i + 1, total, fileName);

    // Slight delay between downloads to prevent browser download throttling
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
