import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndustrySector } from '../data/industrySectors';
import { Organization } from '../types';

export interface ExportPdfOptions {
  sectors: IndustrySector[];
  org: Organization;
  filterSummary?: string;
  reportTitle?: string;
  totalSubIndustriesCount?: number;
}

export function generateIndustryTaxonomyPDF(options: ExportPdfOptions): void {
  const {
    sectors,
    org,
    filterSummary,
    reportTitle = 'Executive Industry Sector Taxonomy & Domain Benchmarks',
    totalSubIndustriesCount = sectors.reduce((sum, s) => sum + s.subIndustriesCount, 0),
  } = options;

  // Initialize jsPDF document (Landscape orientation for rich data table, or Portrait)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate sector metrics averages
  const avgMargin = (
    sectors.reduce((acc, s) => acc + s.benchmarkGrossMargin, 0) / (sectors.length || 1)
  ).toFixed(1);
  const avgCACtoLTV = (
    sectors.reduce((acc, s) => acc + s.benchmarkCACtoLTV, 0) / (sectors.length || 1)
  ).toFixed(1);
  const avgSalesCycle = Math.round(
    sectors.reduce((acc, s) => acc + s.typicalSalesCycleDays, 0) / (sectors.length || 1)
  );

  // --- HEADER SECTION ---
  // Top Accent Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 56, 'F');

  // Accent Line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 56, pageWidth, 4, 'F');

  // Title in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(reportTitle.toUpperCase(), 36, 32);

  // Subtitle in Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('OFFLINE EXECUTIVE STRATEGY & BENCHMARK REVIEW DOSSIER', 36, 46);

  // Right-aligned Date & Organization in Header
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(`Organization: ${org.name}`, pageWidth - 36, 28, { align: 'right' });
  doc.text(`Generated: ${today} | Fiscal Period: FY26`, pageWidth - 36, 42, { align: 'right' });

  // --- EXECUTIVE SUMMARY METRICS BANNER ---
  const bannerY = 72;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(36, bannerY, pageWidth - 72, 54, 4, 4, 'FD');

  // Box 1: Evaluated Sectors
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('SECTOR CLASSIFICATIONS', 52, bannerY + 18);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`${sectors.length} Master Sectors`, 52, bannerY + 36);

  // Box 2: Total Sub-Industries
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EXTRACTED DOMAINS', 190, bannerY + 18);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalSubIndustriesCount} Sub-Industries`, 190, bannerY + 36);

  // Box 3: Benchmark Margin
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AVG GROSS MARGIN', 340, bannerY + 18);
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`${avgMargin}% Baseline`, 340, bannerY + 36);

  // Box 4: Benchmark LTV:CAC
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AVG LTV : CAC RATIO', 480, bannerY + 18);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${avgCACtoLTV}x Standard`, 480, bannerY + 36);

  // Box 5: Active Calibration
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ACTIVE CALIBRATED SECTOR', 620, bannerY + 18);
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // amber-600
  const activeName = org.industry || 'Technology & Software';
  doc.text(activeName.length > 22 ? activeName.substring(0, 20) + '...' : activeName, 620, bannerY + 36);

  // Filter notes if present
  let startTableY = 138;
  if (filterSummary) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Active Filter Criteria: ${filterSummary}`, 36, startTableY - 4);
    startTableY += 8;
  }

  // --- STRUCTURED TABLE WITH autoTable ---
  const tableData = sectors.map((sector, index) => {
    const isCurrent = (org.industry || '').trim().toLowerCase() === sector.name.trim().toLowerCase();
    const sectorDisplay = isCurrent ? `[ACTIVE] ${sector.name}` : sector.name;
    const subIndustriesText = sector.subIndustries.join('  |  ');

    return [
      (index + 1).toString(),
      sectorDisplay,
      `${sector.subIndustriesCount} Domains`,
      `${sector.benchmarkGrossMargin}%`,
      `${sector.benchmarkCACtoLTV}x`,
      `${sector.typicalSalesCycleDays} Days`,
      subIndustriesText,
      sector.description,
    ];
  });

  autoTable(doc, {
    startY: startTableY,
    head: [[
      '#',
      'Industry Sector',
      'Domains',
      'Gross Margin',
      'LTV:CAC',
      'Sales Cycle',
      'Extracted Sub-Industry Domains',
      'Operational Scope & Description',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 6,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 5,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 110, fontStyle: 'bold' },
      2: { cellWidth: 50, halign: 'center' },
      3: { cellWidth: 62, halign: 'center' },
      4: { cellWidth: 50, halign: 'center' },
      5: { cellWidth: 60, halign: 'center' },
      6: { cellWidth: 210 },
      7: { cellWidth: 200, textColor: [71, 85, 105] },
    },
    didParseCell: (data) => {
      // Highlight the active sector row
      if (data.section === 'body' && data.row.raw) {
        const sectorCellText = String((data.row.raw as any)[1] || '');
        if (sectorCellText.startsWith('[ACTIVE]')) {
          if (data.column.index === 1) {
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
            data.cell.styles.fontStyle = 'bold';
          }
          data.cell.styles.fillColor = [254, 243, 199]; // amber-100/50
        }
      }
    },
    didDrawPage: (data) => {
      // Page Footer
      const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
      const currentPage = data.pageNumber;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400

      // Left Footer: Confidentiality & Executive Note
      doc.text(
        `Confidential — For Internal Executive & Board Review Only | ${org.name}`,
        36,
        pageHeight - 20
      );

      // Right Footer: Page Number
      doc.text(
        `Page ${currentPage}`,
        pageWidth - 36,
        pageHeight - 20,
        { align: 'right' }
      );

      // Footer Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.line(36, pageHeight - 28, pageWidth - 36, pageHeight - 28);
    },
    margin: { top: 70, bottom: 40, left: 36, right: 36 },
  });

  // Save and download the PDF document
  const cleanOrgName = (org.name || 'Executive').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${cleanOrgName}_Industry_Sector_Taxonomy_${timestamp}.pdf`;
  
  doc.save(filename);
}
