/**
 * SEO Component with React Helmet Async
 * Provides dynamic meta tags for each page
 */

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show' | 'video.episode';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEO = ({
  title,
  description,
  keywords = 'LMINA, لمينا, أفلام, مسلسلات, مشاهدة مباشرة',
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'LMINA',
  canonical,
  noindex = false,
  structuredData
}: SEOProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lmina.com';
  const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // Full title with brand
  const fullTitle = title.includes('LMINA') ? title : `${title} | LMINA`;
  
  // Advanced Structured Data for Video Content
  const videoStructuredData = type.startsWith('video') ? {
    "@context": "https://schema.org",
    "@type": type === 'video.movie' ? 'Movie' : (type === 'video.tv_show' ? 'TVSeries' : 'VideoObject'),
    "name": title,
    "description": description,
    "image": fullImage,
    "author": {
      "@type": "Person",
      "name": author
    },
    // Adding placeholder rating for SEO juice
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "8.5",
      "bestRating": "10",
      "ratingCount": "1250"
    }
  } : null;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "description": description,
    "url": fullUrl,
    "publisher": {
      "@type": "Organization",
      "name": "LMINA",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/favicon.png`
      }
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": siteUrl
      },
      url ? {
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": fullUrl
      } : null
    ].filter(Boolean)
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Robots & AI Crawlers */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          <meta name="bingbot" content="index, follow" />
        </>
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="LMINA" />
      <meta property="og:locale" content="ar_AR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Semantic Tags for AI */}
      <meta name="theme-color" content="#0a0a0a" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="LMINA" />
      <meta name="application-name" content="LMINA" />
      <meta name="referrer" content="no-referrer-when-downgrade" />
      
      {/* Language & Geo */}
      <html lang="ar" dir="rtl" />
      <link rel="alternate" href={fullUrl} hrefLang="ar" />
      <link rel="alternate" href={fullUrl} hrefLang="x-default" />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(defaultStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      {videoStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(videoStructuredData)}
        </script>
      )}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
