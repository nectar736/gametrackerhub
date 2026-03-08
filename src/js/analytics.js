/**
 * Analytics Module - Provides statistics, rivalries, and trend analysis
 */

class Analytics {
  constructor(storage = window.Storage) {
    this.storage = storage;
  }

  // ===== GENERAL STATS =====

  getTotalStats() {
    const users = this.storage.getAllUsers();
    const games = this.storage.getAllGames();
    const matches = this.storage.getAllMatches();
    
    return {
      totalUsers: users.length,
      totalGames: games.length,
      totalMatches: matches.length,
      totalPlayTime: matches.reduce((sum, m) => sum + (m.duration || 0), 0)
    };
  }

  // ===== USER STATS =====

  getUserStats(userId) {
    const user = this.storage.getUser(userId);
    if (!user) return null;

    const matches = this.storage.getMatchesByUser(userId);
    const wins = matches.filter(m => {
      const result = m.results.find(r => r.playerId === userId);
      return result && result.rank === 1;
    }).length;
    
    const losses = matches.length - wins;
    const totalScore = matches.reduce((sum, m) => {
      const result = m.results.find(r => r.playerId === userId);
      return sum + (result?.score || 0);
    }, 0);
    const gameStats = {};
    matches.forEach(m => {
      if (!gameStats[m.gameId]) {
        const game = this.storage.getGame(m.gameId);
        gameStats[m.gameId] = {
          gameName: game?.name || 'Unknown',
          played: 0,
          wins: 0,
          totalScore: 0
        };
      }
      const result = m.results.find(r => r.playerId === userId);
      gameStats[m.gameId].played++;
      if (result?.rank === 1) gameStats[m.gameId].wins++;
      gameStats[m.gameId].totalScore += result?.score || 0;
    });

    return {
      user,
      totalMatches: matches.length,
      wins,
      losses,
      winRate: matches.length > 0 ? (wins / matches.length * 100).toFixed(1) : 0,
      totalScore,
      avgScore: matches.length > 0 ? (totalScore / matches.length).toFixed(1) : 0,
      gamesPlayed: Object.keys(gameStats).length,
      gameStats
    };
  }

  // ===== GAME STATS =====

  getGameStats(gameId) {
    const game = this.storage.getGame(gameId);
    if (!game) return null;

    const matches = this.storage.getMatchesByGame(gameId);
    const playerStats = {};

    matches.forEach(m => {
      m.results.forEach(r => {
        if (!playerStats[r.playerId]) {
          const player = this.storage.getUser(r.playerId);
          playerStats[r.playerId] = {
            playerName: player?.name || 'Unknown',
            played: 0,
            wins: 0,
            top3: 0,
            totalScore: 0
          };
        }
        playerStats[r.playerId].played++;
        if (r.rank === 1) playerStats[r.playerId].wins++;
        if (r.rank <= 3) playerStats[r.playerId].top3++;
        playerStats[r.playerId].totalScore += r.score;
      });
    });

    return {
      game,
      totalMatches: matches.length,
      uniquePlayers: Object.keys(playerStats).length,
      avgDuration: matches.length > 0 
        ? Math.round(matches.reduce((s, m) => s + (m.duration || 0), 0) / matches.length)
        : 0,
      playerStats: Object.values(playerStats).sort((a, b) => b.wins - a.wins)
    };
  }

  // ===== RIVALRIES =====

  getRivalries(userId) {
    const userMatches = this.storage.getMatchesByUser(userId);
    const opponents = {};

    userMatches.forEach(match => {
      match.playerIds.forEach(playerId => {
        if (playerId !== userId) {
          if (!opponents[playerId]) {
            opponents[playerId] = {
              playerId,
              matches: 0,
              wins: 0,
              losses: 0,
              totalScore: 0,
              opponentScore: 0
            };
          }
          const myResult = match.results.find(r => r.playerId === userId);
          const oppResult = match.results.find(r => r.playerId === playerId);
          
          opponents[playerId].matches++;
          opponents[playerId].totalScore += myResult?.score || 0;
          opponents[playerId].opponentScore += oppResult?.score || 0;
          
          if (myResult && oppResult) {
            if (myResult.rank < oppResult.rank) {
              opponents[playerId].wins++;
            } else if (myResult.rank > oppResult.rank) {
              opponents[playerId].losses++;
            }
          }
        }
      });
    });

    const user = this.storage.getUser(userId);
    return Object.values(opponents)
      .map(r => {
        const opponent = this.storage.getUser(r.playerId);
        return {
          ...r,
          playerName: opponent?.name || 'Unknown',
          winRate: r.matches > 0 ? (r.wins / r.matches * 100).toFixed(1) : 0,
          avgScore: (r.totalScore / r.matches).toFixed(1),
          avgOpponentScore: (r.opponentScore / r.matches).toFixed(1)
        };
      })
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 10);
  }

  getAllRivalries() {
    const users = this.storage.getAllUsers();
    const rivalries = [];

    users.forEach(user => {
      const userRivals = this.getRivalries(user.id);
      userRivals.forEach(rival => {
        rivalries.push({
          userId: user.id,
          userName: user.name,
          opponentId: rival.playerId,
          opponentName: rival.playerName,
          matches: rival.matches,
          wins: rival.wins,
          losses: rival.losses,
          winRate: rival.winRate
        });
      });
    });

    // Get unique rivalry pairs
    const uniqueRivals = [];
    const seen = new Set();
    
    rivalries.forEach(r => {
      const key = [r.userId, r.opponentId].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        const matchup = rivalries.find(rr => 
          [rr.userId, rr.opponentId].sort().join('-') === key && 
          rr.userId !== r.userId
        );
        
        if (matchup) {
          uniqueRivals.push({
            players: [r.userName, r.opponentName].sort(),
            totalMatches: r.matches + matchup.matches,
            player1Wins: r.wins,
            player2Wins: matchup.wins
          });
        } else {
          uniqueRivals.push({
            players: [r.userName, r.opponentName].sort(),
            totalMatches: r.matches,
            player1Wins: r.wins,
            player2Wins: r.losses
          });
        }
      }
    });

    return uniqueRivals
      .filter(r => r.totalMatches >= 2)
      .sort((a, b) => b.totalMatches - a.totalMatches)
      .slice(0, 10);
  }

  // ===== TRENDS =====

  getWinLossTrend(userId, days = 30) {
    const matches = this.storage.getMatchesByUser(userId);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const recentMatches = matches
      .filter(m => new Date(m.playedAt) >= startDate)
      .sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt));

    const trend = [];
    let cumulativeWins = 0;
    let cumulativeLosses = 0;

    recentMatches.forEach(m => {
      const result = m.results.find(r => r.playerId === userId);
      const isWin = result?.rank === 1;
      
      if (isWin) cumulativeWins++;
      else cumulativeLosses++;
      
      trend.push({
        date: m.playedAt,
        isWin,
        cumulativeWins,
        cumulativeLosses,
        winRate: ((cumulativeWins / (cumulativeWins + cumulativeLosses)) * 100).toFixed(1)
      });
    });

    return trend;
  }

  getActivityByMonth(months = 12) {
    const matches = this.storage.getAllMatches();
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    const activity = {};
    
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      activity[key] = 0;
    }

    matches.forEach(m => {
      const key = m.playedAt.slice(0, 7);
      if (activity[key] !== undefined) {
        activity[key]++;
      }
    });

    return Object.entries(activity)
      .map(([month, count]) => ({ month, count }))
      .reverse();
  }

  getLeaderboard(limit = 10) {
    const users = this.storage.getAllUsers();
    const leaderboard = users.map(user => {
      const stats = this.getUserStats(user.id);
      return {
        userId: user.id,
        userName: user.name,
        totalMatches: stats.totalMatches,
        wins: stats.wins,
        winRate: stats.winRate,
        totalScore: stats.totalScore
      };
    });

    return leaderboard
      .filter(u => u.totalMatches > 0)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      })
      .slice(0, limit);
  }

  // ===== GAME POPULARITY =====

  getGamePopularity() {
    const games = this.storage.getAllGames();
    const matches = this.storage.getAllMatches();
    
    const gameCounts = {};
    matches.forEach(m => {
      gameCounts[m.gameId] = (gameCounts[m.gameId] || 0) + 1;
    });

    return games
      .map(game => ({
        gameId: game.id,
        gameName: game.name,
        category: game.category,
        matchCount: gameCounts[game.id] || 0
      }))
      .filter(g => g.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }

  getCategoryBreakdown() {
    const games = this.storage.getAllGames();
    const matches = this.storage.getAllMatches();
    
    const categoryCounts = {};
    const gameToCategory = {};
    
    games.forEach(g => {
      gameToCategory[g.id] = g.category || 'Other';
    });

    matches.forEach(m => {
      const category = gameToCategory[m.gameId] || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const total = matches.length;
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export to window
window.Analytics = Analytics;
