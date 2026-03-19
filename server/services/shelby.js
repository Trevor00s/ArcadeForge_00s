// Shelby storage is handled client-side via @shelby-protocol/sdk/browser
// This file kept for profile routes only

export async function getProfile(_userId) { return null }
export async function saveProfile(_userId, profile) { return profile }
export async function getGames(_userId) { return [] }
export async function saveGame(_userId, game) { return game }
export async function deleteGame(_userId, _gameId) { }