/**
 * Export research suggestions to Microsoft Excel (.xls) with custom HTML table formatting.
 */
export function exportSuggestionsToExcel(data, customTitle = 'Daftar Usulan Riset Pengunjung') {
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const rowsHtml = data
    .map((item, index) => {
      const itemDate = new Date(item.created_at)
      const tgl = !isNaN(itemDate)
        ? itemDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'
      const jam = !isNaN(itemDate)
        ? `${itemDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
        : '-'

      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'

      const safeTopic = (item.title || item.topic_wanted || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br/>')

      const feedbackText = item.deskripsi || item.feedback
      const safeFeedback = feedbackText
        ? `<div style="font-size: 9pt; color: #64748B; font-style: italic; margin-top: 4px;">Deskripsi: "${feedbackText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}"</div>`
        : ''

      return `
        <tr style="background-color: ${rowBg};">
          <td style="border: 1px solid #CBD5E1; padding: 10px 8px; text-align: center; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569;">
            ${index + 1}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 14px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #0F172A; line-height: 1.4; text-align: left;">
            <strong>${safeTopic}</strong>
            ${safeFeedback}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${item.persona_name || '-'}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${item.challenge_name || item.zone_name || '-'}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569; text-align: center; white-space: nowrap;">
            ${tgl}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569; text-align: center; white-space: nowrap;">
            ${jam}
          </td>
        </tr>
      `
    })
    .join('')

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Usulan Riset Pengunjung</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        .title-banner {
          background-color: #0F172A;
          color: #FFFFFF;
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          padding: 16px;
          border: 1px solid #0F172A;
        }
        .meta-label {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          font-weight: bold;
          color: #475569;
          background-color: #F1F5F9;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .meta-val {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          color: #0F172A;
          background-color: #FFFFFF;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .th-header {
          background-color: #1E293B;
          color: #FFFFFF;
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 11pt;
          font-weight: bold;
          padding: 12px 10px;
          text-align: center;
          border: 1px solid #0F172A;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th colspan="6" class="title-banner">
            DAFTAR USULAN RISET PENGUNJUNG · RESEARCH TABLE BRIN
          </th>
        </tr>
        <tr>
          <td colspan="6" style="height: 10px;"></td>
        </tr>

        <tr>
          <td class="meta-label">Waktu Unduh:</td>
          <td class="meta-val" colspan="2">${dateFormatted}, ${timeFormatted} WIB</td>
          <td class="meta-label">Total Data:</td>
          <td class="meta-val" colspan="2">${data.length} Baris Usulan</td>
        </tr>
        <tr>
          <td colspan="6" style="height: 12px;"></td>
        </tr>

        <thead>
          <tr>
            <th class="th-header" style="width: 50px;">No</th>
            <th class="th-header" style="width: 450px;">Judul Usulan & Deskripsi</th>
            <th class="th-header" style="width: 200px;">Peran (Persona)</th>
            <th class="th-header" style="width: 200px;">Tantangan (Challenge)</th>
            <th class="th-header" style="width: 140px;">Tanggal Masuk</th>
            <th class="th-header" style="width: 110px;">Waktu</th>
          </tr>
        </thead>

        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob(['\uFEFF' + excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileDateStr = now.toISOString().split('T')[0]
  link.href = url
  link.setAttribute('download', `Laporan_Usulan_ResearchTable_${fileDateStr}.xls`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export BRIN research publications to Microsoft Excel (.xls)
 * Matches requested columns: ID, Judul, Media Publikasi, Cakupan, Tahun, Sumber,
 * Penulis BRIN, Pusat Riset / Satker, Bidang, Provinsi, Wilayah, Catatan data, Dihitung.
 */
export function exportPublicationsToExcel(data, customTitle = 'Daftar Publikasi Riset BRIN') {
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const escapeHtml = (val) => {
    if (val === null || val === undefined) return ''
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br/>')
  }

  const rowsHtml = data
    .map((item, index) => {
      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
      const idText = escapeHtml(item.publication_id || '')
      const titleText = escapeHtml(item.title || '')
      const mediaText = escapeHtml(item.publication_media || '')
      const coverageText = escapeHtml(item.coverage || '')
      const yearText = item.year != null ? String(item.year) : ''
      const sourceText = escapeHtml(item.source || '')
      const authorText = escapeHtml(item.brin_author || '')
      const researchCenterText = escapeHtml(item.research_center || '')
      const fieldText = escapeHtml(item.field || '')
      const provinceText = escapeHtml(item.province || '')
      const regionText = escapeHtml(item.region || '')
      const notesText = escapeHtml(item.data_notes || '')
      const countedText = item.is_counted ? 'Ya' : 'Tidak'

      return `
        <tr style="background-color: ${rowBg};">
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Consolas', 'Segoe UI', monospace; font-size: 10pt; font-weight: bold; color: #1E40AF; text-align: center; white-space: nowrap;">
            ${idText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 12px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #0F172A; text-align: left; line-height: 1.4;">
            <strong>${titleText}</strong>
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${mediaText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: center;">
            ${coverageText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: center; white-space: nowrap;">
            ${yearText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #047857; text-align: center; font-weight: 600;">
            ${sourceText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #1E293B; text-align: left;">
            ${authorText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${researchCenterText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${fieldText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${provinceText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${regionText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 9.5pt; color: #64748B; text-align: left;">
            ${notesText}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 8px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; font-weight: bold; color: ${item.is_counted ? '#059669' : '#94A3B8'}; text-align: center;">
            ${countedText}
          </td>
        </tr>
      `
    })
    .join('')

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Publikasi BRIN</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        .title-banner {
          background-color: #0F172A;
          color: #FFFFFF;
          font-size: 15pt;
          font-weight: bold;
          text-align: center;
          padding: 16px;
          border: 1px solid #0F172A;
        }
        .meta-label {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          font-weight: bold;
          color: #475569;
          background-color: #F1F5F9;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .meta-val {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          color: #0F172A;
          background-color: #FFFFFF;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .th-header {
          background-color: #1E293B;
          color: #FFFFFF;
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10.5pt;
          font-weight: bold;
          padding: 10px 8px;
          text-align: center;
          border: 1px solid #0F172A;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th colspan="13" class="title-banner">
            DAFTAR PUBLIKASI RISET BRIN · RESEARCH TABLE
          </th>
        </tr>
        <tr>
          <td colspan="13" style="height: 10px;"></td>
        </tr>

        <tr>
          <td class="meta-label">Waktu Unduh:</td>
          <td class="meta-val" colspan="4">${dateFormatted}, ${timeFormatted} WIB</td>
          <td class="meta-label">Total Data:</td>
          <td class="meta-val" colspan="7">${data.length} Publikasi</td>
        </tr>
        <tr>
          <td colspan="13" style="height: 12px;"></td>
        </tr>

        <thead>
          <tr>
            <th class="th-header" style="width: 100px;">ID</th>
            <th class="th-header" style="width: 420px;">Judul</th>
            <th class="th-header" style="width: 130px;">Media Publikasi</th>
            <th class="th-header" style="width: 110px;">Cakupan</th>
            <th class="th-header" style="width: 70px;">Tahun</th>
            <th class="th-header" style="width: 100px;">Sumber</th>
            <th class="th-header" style="width: 260px;">Penulis BRIN</th>
            <th class="th-header" style="width: 260px;">Pusat Riset / Satker</th>
            <th class="th-header" style="width: 200px;">Bidang</th>
            <th class="th-header" style="width: 150px;">Provinsi</th>
            <th class="th-header" style="width: 130px;">Wilayah</th>
            <th class="th-header" style="width: 220px;">Catatan data</th>
            <th class="th-header" style="width: 80px;">Dihitung</th>
          </tr>
        </thead>

        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob(['\uFEFF' + excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileDateStr = now.toISOString().split('T')[0]
  link.href = url
  link.setAttribute('download', `Daftar_Publikasi_BRIN_${fileDateStr}.xls`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

