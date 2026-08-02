import { useEffect } from 'react';

const DEFAULT_TITLE = 'Piaarya';

// Sets document title/meta description/canonical for the current page and
// resets on unmount. Pass a jsonLd object to also inject a
// application/ld+json structured-data script (removed on unmount).
export function useSeo({ title, description, canonicalPath, jsonLd } = {}) {
  useEffect(() => {
    if (title) document.title = title;

    let metaDescription;
    if (description) {
      metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    let canonicalLink;
    if (canonicalPath) {
      canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', `${window.location.origin}${canonicalPath}`);
    }

    let jsonLdScript;
    if (jsonLd) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (jsonLdScript) jsonLdScript.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonicalPath, jsonLd ? JSON.stringify(jsonLd) : null]);
}
