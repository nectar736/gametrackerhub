/**
 * Storage Module - Handles localStorage operations for the board game tracker
 * Provides a unified interface for CRUD operations on all data types
 */

const STORAGE_KEYS = {
  USERS: 'bgt_users',
  GAMES: 'bgt_games',
  MATCHES: 'bgt_matches',
  SETTINGS: 'bgt_settings',
  CURRENT_USER: 'bgt_current_user'
};

class Storage {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GAMES)) {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        theme: 'light',
        currency: 'USD'
      }));
    }
  }

  _getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return [];
    }
  }

  _setData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
      return false;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // ===== USER OPERATIONS =====

  getAllUsers() {
    return this._getData(STORAGE_KEYS.USERS);
  }

  getUser(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id);
  }

  createUser(userData) {
    const users = this.getAllUsers();
    const newUser = {
      id: this.generateId(),
      name: userData.name.trim(),
      email: userData.email?.trim() || '',
      avatar: userData.avatar || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this._setData(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._setData(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  deleteUser(id) {
    const users = this.getAllUsers();
    const filtered = users.filter(u => u.id !== id);
    this._setData(STORAGE_KEYS.USERS, filtered);
    
    // Also delete related matches
    const matches = this.getAllMatches();
    const filteredMatches = matches.filter(m => m.playerIds.includes(id));
    this._setData(STORAGE_KEYS.MATCHES, matches.filter(m => !m.playerIds.includes(id)));
    
    return filtered.length < users.length;
  }

  // ===== GAME OPERATIONS =====

  getAllGames() {
    return this._getData(STORAGE_KEYS.GAMES);
  }

  getGame(id) {
    const games = this.getAllGames();
    return games.find(g => g.id === id);
  }

  createGame(gameData) {
    const games = this.getAllGames();
    const newGame = {
      id: this.generateId(),
      name: gameData.name.trim(),
      description: gameData.description?.trim() || '',
      minPlayers: parseInt(gameData.minPlayers) || 1,
      maxPlayers: parseInt(gameData.maxPlayers) || 99,
      category: gameData.category?.trim() || 'Other',
      playingTime: parseInt(gameData.playingTime) || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    games.push(newGame);
    this._setData(STORAGE_KEYS.GAMES, games);
    return newGame;
  }

  updateGame(id, updates) {
    const games = this.getAllGames();
    const index = games.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    games[index] = {
      ...games[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._setData(STORAGE_KEYS.GAMES, games);
    return games[index];
  }

  deleteGame(id) {
    const games = this.getAllGames();
    const filtered = games.filter(g => g.id !== id);
    this._setData(STORAGE_KEYS.GAMES, filtered);
    
    // Also delete related matches
    const matches = this.getAllMatches();
    this._setData(STORAGE_KEYS.MATCHES, matches.filter(m => m.gameId !== id));
    
    return filtered.length < games.length;
  }

  // ===== MATCH OPERATIONS =====

  getAllMatches() {
    return this._getData(STORAGE_KEYS.MATCHES);
  }

  getMatch(id) {
    const matches = this.getAllMatches();
    return matches.find(m => m.id === id);
  }

  getMatchesByGame(gameId) {
    return this.getAllMatches().filter(m => m.gameId === gameId);
  }

  getMatchesByUser(userId) {
    return this.getAllMatches().filter(m => m.playerIds.includes(userId));
  }

  createMatch(matchData) {
    const matches = this.getAllMatches();
    
    // Calculate rankings based on scores
    const playersWithScores = matchData.results.map(r => ({
      ...r,
      score: parseFloat(r.score) || 0
    }));
    playersWithScores.sort((a, b) => b.score - a.score);
    
    const rankings = {};
    let currentRank = 1;
    playersWithScores.forEach((p, i) => {
      if (i > 0 && p.score === playersWithScores[i-1].score) {
        rankings[p.playerId] = rankings[playersWithScores[i-1].playerId];
      } else {
        rankings[p.playerId] = currentRank;
      }
      currentRank++;
    });

    const newMatch = {
      id: this.generateId(),
      gameId: matchData.gameId,
      playerIds: matchData.playerIds,
      results: matchData.results.map(r => ({
        playerId: r.playerId,
        score: parseFloat(r.score) || 0,
        rank: rankings[r.playerId],
        notes: r.notes || ''
      })),
      playedAt: matchData.playedAt || new Date().toISOString(),
      duration: parseInt(matchData.duration) || null,
      location: matchData.location?.trim() || '',
      notes: matchData.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    matches.push(newMatch);
    this._setData(STORAGE_KEYS.MATCHES, matches);
    return newMatch;
  }

  updateMatch(id, updates) {
    const matches = this.getAllMatches();
    const index = matches.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    matches[index] = {
      ...matches[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._setData(STORAGE_KEYS.MATCHES, matches);
    return matches[index];
  }

  deleteMatch(id) {
    const matches = this.getAllMatches();
    const filtered = matches.filter(m => m.id !== id);
    this._setData(STORAGE_KEYS.MATCHES, filtered);
    return filtered.length < matches.length;
  }

  // ===== SETTINGS =====

  getSettings() {
    return this._getData(STORAGE_KEYS.SETTINGS);
  }

  updateSettings(updates) {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    this._setData(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // ===== CURRENT USER (for multi-user app) =====

  getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  }

  setCurrentUser(userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  }

  // ===== EXPORT/IMPORT =====

  exportAll() {
    return {
      users: this.getAllUsers(),
      games: this.getAllGames(),
      matches: this.getAllMatches(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.users) this._setData(STORAGE_KEYS.USERS, data.users);
    if (data.games) this._setData(STORAGE_KEYS.GAMES, data.games);
    if (data.matches) this._setData(STORAGE_KEYS.MATCHES, data.matches);
    if (data.settings) this._setData(STORAGE_KEYS.SETTINGS, data.settings);
  }

  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.init();
  }
}

// Export singleton instance
window.Storage = new Storage();
