/**
 * Structured Data Generators for Schema.org
 * Generates JSON-LD for Movies, TV Series, Episodes, and Breadcrumbs
 */

interface Movie {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  year?: string;
  rating?: number;
  genre?: string[];
  duration?: string;
}

interface TVSeries {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  year?: string;
  rating?: number;
  genre?: string[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}

interface Episode {
  id: string;
  title: string;
  description?: string;
  episodeNumber: number;
  seasonNumber: number;
  seriesTitle: string;
  thumbnail?: string;
  duration?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Movie Schema
 */
export const generateMovieSchema = (movie: Movie, siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.description || `شاهد فيلم ${movie.title} على منصة MOVIDO`,
    image: movie.poster || `${siteUrl}/default-poster.jpg`,
    url: `${siteUrl}/movie/${slugify(movie.title)}`,
    datePublished: movie.year,
    aggregateRating: movie.rating ? {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      bestRating: 10,
      worstRating: 1
    } : undefined,
    genre: movie.genre || [],
    duration: movie.duration || 'PT2H',
    inLanguage: 'ar',
    provider: {
      '@type': 'Organization',
      name: 'MOVIDO',
      url: siteUrl
    }
  };
};

/**
 * Generate TV Series Schema
 */
export const generateTVSeriesSchema = (series: TVSeries, siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: series.title,
    description: series.description || `شاهد مسلسل ${series.title} على منصة MOVIDO`,
    image: series.poster || `${siteUrl}/default-poster.jpg`,
    url: `${siteUrl}/series/${slugify(series.title)}`,
    datePublished: series.year,
    aggregateRating: series.rating ? {
      '@type': 'AggregateRating',
      ratingValue: series.rating,
      bestRating: 10,
      worstRating: 1
    } : undefined,
    genre: series.genre || [],
    numberOfSeasons: series.numberOfSeasons,
    numberOfEpisodes: series.numberOfEpisodes,
    inLanguage: 'ar',
    provider: {
      '@type': 'Organization',
      name: 'MOVIDO',
      url: siteUrl
    }
  };
};

/**
 * Generate Episode Schema
 */
export const generateEpisodeSchema = (episode: Episode, siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: episode.title,
    description: episode.description || `الحلقة ${episode.episodeNumber} من مسلسل ${episode.seriesTitle}`,
    episodeNumber: episode.episodeNumber,
    seasonNumber: episode.seasonNumber,
    partOfSeries: {
      '@type': 'TVSeries',
      name: episode.seriesTitle,
      url: `${siteUrl}/series/${slugify(episode.seriesTitle)}`
    },
    image: episode.thumbnail || `${siteUrl}/default-poster.jpg`,
    url: `${siteUrl}/watch/${episode.id}`,
    duration: episode.duration || 'PT45M',
    inLanguage: 'ar',
    provider: {
      '@type': 'Organization',
      name: 'MOVIDO',
      url: siteUrl
    }
  };
};

/**
 * Generate VideoObject Schema
 */
export const generateVideoObjectSchema = (video: Movie | TVSeries, siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || `شاهد ${video.title} على منصة MOVIDO`,
    thumbnailUrl: video.poster || `${siteUrl}/default-poster.jpg`,
    uploadDate: video.year,
    contentUrl: `${siteUrl}/watch/${video.id}`,
    embedUrl: `${siteUrl}/embed/${video.id}`,
    inLanguage: 'ar',
    publisher: {
      '@type': 'Organization',
      name: 'MOVIDO',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    }
  };
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[], siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
    }))
  };
};

/**
 * Generate Organization Schema
 */
export const generateOrganizationSchema = (siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MOVIDO',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`
    },
    description: 'منصة MOVIDO لمشاهدة الأفلام والمسلسلات العربية والأجنبية بجودة عالية',
    sameAs: [
      // Add social media links here
    ]
  };
};

/**
 * Generate WebSite Schema with Search Action
 */
export const generateWebSiteSchema = (siteUrl: string = 'https://movido.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MOVIDO',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Helper function to create URL-friendly slugs
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-\u0600-\u06FF]+/g, '') // Remove non-word chars except Arabic
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
};

/**
 * Generate SEO-friendly URL
 */
export const generateSEOUrl = (type: 'movie' | 'series' | 'episode', title: string, id: string): string => {
  const slug = slugify(title);
  return `/${type}/${slug}-${id}`;
};
