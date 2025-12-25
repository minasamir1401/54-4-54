/**
 * Sitemap Generator Script
 * Generates sitemap.xml for all movies, series, and pages
 */

import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://lmina.com'; // Replace with your actual domain

// Sample data - replace with actual API calls
const pages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/movies', changefreq: 'daily', priority: 0.9 },
  { url: '/series', changefreq: 'daily', priority: 0.9 },
  { url: '/search', changefreq: 'weekly', priority: 0.7 },
];

const movies = [
  // Fetch from your API
  // { slug: 'the-dark-knight', lastmod: '2025-12-20' },
];

const series = [
  // Fetch from your API
  // { slug: 'breaking-bad', lastmod: '2025-12-20' },
];

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${movies.map(movie => `  <url>
    <loc>${SITE_URL}/movie/${movie.slug}</loc>
    <lastmod>${movie.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${series.map(show => `  <url>
    <loc>${SITE_URL}/series/${show.slug}</loc>
    <lastmod>${show.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully!');
}

generateSitemap();
