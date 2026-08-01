/**
 * Jest manual mock for imageMapper.js
 *
 * imageMapper.js relies on Webpack's require.context API, which does not exist
 * in the Jest environment. This mock provides the same export interface so that
 * components and modules that depend on imageMapper can be loaded normally in Jest.
 */

export const resolveImageUrl = jest.fn((url) => url || 'mock-image.png');
export const resolveMealCover = jest.fn((date) => `mock-meal-cover-${date || 'default'}.png`);
export const getAllImages = jest.fn(() => ({}));
export const getAllMealCovers = jest.fn(() => ({}));
