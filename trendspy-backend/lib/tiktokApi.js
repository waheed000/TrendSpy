/**
 * TikTok API helper using RapidAPI's TikTok endpoint.
 * Reads TIKTOK_RAPIDAPI_KEY from environment variables.
 * Throws clearly if the key is missing.
 */

import axios from 'axios';

const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

/**
 * Build RapidAPI request headers.
 * Throws if TIKTOK_RAPIDAPI_KEY is not set.
 * @returns {{ 'X-RapidAPI-Key': string, 'X-RapidAPI-Host': string }}
 */
function buildHeaders() {
  const key = process.env.TIKTOK_RAPIDAPI_KEY;
  if (!key) {
    throw new Error('TIKTOK_RAPIDAPI_KEY missing. Add to .env.local');
  }
  return {
    'X-RapidAPI-Key': key,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };
}

/**
 * Fetch trending videos for a specific hashtag.
 * @param {string} hashtag - Hashtag without the # symbol
 * @param {number} count - Number of videos to fetch (default: 10)
 * @returns {Promise<Array<{
 *   videoId: string,
 *   description: string,
 *   viewCount: number,
 *   likeCount: number,
 *   shareCount: number,
 *   hashtags: string[],
 *   authorName: string,
 * }>>}
 */
export async function fetchTrendingByHashtag(hashtag, count = 10) {
  const headers = buildHeaders();

  try {
    const response = await axios.get(`${BASE_URL}/hashtag/videos`, {
      headers,
      params: {
        name: hashtag.replace(/^#/, ''),
        count,
        cursor: 0,
      },
      timeout: 15000,
    });

    const videos = response.data?.data?.videos || response.data?.videos || [];

    return videos.map((v) => ({
      videoId: v.video_id || v.id || '',
      description: v.title || v.desc || '',
      viewCount: parseInt(v.play_count || v.stats?.playCount || 0, 10),
      likeCount: parseInt(v.digg_count || v.stats?.diggCount || 0, 10),
      shareCount: parseInt(v.share_count || v.stats?.shareCount || 0, 10),
      hashtags: (v.hashtags || []).map((h) => (typeof h === 'string' ? h : h.name || '')),
      authorName: v.author?.nickname || v.author?.unique_id || '',
    }));
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error(`TikTok API auth failed — check TIKTOK_RAPIDAPI_KEY`);
    }
    throw err;
  }
}

/**
 * Fetch trending videos in a given region.
 * @param {string} region - ISO region code (default: 'PK' for Pakistan)
 * @param {number} count - Number of videos (default: 20)
 * @returns {Promise<Array>}
 */
export async function fetchTrendingFeed(region = 'PK', count = 20) {
  const headers = buildHeaders();

  try {
    const response = await axios.get(`${BASE_URL}/feed/list`, {
      headers,
      params: {
        region,
        count,
      },
      timeout: 15000,
    });

    const videos = response.data?.data?.videos || response.data?.videos || [];

    return videos.map((v) => ({
      videoId: v.video_id || v.id || '',
      description: v.title || v.desc || '',
      viewCount: parseInt(v.play_count || v.stats?.playCount || 0, 10),
      likeCount: parseInt(v.digg_count || v.stats?.diggCount || 0, 10),
      shareCount: parseInt(v.share_count || v.stats?.shareCount || 0, 10),
      hashtags: (v.hashtags || []).map((h) => (typeof h === 'string' ? h : h.name || '')),
      authorName: v.author?.nickname || v.author?.unique_id || '',
    }));
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error(`TikTok API auth failed — check TIKTOK_RAPIDAPI_KEY`);
    }
    throw err;
  }
}

export default { fetchTrendingByHashtag, fetchTrendingFeed };
