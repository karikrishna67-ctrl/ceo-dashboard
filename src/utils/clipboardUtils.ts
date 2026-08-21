/**
 * Utility functions for copying structured table data and financial statements
 * to the clipboard formatted as clean plain text and rich HTML for email and documents.
 */

export interface FormattedTableColumn {
  header: string;
  key: string;
  align?: 'left' | 'right' | 'center';
}

export interface FormattedTableRow {
  [key: string]: any;
}

export interface CopyTableOptions {
  title: string;
  subtitle?: string;
  periodLabel?: string;
  filteredCategory?: string;
  columns: FormattedTableColumn[];
  rows: FormattedTableRow[];
  highlights?: string[];
  footerNote?: string;
}

/**
 * Copies structured report table data to clipboard in both rich HTML and formatted plain text.
 */
export async function copyTableToClipboard(options: CopyTableOptions): Promise<boolean> {
  const {
    title,
    subtitle = '',
    periodLabel = 'Current Period',
    filteredCategory = 'All Metrics',
    columns,
    rows,
    highlights = [],
    footerNote = 'Exported from Executive Financial Intelligence Suite',
  } = options;

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. Build Plain Text Format (for plain text emails, terminal, code blocks, Slack)
  let plainText = `================================================================================\n`;
  plainText += `${title.toUpperCase()}\n`;
  plainText += `Period: ${periodLabel} | Filter: ${filteredCategory} | Generated: ${timestamp}\n`;
  if (subtitle) {
    plainText += `${subtitle}\n`;
  }
  plainText += `================================================================================\n\n`;

  // Determine max width per column for alignment
  const colWidths = columns.map((col) => {
    const headerLen = col.header.length;
    const maxValLen = rows.reduce((max, row) => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—';
      return Math.max(max, val.length);
    }, headerLen);
    return Math.max(maxValLen, headerLen) + 2;
  });

  // Plain Text Table Header
  const headerLine = columns
    .map((col, idx) => {
      const align = col.align || 'left';
      const text = col.header;
      const width = colWidths[idx];
      return align === 'right' ? text.padStart(width) : text.padEnd(width);
    })
    .join(' | ');

  const separatorLine = colWidths.map((w) => '-'.repeat(w)).join('-+-');

  plainText += `${headerLine}\n`;
  plainText += `${separatorLine}\n`;

  // Plain Text Table Rows
  rows.forEach((row) => {
    const rowLine = columns
      .map((col, idx) => {
        const align = col.align || 'left';
        const text = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—';
        const width = colWidths[idx];
        return align === 'right' ? text.padStart(width) : text.padEnd(width);
      })
      .join(' | ');
    plainText += `${rowLine}\n`;
  });

  // Highlights section
  if (highlights.length > 0) {
    plainText += `\nKEY EXECUTIVE TAKEAWAYS:\n`;
    highlights.forEach((hl) => {
      plainText += `• ${hl}\n`;
    });
  }

  plainText += `\n--------------------------------------------------------------------------------\n`;
  plainText += `${footerNote} (${timestamp})\n`;

  // 2. Build Rich HTML Format (for rich email clients like Gmail, Outlook, Apple Mail)
  let html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 13px; max-width: 800px;">`;
  html += `  <div style="background-color: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0;">`;
  html += `    <h2 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">${title}</h2>`;
  html += `    <div style="font-size: 12px; color: #94a3b8;">`;
  html += `      <strong>Period:</strong> ${periodLabel} &nbsp;|&nbsp; <strong>Filter:</strong> ${filteredCategory} &nbsp;|&nbsp; <strong>Generated:</strong> ${timestamp}`;
  html += `    </div>`;
  if (subtitle) {
    html += `    <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">${subtitle}</div>`;
  }
  html += `  </div>`;

  html += `  <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; font-size: 12px; text-align: left;">`;
  html += `    <thead>`;
  html += `      <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">`;
  columns.forEach((col) => {
    const align = col.align || 'left';
    html += `        <th style="padding: 10px 12px; text-align: ${align}; border-bottom: 2px solid #cbd5e1;">${col.header}</th>`;
  });
  html += `      </tr>`;
  html += `    </thead>`;
  html += `    <tbody>`;

  rows.forEach((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    html += `      <tr style="background-color: ${bgColor}; border-bottom: 1px solid #f1f5f9;">`;
    columns.forEach((col) => {
      const align = col.align || 'left';
      const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—';
      const isBold = col.key === 'metric' || col.key === 'current';
      html += `        <td style="padding: 8px 12px; text-align: ${align}; ${isBold ? 'font-weight: 600; color: #0f172a;' : 'color: #334155;'}">${val}</td>`;
    });
    html += `      </tr>`;
  });

  html += `    </tbody>`;
  html += `  </table>`;

  if (highlights.length > 0) {
    html += `  <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-top: none; padding: 12px 16px; border-radius: 0 0 8px 8px;">`;
    html += `    <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.5px;">Executive Highlights</div>`;
    html += `    <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 12px;">`;
    highlights.forEach((hl) => {
      html += `      <li style="margin-bottom: 4px;">${hl}</li>`;
    });
    html += `    </ul>`;
    html += `  </div>`;
  }

  html += `  <div style="font-size: 10px; color: #94a3b8; margin-top: 8px; text-align: right;">${footerNote} • ${timestamp}</div>`;
  html += `</div>`;

  // 3. Write to Clipboard using standard Clipboard API
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const item = new ClipboardItem({
        'text/plain': textBlob,
        'text/html': htmlBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainText);
      return true;
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = plainText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
    // Attempt plaintext fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
        return true;
      }
    } catch (fallbackErr) {
      console.error('Plain text fallback failed:', fallbackErr);
    }
    return false;
  }
}
