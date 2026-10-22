'use client';

import { useEffect, useState } from 'react';
import { SECTION_REGISTRY, type SectionType } from './sectionRegistry';
import type { PageSection } from '../../../lib/pageLayout';

// Renders the Home page's sections from data, and — when this page is
// loaded inside the admin Theme Editor's preview iframe — stays in sync
// with unsaved edits via postMessage, so the preview updates live as the
// admin reorders/hides/edits sections, before they click Save.
export default function HomeSectionsClient({ initialSections }: { initialSections: PageSection[] }) {
  const [sections, setSections] = useState(initialSections);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.source === 'piaarya-theme-editor' && Array.isArray(event.data.sections)) {
        setSections(event.data.sections);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      {sections
        .filter((section) => section.visible)
        .map((section) => {
          const Component = SECTION_REGISTRY[section.type as SectionType];
          if (!Component) return null;
          return <Component key={section.key} {...section.settings} />;
        })}
    </>
  );
}
