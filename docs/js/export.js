/**
 * CSV Export Module - Handles exporting data to CSV format
 */

class CSVExporter {
  constructor(storage = window.Storage) {
    this.storage = storage;
  }

  /**
   * Convert array of objects to CSV string
   */
  toCSV(data, headers = null) {
    if (!data || data.length === 0) return '';
    
    const keys = headers || Object.keys(data[0]);
    const headerRow = keys.join(',');
    
    const rows = data.map(row => {
      return keys.map(key => {
        let value = row[key];
        
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Handle arrays and objects
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
      }).join(',');
    });
    
    return [headerRow, ...rows].join('\n');
  }

  /**
   * Trigger file download
   */
  downloadFile(content, filename, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all users
   */
  exportUsers() {
    const users = this.storage.getAllUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));
    
    const csv = this.toCSV(users);
    this.downloadFile(csv, `users_${this._dateStamp()}.csv`);
    return users.length;
  }

  /**
   * Export all games
   */
  exportGames() {
    const games = this.storage.getAllGames().map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      minPlayers: g.minPlayers,
      maxPlayers: g.maxPlayers,
      category: g.category,
      playingTime: g.playingTime,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt
    }));
    
    const csv = this.toCSV(games);
    this.downloadFile(csv, `games_${this._dateStamp()}.csv`);
    return games.length;
  }

  /**
   * Export all matches with resolved player names
   */
  exportMatches() {
    const matches = this.storage.getAllMatches().map(m => {
      const game = this.storage.getGame(m.gameId);
      const players = m.results.map(r => {
        const user = this.storage.getUser(r.playerId);
        return `${user?.name || 'Unknown'}:${r.score}`;
      }).join('; ');
      
      const winners = m.results
        .filter(r => r.rank === 1)
        .map(r => this.storage.getUser(r.playerId)?.name || 'Unknown')
        .join(', ');

      return {
        id: m.id,
        game: game?.name || 'Unknown',
        players,
        winners,
        playedAt: m.playedAt,
        duration: m.duration,
        location: m.location,
        notes: m.notes,
        createdAt: m.createdAt
      };
    });
    
    const csv = this.toCSV(matches);
    this.downloadFile(csv, `matches_${this._dateStamp()}.csv`);
    return matches.length;
  }

  /**
   * Export user statistics
   */
  exportUserStats(userId) {
    const analytics = new window.Analytics();
    const stats = analytics.getUserStats(userId);
    
    if (!stats) return 0;
    
    const userStats = [{
      name: stats.user.name,
      email: stats.user.email,
      totalMatches: stats.totalMatches,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.winRate,
      totalScore: stats.totalScore,
      avgScore: stats.avgScore,
      gamesPlayed: stats.gamesPlayed
    }];
    
    const csv = this.toCSV(userStats);
    this.downloadFile(csv, `stats_${stats.user.name.replace(/\s+/g, '_')}_${this._dateStamp()}.csv`);
    return 1;
  }

  /**
   * Export game statistics
   */
  exportGameStats(gameId) {
    const analytics = new window.Analytics();
    const stats = analytics.getGameStats(gameId);
    
    if (!stats) return 0;
    
    const gameStats = [{
      name: stats.game.name,
      category: stats.game.category,
      totalMatches: stats.totalMatches,
      uniquePlayers: stats.uniquePlayers,
      avgDuration: stats.avgDuration
    }];
    
    // Add player stats
    if (stats.playerStats.length > 0) {
      const playerRows = stats.playerStats.map(p => ({
        gameName: stats.game.name,
        playerName: p.playerName,
        played: p.played,
        wins: p.wins,
        top3: p.top3,
        totalScore: p.totalScore,
        avgScore: (p.totalScore / p.played).toFixed(1)
      }));
      
      const csv = this.toCSV([...gameStats, ...playerRows]);
      this.downloadFile(csv, `stats_${stats.game.name.replace(/\s+/g, '_')}_${this._dateStamp()}.csv`);
    }
    
    return 1;
  }

  /**
   * Export leaderboard
   */
  exportLeaderboard() {
    const analytics = new window.Analytics();
    const leaderboard = analytics.getLeaderboard(50);
    
    const csv = this.toCSV(leaderboard);
    this.downloadFile(csv, `leaderboard_${this._dateStamp()}.csv`);
    return leaderboard.length;
  }

  /**
   * Export all data as JSON backup
   */
  exportAllData() {
    const data = this.storage.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boardgame_tracker_backup_${this._dateStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return data;
  }

  /**
   * Import data from JSON backup
   */
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!data.users || !data.games || !data.matches) {
            reject(new Error('Invalid backup file format'));
            return;
          }
          
          this.storage.importData(data);
          resolve({
            users: data.users.length,
            games: data.games.length,
            matches: data.matches.length
          });
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  _dateStamp() {
    return new Date().toISOString().slice(0, 10);
  }
}

// Export to window
window.CSVExporter = CSVExporter;
