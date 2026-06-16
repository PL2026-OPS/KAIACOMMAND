// api/send-yonaida.js — Envía análisis CPSIA a Yonaida por email
// POST /api/send-yonaida  body: { ccs, nombre, products, sheetUrl }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  let body
  try { body = JSON.parse(req.body || '{}') } catch { return res.status(400).json({ error: 'Body inválido' }) }

  const { ccs, nombre, products = [], sheetUrl } = body
  if (!products.length) return res.status(400).json({ error: 'products requerido' })

  const flagged = products.filter(p => p.aplica)
  const exentos = products.filter(p => p.exento)

  // Construir tabla HTML
  const tableRows = products.map((p, i) => `
    <tr style="background:${p.aplica ? '#fff8e6' : p.exento ? '#f0fdf4' : '#fff'}">
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i+1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${p.itemName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:12px">${p.description || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">
        ${p.aplica
          ? '<span style="background:#F5A623;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">SÍ</span>'
          : p.exento
          ? '<span style="background:#8DC63F;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">EXENTO</span>'
          : '<span style="background:#ddd;color:#666;padding:3px 10px;border-radius:12px;font-size:11px">NO</span>'}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:12px;color:#E8357A">${p.aplica ? p.test : '—'}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto">
      <div style="background:#13141A;padding:24px 32px;border-radius:12px 12px 0 0">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-family:Georgia,serif;font-size:24px;font-weight:900;color:#fff">KAIA</span>
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Command · CPSIA Analyzer</span>
        </div>
      </div>

      <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none">
        <h2 style="margin:0 0 8px;font-size:20px">⚠️ Análisis CPSIA — ${nombre || ccs}</h2>
        <p style="color:#666;margin:0 0 24px">Carga: <strong>${ccs}</strong></p>

        <div style="display:flex;gap:16px;margin-bottom:24px">
          <div style="background:#f5f5f5;padding:16px 24px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700">${products.length}</div>
            <div style="color:#666;font-size:12px">Analizados</div>
          </div>
          <div style="background:#fff8e6;padding:16px 24px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#F5A623">${flagged.length}</div>
            <div style="color:#666;font-size:12px">Requieren prueba</div>
          </div>
          <div style="background:#f0fdf4;padding:16px 24px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#8DC63F">${exentos.length}</div>
            <div style="color:#666;font-size:12px">Exentos</div>
          </div>
        </div>

        ${flagged.length ? `
          <div style="background:#fff3cd;border:1px solid #F5A623;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-weight:700">📋 Productos que requieren prueba CPSIA:</p>
            <ul style="margin:0;padding-left:20px">
              ${flagged.map(p => `<li style="margin-bottom:6px"><strong>${p.itemName}</strong> → ${p.test} <span style="color:#888;font-size:11px">(${p.articulo})</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;border-bottom:2px solid #eee">#</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;border-bottom:2px solid #eee">ITEM NAME</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;border-bottom:2px solid #eee">DESCRIPTION</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:#666;border-bottom:2px solid #eee">CPSIA</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;border-bottom:2px solid #eee">TEST REQUERIDO</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        ${sheetUrl ? `
          <div style="margin-top:24px;padding:16px;background:#f8f8f8;border-radius:8px">
            <p style="margin:0;font-size:13px;color:#666">
              📊 Ver pestaña CPSIA Filtro en Google Sheets:
              <a href="${sheetUrl}" style="color:#3BB8E8">${sheetUrl}</a>
            </p>
          </div>
        ` : ''}

        <p style="margin-top:24px;color:#888;font-size:12px">
          Generado automáticamente por KAIA Command · Sicoben Ediciones
        </p>
      </div>
    </div>
  `

  // Enviar con Resend
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY no configurado' })

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'KAIA Command <kaia@sicoben.com>',
      to:      ['logistica@sicobenediciones.com'],
      subject: `⚠️ CPSIA Filtro — ${nombre || ccs} — ${flagged.length} producto${flagged.length !== 1 ? 's' : ''} requiere${flagged.length !== 1 ? 'n' : ''} prueba`,
      html,
    }),
  })

  const emailData = await emailRes.json()
  if (!emailRes.ok) return res.status(500).json({ error: 'Error Resend: ' + JSON.stringify(emailData) })

  return res.status(200).json({ ok: true, emailId: emailData.id })
}
