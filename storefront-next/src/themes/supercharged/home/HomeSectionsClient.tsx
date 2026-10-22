'use client';

import { useEffect, useRef, useState } from 'react';
import { SECTION_REGISTRY, type SectionType } from './sectionRegistry';
import type { PageSection } from '../../../lib/pageLayout';

type SelectedSection = { key: string; label: string } | null;

// Renders the Home page's sections from data, and — when this page is
// loaded inside the admin Theme Editor's preview iframe — stays in sync
// with unsaved edits via postMessage, so the preview updates live as the
// admin reorders/hides/edits sections, before they click Save. It also
// outlines + labels whichever section is currently selected in the
// editor's sidebar (and scrolls it into view), matching Shopify's own
// preview behavior.
export default function HomeSectionsClient({ initialSections }: { initialSections: PageSection[] }) {
  const [sections, setSections] = useState(initialSections);
  const [selected, setSelected] = useState<SelectedSection>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.source !== 'piaarya-theme-editor') return;
      if (Array.isArray(event.data.sections)) setSections(event.data.sections);
      if ('selected' in event.data) setSelected(event.data.selected);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!selected) return;
    sectionRefs.current[selected.key]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selected]);

  return (
    <>
      {sections
        .filter((section) => section.visible)
        .map((section) => {
          const Component = SECTION_REGISTRY[section.type as SectionType];
          if (!Component) return null;
          const isSelected = selected?.key === section.key;
          return (
            <div
              key={section.key}
              ref={(el) => {
                sectionRefs.current[section.key] = el;
              }}
              className="relative"
            >
              <Component {...section.settings} />
              {isSelected && (
                <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-blue-600 z-50">
                  <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-medium px-2 py-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                    {selected.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}
