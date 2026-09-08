/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} date
 */

/**
 * @typedef {Object} SiteSettings
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} WordPressContent
 * @property {Post[]} posts
 * @property {SiteSettings} settings
 */

/**
 * @typedef {Object} ExchangeRate
 * @property {string} base
 * @property {string} target
 * @property {number} rate
 * @property {string|null} date
 */

/**
 * @typedef {Object} RequestState
 * @property {boolean} loading
 * @property {unknown} data
 * @property {string} error
 */

export {};
