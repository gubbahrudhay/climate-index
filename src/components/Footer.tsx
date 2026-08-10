"use client";

import React, { memo } from "react";

const Footer = memo(function Footer() {
  return (
    <footer
      className="relative border-t border-hairline bg-paper px-4 py-16"
      id="footer"
    >
      <div className="mx-auto max-w-4xl">
        {/* Methodology note */}
        <div className="mb-12 border border-hairline p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-ink">
                Methodology Note
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Data shown is illustrative placeholder data — real methodology
                and sources to be added. The Indian Climate Index is inspired
                by the{" "}
                <a
                  href="https://actuariesclimateindex.org/home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-ink"
                >
                  Actuaries Climate Index
                </a>{" "}
                concept but reimagined for India. Component scores represent
                standardized anomalies relative to a 1990–2020 reference
                period.
              </p>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              About
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Methodology
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Data Sources
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Reference
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://actuariesclimateindex.org/home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Actuaries Climate Index ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.actuaries.asn.au/climate-index/graphs-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  ACI Graphs &amp; Data ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Map Data
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/udit-001/india-maps-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  India Maps Data (TopoJSON) ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/datameet/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  DataMeet Maps ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-hairline pt-6 text-center">
          <p className="text-xs font-medium text-muted">
            Indian Climate Index • Placeholder Data Demo •{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
