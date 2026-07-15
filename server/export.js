const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorised' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

const SHELF_LABELS = {
  want_to_visit: 'Want to Visit',
  currently_exploring: 'Currently Exploring',
  all_time_favourites: 'All-Time Favourites',
};

const COLORS = {
  text: '#18181B',
  textMuted: '#71717A',
  textLight: '#A1A1AA',
  border: '#DCDCDA',
  star: '#D4A434',
};

const FONT_REGULAR = require.resolve('@fontsource/barlow/files/barlow-latin-400-normal.woff');
const FONT_BOLD = require.resolve('@fontsource/barlow/files/barlow-latin-700-normal.woff');

function starPoints(cx, cy, outerR, innerR) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points;
}

function drawStar(doc, x, y, size, filled) {
  const outerR = size / 2;
  const innerR = outerR * 0.4;
  const cx = x + outerR;
  const cy = y + outerR;
  const pts = starPoints(cx, cy, outerR, innerR);
  doc.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) doc.lineTo(pts[i][0], pts[i][1]);
  doc.closePath();
  if (filled) {
    doc.fillColor(COLORS.star).fill();
  } else {
    doc.strokeColor(COLORS.border).lineWidth(1).stroke();
  }
}

function drawRating(doc, x, y, rating, size = 9, gap = 2) {
  for (let i = 0; i < 5; i++) {
    drawStar(doc, x + i * (size + gap), y, size, i < rating);
  }
}

router.get('/pdf', authMiddleware, async (req, res) => {
  try {
    const [profileRows] = await db.query(
      'SELECT display_name, username, email FROM users WHERE id = ?',
      [req.user.id]
    );
    if (profileRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const profile = profileRows[0];

    const [shelf] = await db.query(
      `SELECT coffee_shelf.status, cafes.name AS cafe_name, cafes.address
       FROM coffee_shelf JOIN cafes ON coffee_shelf.cafe_id = cafes.id
       WHERE coffee_shelf.user_id = ?
       ORDER BY coffee_shelf.status, cafes.name`,
      [req.user.id]
    );

    const [reviews] = await db.query(
      `SELECT cafes.name AS cafe_name, reviews.rating, reviews.review_text, reviews.created_at
       FROM reviews JOIN cafes ON reviews.cafe_id = cafes.id
       WHERE reviews.user_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.user.id]
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="overcaffeinated-export.pdf"');
    doc.pipe(res);

    doc.registerFont('Barlow', FONT_REGULAR);
    doc.registerFont('Barlow-Bold', FONT_BOLD);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const NAV_H = 64;
    const PAD = 24;
    const PAD_H = 16;

    doc.rect(0, 0, doc.page.width, NAV_H).fill(COLORS.text);
    doc.font('Barlow-Bold').fontSize(17).fillColor('#FFFFFF')
      .text('OverCaffeinated', left, NAV_H / 2 - 9);

    doc.y = NAV_H + 36;
    doc.x = left;

    doc.font('Barlow-Bold').fontSize(16).fillColor(COLORS.textMuted).text('My Cafe Journey');
    doc.moveDown(0.5);
    doc.font('Barlow').fontSize(9).fillColor(COLORS.textLight)
      .text(`Exported for ${profile.display_name || profile.username || profile.email}`);

    doc.y += 40;
    doc.x = left;

    const s1 = doc.y;
    doc.font('Barlow-Bold').fontSize(14).fillColor(COLORS.text).text('Coffee Shelf');
    doc.moveDown(0.6);

    if (shelf.length === 0) {
      doc.font('Barlow').fontSize(10).fillColor(COLORS.textMuted).text('No cafes on your shelf yet.');
    } else {
      const grouped = shelf.reduce((acc, item) => {
        acc[item.status] = acc[item.status] || [];
        acc[item.status].push(item);
        return acc;
      }, {});
      Object.keys(SHELF_LABELS).forEach(status => {
        if (!grouped[status]) return;
        doc.font('Barlow-Bold').fontSize(9).fillColor(COLORS.textMuted)
          .text(SHELF_LABELS[status].toUpperCase(), { characterSpacing: 0.5 });
        doc.moveDown(0.3);
        grouped[status].forEach(item => {
          doc.font('Barlow').fontSize(11).fillColor(COLORS.text).text(item.cafe_name);
          if (item.address) {
            doc.font('Barlow').fontSize(9).fillColor(COLORS.textLight).text(item.address);
          }
          doc.moveDown(0.4);
        });
        doc.moveDown(0.3);
      });
    }
    doc.moveDown(0.15);
    const e1 = doc.y;
    doc.roundedRect(left - PAD_H, s1 - PAD, pageWidth + PAD_H * 2, e1 - s1 + PAD * 2, 4)
      .strokeColor(COLORS.border).lineWidth(1).stroke();

    const box1Bottom = e1 + PAD;
    doc.y = box1Bottom + 40;
    doc.x = left;

    const s2 = doc.y;
    doc.font('Barlow-Bold').fontSize(14).fillColor(COLORS.text).text('My Reviews');
    doc.moveDown(0.6);

    if (reviews.length === 0) {
      doc.font('Barlow').fontSize(10).fillColor(COLORS.textMuted).text("You haven't reviewed any cafes yet.");
    } else {
      reviews.forEach((r, idx) => {
        const rowY = doc.y;
        doc.font('Barlow-Bold').fontSize(12).fillColor(COLORS.text)
          .text(r.cafe_name, left, rowY, { width: pageWidth - 110 });
        drawRating(doc, left + pageWidth - 100, rowY + 2, r.rating);
        doc.font('Barlow').fontSize(9).fillColor(COLORS.textLight)
          .text(new Date(r.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' }), left, doc.y);
        if (r.review_text) {
          doc.moveDown(0.2);
          doc.font('Barlow').fontSize(10).fillColor(COLORS.textMuted)
            .text(r.review_text, left, doc.y, { width: pageWidth });
        }
        if (idx < reviews.length - 1) {
          doc.moveDown(0.5);
          doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke();
          doc.moveDown(0.5);
        }
      });
    }
    doc.moveDown(0.15);
    const e2 = doc.y;
    doc.roundedRect(left - PAD_H, s2 - PAD, pageWidth + PAD_H * 2, e2 - s2 + PAD * 2, 4)
      .strokeColor(COLORS.border).lineWidth(1).stroke();

    doc.font('Barlow').fontSize(9).fillColor(COLORS.textLight)
      .text(`Generated on ${new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}`, left, doc.page.height - doc.page.margins.bottom - 24, { width: pageWidth, align: 'right' });

    doc.end();
  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not generate export' });
    }
  }
});

module.exports = router;