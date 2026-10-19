import React from 'react';

/**
 * Logo Oficial Plurix em SVG Vetorial para fundos claros (#00147E)
 * Conforme especificação da Seção 6.1 do Design System Plurix Hub.
 */
export function PlurixLogo({ height = 24, className = '' }: { height?: number; className?: string }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      height={height}
      className={className}
      style={{ display: 'block' }}
      aria-label="Plurix"
    >
      <style>{`.st-plx-dark{fill:#00147E;}`}</style>
      <g>
        <path className="st-plx-dark" d="M564.2,371.8H626v331.7h-61.9V371.8z" />
        <path
          className="st-plx-dark"
          d="M962.2,456.5v246.5h-61.4v-82c-17,50.2-56.9,87.4-116.1,87.4c-79.8,0-110.7-55.6-110.7-116.1V456.5h61.9v128.2c0,45.3,23.3,69.9,66.8,69.9c56.9,0,98.2-43.5,98.2-134v-64.1L962.2,456.5z"
        />
        <path
          className="st-plx-dark"
          d="M1225.3,459.4c-13.8-4.2-30.5-6.9-47.6-6.9c-56.5,0-92.8,35-109.4,82v-78h-61.9v246.5h61.9v-68.1c0-82,39.4-129.1,104-129.1c22.4,0,40,5.2,52.9,11.3V459.4L1225.3,459.4z"
        />
        <g>
          <path className="st-plx-dark" d="M1269.6,456.5h61.9v246.5h-61.9V456.5L1269.6,456.5z" />
          <circle className="st-plx-dark" cx="1300.5" cy="406.3" r="35" />
        </g>
        <path
          className="st-plx-dark"
          d="M1554.4,601.7l24.4-22.5l120.1-123.3h-79.3l-83.8,86.4c-9.1-51.1-53.2-89.9-106.4-89.9c-18.9,0-36.8,3.6-53.3,10.1v60.3c15.7-9,33.9-14.2,53.3-14.2c37.7,0,70.8,19.5,90.2,49l-22.8,21.6l-120.6,123.3h79.8l82.9-86.3c8,52.4,52.8,92.6,106.8,92.6c18.9,0,36.8-3.6,53.3-10.1v-60.3c-15.7,9-33.9,14.2-53.3,14.2C1607.3,652.5,1573.6,632.2,1554.4,601.7z"
        />
        <path
          className="st-plx-dark"
          d="M389.2,371.4H221.1v331.1h65.3V562.2c30.4,9,65.9,14.2,103.9,14.2c76.7,0.5,126.4-45.8,126.4-105.5S460.9,371.4,389.2,371.4z M440,505.1c-12.8,12.8-33.3,19.8-58,19.8h-0.8c-29.4,0-58-3.9-82.7-11.2l-12.1-4.6v-86h93.9c48.3,0,73.6,24.2,73.6,48.2C453.9,484.5,449.2,495.9,440,505.1z"
        />
      </g>
    </svg>
  );
}
