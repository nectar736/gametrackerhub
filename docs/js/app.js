/**
 * Board Game Tracker - Main Application
 */

(function() {
  'use strict';

  const STORAGE_KEYS = {
    USERS: 'bgt_users',
    GAMES: 'bgt_games',
    MATCHES: 'bgt_matches',
    SETTINGS: 'bgt_settings'
  };

  // ===== STORAGE =====
  const Storage = {
    _getData(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Storage read error:', e);
        return [];
      }
    },

    _setData(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Storage write error:', e);
        return false;
      }
    },

    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    init() {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      if (!localStorage.getItem(STORAGE_KEYS.GAMES)) localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
      if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({}));
      if (!localStorage.getItem('bgt_seeded')) {
        this.seedData();
        localStorage.setItem('bgt_seeded', 'true');
      }
    },

    seedData() {
      // Clear existing data first
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));

      // Create sample users
      const users = [
        this.createUser('Alice Johnson', 'alice@email.com'),
        this.createUser('Bob Smith', 'bob@email.com'),
        this.createUser('Carol Williams', 'carol@email.com'),
        this.createUser('David Brown', 'david@email.com')
      ];

      // Create sample games
      const games = [
        this.createGame('Catan', 3, 4, 'Strategy'),
        this.createGame('Ticket to Ride', 2, 5, 'Family'),
        this.createGame('Codenames', 4, 8, 'Party'),
        this.createGame('Terraforming Mars', 1, 5, 'Strategy'),
        this.createGame('7 Wonders', 2, 7, 'Family')
      ];

      const matches = [];
      const day = 24 * 60 * 60 * 1000;

      // Month 5 (5 months ago)
      matches.push(this._createMatchWithDate(games[0].id, [users[0].id, users[1].id], [
        { playerId: users[0].id, score: 10, rank: 1 },
        { playerId: users[1].id, score: 8, rank: 2 }
      ], Date.now() - 150 * day));
      
      matches.push(this._createMatchWithDate(games[1].id, [users[0].id, users[1].id, users[2].id], [
        { playerId: users[2].id, score: 120, rank: 1 },
        { playerId: users[0].id, score: 95, rank: 2 },
        { playerId: users[1].id, score: 80, rank: 3 }
      ], Date.now() - 145 * day));

      // Month 4
      matches.push(this._createMatchWithDate(games[2].id, [users[1].id, users[2].id, users[3].id], [
        { playerId: users[1].id, score: 25, rank: 1 },
        { playerId: users[3].id, score: 18, rank: 2 },
        { playerId: users[2].id, score: 12, rank: 3 }
      ], Date.now() - 120 * day));

      matches.push(this._createMatchWithDate(games[0].id, [users[0].id, users[3].id], [
        { playerId: users[0].id, score: 12, rank: 1 },
        { playerId: users[3].id, score: 9, rank: 2 }
      ], Date.now() - 115 * day));

      // Month 3
      matches.push(this._createMatchWithDate(games[3].id, [users[0].id, users[1].id, users[2].id], [
        { playerId: users[1].id, score: 150, rank: 1 },
        { playerId: users[0].id, score: 145, rank: 2 },
        { playerId: users[2].id, score: 130, rank: 3 }
      ], Date.now() - 90 * day));

      matches.push(this._createMatchWithDate(games[1].id, [users[2].id, users[3].id], [
        { playerId: users[2].id, score: 100, rank: 1 },
        { playerId: users[3].id, score: 85, rank: 2 }
      ], Date.now() - 85 * day));

      // Month 2
      matches.push(this._createMatchWithDate(games[4].id, [users[0].id, users[1].id, users[2].id, users[3].id], [
        { playerId: users[3].id, score: 45, rank: 1 },
        { playerId: users[0].id, score: 42, rank: 2 },
        { playerId: users[1].id, score: 38, rank: 3 },
        { playerId: users[2].id, score: 35, rank: 4 }
      ], Date.now() - 60 * day));

      matches.push(this._createMatchWithDate(games[2].id, [users[0].id, users[2].id], [
        { playerId: users[0].id, score: 28, rank: 1 },
        { playerId: users[2].id, score: 22, rank: 2 }
      ], Date.now() - 55 * day));

      // Month 1
      matches.push(this._createMatchWithDate(games[0].id, [users[1].id, users[2].id, users[3].id], [
        { playerId: users[1].id, score: 11, rank: 1 },
        { playerId: users[3].id, score: 9, rank: 2 },
        { playerId: users[2].id, score: 7, rank: 3 }
      ], Date.now() - 30 * day));

      matches.push(this._createMatchWithDate(games[3].id, [users[0].id, users[1].id], [
        { playerId: users[0].id, score: 155, rank: 1 },
        { playerId: users[1].id, score: 148, rank: 2 }
      ], Date.now() - 25 * day));

      // This month
      matches.push(this._createMatchWithDate(games[1].id, [users[0].id, users[1].id, users[2].id], [
        { playerId: users[0].id, score: 110, rank: 1 },
        { playerId: users[1].id, score: 95, rank: 2 },
        { playerId: users[2].id, score: 88, rank: 3 }
      ], Date.now() - 5 * day));

      matches.push(this._createMatchWithDate(games[4].id, [users[1].id, users[2].id, users[3].id], [
        { playerId: users[2].id, score: 44, rank: 1 },
        { playerId: users[3].id, score: 41, rank: 2 },
        { playerId: users[1].id, score: 36, rank: 3 }
      ], Date.now() - 2 * day));

      matches.push(this._createMatchWithDate(games[2].id, [users[0].id, users[1].id, users[2].id, users[3].id], [
        { playerId: users[1].id, score: 30, rank: 1 },
        { playerId: users[0].id, score: 27, rank: 2 },
        { playerId: users[3].id, score: 24, rank: 3 },
        { playerId: users[2].id, score: 20, rank: 4 }
      ], Date.now() - 1 * day));

      // Save all matches
      this._setData(STORAGE_KEYS.MATCHES, matches);
    },

    _createMatchWithDate(gameId, playerIds, results, date) {
    return {
      id: this.generateId(),
      gameId,
      playerIds,
      results,
      playedAt: new Date(date).toISOString(),
      createdAt: new Date(date).toISOString()
    };
  },

    getAllUsers() { return this._getData(STORAGE_KEYS.USERS); },
    getAllGames() { return this._getData(STORAGE_KEYS.GAMES); },
    getAllMatches() { return this._getData(STORAGE_KEYS.MATCHES); },

    createUser(name, email = '') {
      const users = this.getAllUsers();
      const user = { id: this.generateId(), name, email, createdAt: new Date().toISOString() };
      users.push(user);
      this._setData(STORAGE_KEYS.USERS, users);
      return user;
    },

    createGame(name, minPlayers = 1, maxPlayers = 4, category = 'Other') {
      const games = this.getAllGames();
      const game = { id: this.generateId(), name, minPlayers, maxPlayers, category, createdAt: new Date().toISOString() };
      games.push(game);
      this._setData(STORAGE_KEYS.GAMES, games);
      return game;
    },

    createMatch(gameId, playerIds, results) {
      const matches = this.getAllMatches();
      const match = {
        id: this.generateId(),
        gameId,
        playerIds,
        results,
        playedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      matches.push(match);
      this._setData(STORAGE_KEYS.MATCHES, matches);
      return match;
    },

    deleteUser(id) {
      const users = this.getAllUsers().filter(u => u.id !== id);
      this._setData(STORAGE_KEYS.USERS, users);
    },

    deleteGame(id) {
      const games = this.getAllGames().filter(g => g.id !== id);
      this._setData(STORAGE_KEYS.GAMES, games);
    },

    deleteMatch(id) {
      const matches = this.getAllMatches().filter(m => m.id !== id);
      this._setData(STORAGE_KEYS.MATCHES, matches);
    },

    getUser(id) { return this.getAllUsers().find(u => u.id === id); },
    getGame(id) { return this.getAllGames().find(g => g.id === id); },
    getMatch(id) { return this.getAllMatches().find(m => m.id === id); },

    updateUser(id, data) {
      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
        this._setData(STORAGE_KEYS.USERS, users);
        return true;
      }
      return false;
    },

    updateGame(id, data) {
      const games = this.getAllGames();
      const index = games.findIndex(g => g.id === id);
      if (index !== -1) {
        games[index] = { ...games[index], ...data, updatedAt: new Date().toISOString() };
        this._setData(STORAGE_KEYS.GAMES, games);
        return true;
      }
      return false;
    },

    updateMatch(id, data) {
      const matches = this.getAllMatches();
      const index = matches.findIndex(m => m.id === id);
      if (index !== -1) {
        matches[index] = { ...matches[index], ...data, updatedAt: new Date().toISOString() };
        this._setData(STORAGE_KEYS.MATCHES, matches);
        return true;
      }
      return false;
    }
  };

  // ===== RENDER FUNCTIONS =====
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getCategoryColor(category) {
    const colors = {
      'Strategy': '#8b5cf6',
      'Family': '#10b981', 
      'Party': '#f59e0b',
      'Thematic': '#ef4444',
      'Wargames': '#6b7280',
      'Abstract': '#3b82f6',
      'Other': '#6366f1'
    };
    return colors[category] || colors['Other'];
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function getInsights() {
    const users = Storage.getAllUsers();
    const games = Storage.getAllGames();
    const matches = Storage.getAllMatches();

    if (matches.length === 0) return null;

    // Most played game
    const gameCounts = {};
    matches.forEach(m => { gameCounts[m.gameId] = (gameCounts[m.gameId] || 0) + 1; });
    const mostPlayedId = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0];
    const mostPlayedGame = mostPlayedId ? Storage.getGame(mostPlayedId[0]) : null;

    // Most wins
    const userWins = users.map(u => {
      const wins = matches.filter(m => {
        const result = m.results.find(r => r.playerId === u.id);
        return result && result.rank === 1;
      }).length;
      return { name: u.name, wins, id: u.id };
    }).sort((a, b) => b.wins - a.wins);

    // Win rates
    const winRates = users.map(u => {
      const userMatches = matches.filter(m => m.playerIds.includes(u.id));
      const wins = userMatches.filter(m => {
        const result = m.results.find(r => r.playerId === u.id);
        return result && result.rank === 1;
      }).length;
      return { name: u.name, wins, total: userMatches.length, rate: userMatches.length > 0 ? Math.round((wins / userMatches.length) * 100) : 0 };
    }).sort((a, b) => b.rate - a.rate);

    // Category breakdown
    const categoryCounts = {};
    matches.forEach(m => {
      const game = Storage.getGame(m.gameId);
      if (game) {
        categoryCounts[game.category] = (categoryCounts[game.category] || 0) + 1;
      }
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    // This week's activity
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeekMatches = matches.filter(m => new Date(m.playedAt).getTime() > weekAgo);

    return {
      mostPlayedGame,
      mostPlayedCount: mostPlayedId ? mostPlayedId[1] : 0,
      topPlayer: userWins[0],
      winRates,
      topCategory,
      thisWeekMatches: thisWeekMatches.length
    };
  }

  function renderDashboard() {
    const users = Storage.getAllUsers();
    const games = Storage.getAllGames();
    const matches = Storage.getAllMatches();
    const isSeeded = localStorage.getItem('bgt_seeded') === 'true';

    const hasData = users.length > 0 || games.length > 0 || matches.length > 0;
    const insights = getInsights();

    // Recent matches
    const recentMatches = matches.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt)).slice(0, 3);

    let html = `
      <div class="page">
        <div class="container">
          <h1>${hasData ? '📊 Dashboard' : '🎲 Welcome to Board Game Tracker!'}</h1>
          
          ${isSeeded ? `
            <div class="card mb-3" style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-left: 4px solid #f59e0b;">
              <div class="flex items-start gap-2">
                <span style="font-size: 1.5rem;">💡</span>
                <div>
                  <h3 style="color: #b45309; margin: 0 0 0.5rem;">Demo Data Loaded</h3>
                  <p style="margin: 0 0 0.75rem; color: #92400e;">This is sample data to demonstrate the app's features. To start fresh with your own data, go to Settings and clear all data.</p>
                  <button class="btn btn-sm" style="background: #f59e0b; color: white;" onclick="app.navigate('settings')">⚙️ Go to Settings</button>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${!hasData ? `
            <div class="card mb-3" style="background: linear-gradient(135deg, var(--color-primary-light) 0%, white 100%);">
              <h3 style="color: var(--color-primary);">Getting Started</h3>
              <p>Add players, games, and record matches to track your board gaming history!</p>
              <div class="flex gap-1 flex-wrap mt-2">
                <button class="btn btn-primary" onclick="app.showAddUser()">👤 Add First Player</button>
                <button class="btn btn-secondary" onclick="app.showAddGame()">🎲 Add First Game</button>
              </div>
            </div>
          ` : ''}

          <div class="stats-grid mb-3">
            <div class="stat-card">
              <div class="stat-value">${users.length}</div>
              <div class="stat-label">👥 Players</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${games.length}</div>
              <div class="stat-label">🎲 Games</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${matches.length}</div>
              <div class="stat-label">📊 Matches</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${insights?.thisWeekMatches || 0}</div>
              <div class="stat-label">📅 This Week</div>
            </div>
          </div>

          ${insights ? `
          <h2 class="mb-2" style="font-size:1.25rem;">📈 Insights</h2>
          <div class="card-grid mb-3">
            ${insights.topPlayer ? `
            <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, white 100%); border-left:4px solid #f59e0b;">
              <h3 style="color:#b45309;">🏆 Champion</h3>
              <div class="flex items-center gap-2 mt-2">
                <div class="avatar" style="background:linear-gradient(135deg,#f59e0b,#d97706);">${getInitials(insights.topPlayer.name)}</div>
                <div>
                  <div style="font-weight:700; font-size:1.1rem;">${escapeHtml(insights.topPlayer.name)}</div>
                  <div class="text-muted">${insights.topPlayer.wins} wins</div>
                </div>
              </div>
            </div>
            ` : ''}
            
            ${insights.mostPlayedGame ? `
            <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, white 100%); border-left:4px solid #3b82f6;">
              <h3 style="color:#1d4ed8;">🎯 Most Played</h3>
              <div class="mt-2">
                <div style="font-weight:700; font-size:1.25rem;">${escapeHtml(insights.mostPlayedGame.name)}</div>
                <div class="text-muted">${insights.mostPlayedCount} plays</div>
              </div>
            </div>
            ` : ''}

            ${insights.topCategory ? `
            <div class="card" style="background: linear-gradient(135deg, #d1fae5 0%, white 100%); border-left:4px solid #10b981;">
              <h3 style="color:#047857;">📂 Top Category</h3>
              <div class="mt-2">
                <div style="font-weight:700; font-size:1.25rem;">${escapeHtml(insights.topCategory[0])}</div>
                <div class="text-muted">${insights.topCategory[1]} matches</div>
              </div>
            </div>
            ` : ''}
          </div>

          <h2 class="mb-2" style="font-size:1.25rem;">🏅 Leaderboard</h2>
          <div class="card-grid mb-3">
            ${insights.winRates.slice(0, 3).map((u, i) => `
              <div class="card" style="padding:1rem;">
                <div class="flex items-center gap-2">
                  <div style="width:32px;height:32px;border-radius:50%;background:${i===0?'#fbbf24':i===1?'#9ca3af':'#d97706'};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;">
                    ${i + 1}
                  </div>
                  <div class="avatar" style="width:40px;height:40px;font-size:0.9rem;">${getInitials(u.name)}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHtml(u.name)}</div>
                    <div class="text-muted" style="font-size:0.8rem;">${u.wins} wins • ${u.rate}% win rate</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <h2 class="mb-2" style="font-size:1.25rem;">📋 Recent Matches</h2>
          <div class="card-grid">
            ${recentMatches.length > 0 ? recentMatches.map(m => {
              const game = Storage.getGame(m.gameId);
              const winners = m.results.filter(r => r.rank === 1).map(r => {
                const user = Storage.getUser(r.playerId);
                return user ? user.name : 'Unknown';
              }).join(', ');
              return `
                <div class="card" style="padding:1rem;">
                  <div class="flex justify-between items-start">
                    <div>
                      <div style="font-weight:600;">${escapeHtml(game ? game.name : 'Unknown')}</div>
                      <div class="text-muted" style="font-size:0.85rem;">${formatDate(m.playedAt)}</div>
                    </div>
                    <span class="badge badge-success">🥇 ${escapeHtml(winners)}</span>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="card" style="grid-column:1/-1;">
                <div class="empty-state" style="padding:2rem;">
                  <p class="text-muted">No matches recorded yet. Start playing!</p>
                </div>
              </div>
            `}
          </div>

          <div class="card mt-3">
            <h3>⚡ Quick Actions</h3>
            <div class="flex gap-1 flex-wrap mt-2">
              <button class="btn btn-primary" onclick="app.showAddUser()">👤 Add Player</button>
              <button class="btn btn-primary" onclick="app.showAddGame()">🎲 Add Game</button>
              <button class="btn btn-primary" onclick="app.showAddMatch()">📊 Record Match</button>
            </div>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  function renderUsers() {
    const users = Storage.getAllUsers();
    let html = `
      <div class="page">
        <div class="container">
          <div class="flex justify-between items-center mb-3">
            <h1>👥 Players</h1>
            <button class="btn btn-primary" onclick="app.showAddUser()">+ Add Player</button>
          </div>
    `;

    if (users.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">👤</div>
          <h3 class="empty-state-title">No Players Yet</h3>
          <p>Add your first player to get started!</p>
          <button class="btn btn-primary mt-2" onclick="app.showAddUser()">Add Player</button>
        </div>`;
    } else {
      html += '<div class="card-grid">';
      users.forEach(user => {
        const userMatches = Storage.getAllMatches().filter(m => m.playerIds.includes(user.id));
        const wins = userMatches.filter(m => {
          const result = m.results.find(r => r.playerId === user.id);
          return result && result.rank === 1;
        }).length;
        const winRate = userMatches.length > 0 ? Math.round((wins / userMatches.length) * 100) : 0;
        
        html += `
          <div class="card" style="position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; right:0; width:80px; height:80px; background:linear-gradient(135deg, var(--color-primary-light), transparent); border-radius:0 0 0 80px;">
            </div>
            <div class="flex items-center gap-2 mb-2">
              <div class="avatar" style="width:56px; height:56px; font-size:1.25rem;">${getInitials(user.name)}</div>
              <div>
                <h3 style="margin:0; font-size:1.1rem;">${escapeHtml(user.name)}</h3>
                <p class="text-muted" style="margin:0; font-size:0.85rem;">${escapeHtml(user.email || 'No email')}</p>
              </div>
            </div>
            <div class="stats-grid mb-2" style="grid-template-columns: repeat(3, 1fr);">
              <div class="stat-card" style="padding:0.75rem;">
                <div class="stat-value" style="font-size:1.5rem;">${userMatches.length}</div>
                <div class="stat-label" style="font-size:0.6rem;">Matches</div>
              </div>
              <div class="stat-card" style="padding:0.75rem;">
                <div class="stat-value" style="font-size:1.5rem; color:var(--color-success);">${wins}</div>
                <div class="stat-label" style="font-size:0.6rem;">Wins</div>
              </div>
              <div class="stat-card" style="padding:0.75rem;">
                <div class="stat-value" style="font-size:1.5rem; color:var(--color-primary);">${winRate}%</div>
                <div class="stat-label" style="font-size:0.6rem;">Win Rate</div>
              </div>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-sm" onclick="app.showEditUser('${user.id}')">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.deleteUser('${user.id}')">🗑️</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderGames() {
    const games = Storage.getAllGames();
    const popularGames = [
      { name: 'Catan', minPlayers: 3, maxPlayers: 4, category: 'Strategy' },
      { name: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5, category: 'Family' },
      { name: 'Codenames', minPlayers: 4, maxPlayers: 8, category: 'Party' },
      { name: 'Terraforming Mars', minPlayers: 1, maxPlayers: 5, category: 'Strategy' },
      { name: '7 Wonders', minPlayers: 2, maxPlayers: 7, category: 'Family' },
      { name: 'Azul', minPlayers: 2, maxPlayers: 4, category: 'Family' },
      { name: 'Wingspan', minPlayers: 1, maxPlayers: 5, category: 'Strategy' },
      { name: 'Splendor', minPlayers: 2, maxPlayers: 4, category: 'Family' }
    ];

    let html = `
      <div class="page">
        <div class="container">
          <div class="flex justify-between items-center mb-3">
            <h1>🎲 Games Library</h1>
            <button class="btn btn-primary" onclick="app.showAddGame()">+ Add Game</button>
          </div>

          <div class="card mb-3">
            <h3 class="mb-2">⭐ Popular Games</h3>
            <p class="text-muted mb-2" style="font-size:0.9rem;">Quickly add popular board games to your collection:</p>
            <div class="flex gap-1 flex-wrap">
              ${popularGames.map(g => `
                <button class="btn btn-sm" style="background:var(--color-bg);border:1px solid var(--color-border);" onclick="app.addPopularGame('${escapeHtml(g.name)}', ${g.minPlayers}, ${g.maxPlayers}, '${g.category}')">+ ${escapeHtml(g.name)}</button>
              `).join('')}
            </div>
          </div>
    `;

    if (games.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">🎲</div>
          <h3 class="empty-state-title">No Games Yet</h3>
          <p>Add your first game to start tracking!</p>
          <button class="btn btn-primary mt-2" onclick="app.showAddGame()">Add Game</button>
        </div>`;
    } else {
      html += '<div class="card-grid">';
      games.forEach(game => {
        const gameMatches = Storage.getAllMatches().filter(m => m.gameId === game.id);
        const color = getCategoryColor(game.category);
        html += `
          <div class="card" style="border-left: 4px solid ${color};">
            <div class="flex justify-between items-start">
              <div>
                <h3 style="margin:0 0 0.5rem; font-size:1.1rem;">${escapeHtml(game.name)}</h3>
                <p class="text-muted" style="margin:0 0 0.75rem; font-size:0.85rem;">👥 ${game.minPlayers}-${game.maxPlayers} players</p>
              </div>
              <span class="badge" style="background:${color}20; color:${color};">${escapeHtml(game.category)}</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div style="font-size:1.5rem; font-weight:800; color:var(--color-primary);">${gameMatches.length}</div>
              <div class="text-muted" style="font-size:0.85rem;">total plays</div>
            </div>
            <div class="flex gap-1 mt-2">
              <button class="btn btn-sm" onclick="app.showEditGame('${game.id}')" style="flex:1;">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.deleteGame('${game.id}')">🗑️</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderMatches() {
    const matches = Storage.getAllMatches().sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

    let html = `
      <div class="page">
        <div class="container">
          <div class="flex justify-between items-center mb-3">
            <h1>📊 Match History</h1>
            <button class="btn btn-primary" onclick="app.showAddMatch()">+ Record Match</button>
          </div>
    `;

    if (matches.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3 class="empty-state-title">No Matches Yet</h3>
          <p>Record your first match to start tracking!</p>
          <button class="btn btn-primary mt-2" onclick="app.showAddMatch()">Record Match</button>
        </div>`;
    } else {
      html += '<div class="card" style="padding:0; overflow:hidden;">';
      matches.forEach((match, index) => {
        const game = Storage.getGame(match.gameId);
        const winners = match.results.filter(r => r.rank === 1).map(r => {
          const user = Storage.getUser(r.playerId);
          return user ? user.name : 'Unknown';
        }).join(', ');
        
        const allPlayers = match.results.map(r => {
          const user = Storage.getUser(r.playerId);
          return { name: user ? user.name : 'Unknown', score: r.score, rank: r.rank };
        }).sort((a, b) => a.rank - b.rank);

        html += `
          <div style="padding:1.25rem; border-bottom:1px solid var(--color-border); ${index === 0 ? 'background:linear-gradient(to right, var(--color-primary-light), transparent);' : ''}">
            <div class="flex justify-between items-start mb-2">
              <div>
                <div style="font-weight:700; font-size:1.1rem;">${escapeHtml(game ? game.name : 'Unknown')}</div>
                <div class="text-muted" style="font-size:0.85rem;">📅 ${formatDate(match.playedAt)}</div>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-sm" onclick="app.showEditMatch('${match.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="app.deleteMatch('${match.id}')">🗑️</button>
              </div>
            </div>
            <div class="flex gap-1 flex-wrap">
              ${allPlayers.map(p => `
                <span class="badge ${p.rank === 1 ? 'badge-success' : 'badge-info'}" style="font-size:0.8rem;">
                  ${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank + '.'} ${escapeHtml(p.name)} (${p.score})
                </span>
              `).join('')}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderAnalytics() {
    const users = Storage.getAllUsers();
    const games = Storage.getAllGames();
    const matches = Storage.getAllMatches();

    if (matches.length === 0) {
      return `
        <div class="page">
          <div class="container">
            <h1>🏆 Analytics</h1>
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <h3 class="empty-state-title">No Data Yet</h3>
              <p>Record some matches to see your analytics and insights!</p>
              <button class="btn btn-primary mt-2" onclick="app.showAddMatch()">Record First Match</button>
            </div>
          </div>
        </div>
      `;
    }

    // Player stats
    const userStats = users.map(user => {
      const userMatches = matches.filter(m => m.playerIds.includes(user.id));
      const wins = userMatches.filter(m => {
        const result = m.results.find(r => r.playerId === user.id);
        return result && result.rank === 1;
      }).length;
      return { 
        name: user.name, 
        matches: userMatches.length, 
        wins,
        winRate: userMatches.length > 0 ? Math.round((wins / userMatches.length) * 100) : 0
      };
    }).sort((a, b) => b.wins - a.wins);

    // Game stats
    const gameStats = games.map(g => {
      const count = matches.filter(m => m.gameId === g.id).length;
      return { name: g.name, count, category: g.category };
    }).sort((a, b) => b.count - a.count);

    // Category breakdown
    const categoryStats = {};
    matches.forEach(m => {
      const game = games.find(g => g.id === m.gameId);
      const cat = game?.category || 'Other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // Monthly activity (last 6 months)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      const monthMatches = matches.filter(m => {
        const mDate = new Date(m.playedAt);
        return mDate.getMonth() === d.getMonth() && mDate.getFullYear() === d.getFullYear();
      });
      monthlyActivity.push({ month: monthKey, count: monthMatches.length });
    }

    const categoryColors = {
      'Strategy': '#8b5cf6',
      'Family': '#10b981', 
      'Party': '#f59e0b',
      'Thematic': '#ef4444',
      'Wargames': '#6b7280',
      'Abstract': '#3b82f6',
      'Other': '#6366f1'
    };

    let html = `
      <div class="page">
        <div class="container">
          <h1>🏆 Analytics</h1>
          
          <div class="card-grid mb-3">
            <div class="card">
              <h3>👑 Leaderboard</h3>
              ${userStats.map((u, i) => `
                <div class="flex items-center gap-2 mb-2" style="padding:0.75rem;background:var(--color-bg);border-radius:var(--radius-md);">
                  <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'#fbbf24':i===1?'#9ca3af':i===2?'#d97706':'#e5e7eb'};color:${i<3?'white':'#6b7280'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
                    ${i + 1}
                  </div>
                  <div class="avatar" style="width:36px;height:36px;font-size:0.75rem;">${getInitials(u.name)}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.9rem;">${escapeHtml(u.name)}</div>
                    <div class="text-muted" style="font-size:0.75rem;">${u.wins} wins • ${u.winRate}% win rate</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="card">
              <h3>🎯 Win Rate Comparison</h3>
              ${userStats.map(u => `
                <div class="mb-2">
                  <div class="flex justify-between mb-1">
                    <span style="font-weight:500;">${escapeHtml(u.name)}</span>
                    <span style="color:var(--color-primary);font-weight:600;">${u.winRate}%</span>
                  </div>
                  <div style="background:var(--color-bg);border-radius:var(--radius-sm);height:8px;overflow:hidden;">
                    <div style="width:${u.winRate}%;background:linear-gradient(90deg,var(--color-primary),#8b5cf6);height:100%;border-radius:var(--radius-sm);"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="card">
              <h3>🎲 Games Played</h3>
              ${gameStats.filter(g => g.count > 0).map((g, i) => `
                <div class="flex items-center justify-between mb-2" style="padding:0.5rem;background:var(--color-bg);border-radius:var(--radius-md);">
                  <div class="flex items-center gap-2">
                    <span style="font-weight:700;color:var(--color-primary);width:20px;">${i + 1}</span>
                    <span>${escapeHtml(g.name)}</span>
                  </div>
                  <span class="badge" style="background:${categoryColors[g.category]}20;color:${categoryColors[g.category]};">${g.count} plays</span>
                </div>
              `).join('')}
            </div>

            <div class="card">
              <h3>📂 Category Distribution</h3>
              ${Object.entries(categoryStats).map(([cat, count]) => `
                <div class="mb-2">
                  <div class="flex justify-between mb-1">
                    <span style="font-weight:500;">${cat}</span>
                    <span>${count} matches</span>
                  </div>
                  <div style="background:var(--color-bg);border-radius:var(--radius-sm);height:8px;overflow:hidden;">
                    <div style="width:${(count / matches.length) * 100}%;background:${categoryColors[cat] || categoryColors['Other']};height:100%;border-radius:var(--radius-sm);"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="card" style="grid-column: 1 / -1;">
              <h3>📈 Activity Over Time</h3>
              <div class="flex gap-2 items-end" style="height:120px;align-items:flex-end;">
                ${monthlyActivity.map(m => `
                  <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:100%;background:linear-gradient(to top, var(--color-primary), #8b5cf6);border-radius:4px 4px 0 0;height:${Math.max(m.count * 20, m.count > 0 ? 20 : 0)}px;"></div>
                    <span style="font-size:0.7rem;color:var(--color-text-light);">${m.month}</span>
                  </div>
                `).join('')}
              </div>
              <div class="flex justify-between mt-2" style="font-size:0.8rem;color:var(--color-text-light);">
                <span>${monthlyActivity.reduce((a, b) => a + b.count, 0)} total matches</span>
                <span>Last 6 months</span>
              </div>
            </div>
          </div>

          <h2 class="mb-2" style="font-size:1.25rem;">📋 Detailed Stats</h2>
          <div class="card-grid">
            <div class="card">
              <h3>Player Statistics</h3>
              <table class="table">
                <thead><tr><th>Player</th><th>Matches</th><th>Wins</th><th>Win Rate</th></tr></thead>
                <tbody>
                  ${userStats.map(u => `<tr><td>${escapeHtml(u.name)}</td><td>${u.matches}</td><td>${u.wins}</td><td>${u.winRate}%</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div class="card">
              <h3>Game Statistics</h3>
              <table class="table">
                <thead><tr><th>Game</th><th>Category</th><th>Plays</th></tr></thead>
                <tbody>
                  ${gameStats.filter(g => g.count > 0).map(g => `<tr><td>${escapeHtml(g.name)}</td><td><span class="badge" style="background:${categoryColors[g.category] || categoryColors['Other']}20;color:${categoryColors[g.category] || categoryColors['Other']}">${escapeHtml(g.category)}</span></td><td>${g.count}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
    return html;
  }

  function renderSettings() {
    const users = Storage.getAllUsers();
    const games = Storage.getAllGames();
    const matches = Storage.getAllMatches();

    return `
      <div class="page">
        <div class="container">
          <h1>⚙️ Settings</h1>
          <div class="card-grid">
            <div class="card">
              <h3>📊 Data Summary</h3>
              <div class="stats-grid mb-2" style="grid-template-columns: repeat(3, 1fr);">
                <div class="stat-card" style="padding:0.75rem;">
                  <div class="stat-value" style="font-size:1.5rem;">${users.length}</div>
                  <div class="stat-label" style="font-size:0.6rem;">Players</div>
                </div>
                <div class="stat-card" style="padding:0.75rem;">
                  <div class="stat-value" style="font-size:1.5rem;">${games.length}</div>
                  <div class="stat-label" style="font-size:0.6rem;">Games</div>
                </div>
                <div class="stat-card" style="padding:0.75rem;">
                  <div class="stat-value" style="font-size:1.5rem;">${matches.length}</div>
                  <div class="stat-label" style="font-size:0.6rem;">Matches</div>
                </div>
              </div>
            </div>
            <div class="card" style="grid-column: 1 / -1;">
              <h3>📖 Instructions</h3>
              <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">👤 Adding Players</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Go to the Players tab and click "+ Add Player". Enter their name and optional email. You need at least 2 players to record matches.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">🎲 Adding Games</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Go to the Games tab and click "+ Add Game". Enter the game name, player count, and category. You can also quickly add popular games from the list.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">📊 Recording Matches</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Go to the Match History tab and click "+ Record Match". Select a game, choose players, and enter scores. Ranks are calculated automatically.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">✏️ Editing Items</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">On any list (Players, Games, Matches), click the Edit button to modify details. For matches, you can also change the game, date, and scores.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">💾 Exporting Data</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Click "Export Data" to download a JSON file containing all your players, games, and match history. Use this to backup your data or transfer to another device.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">📥 Importing Data</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Click "Import Data" to restore from a backup. Select a previously exported JSON file. New data will be merged with existing data (duplicates are skipped).</p>
                </div>
                <div>
                  <h4 style="color: var(--color-primary); margin: 0 0 0.5rem;">🔄 Resetting Demo Data</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Click "Reset Demo Data" to restore sample data with 4 players, 5 games, and 12 matches spanning 5 months. Useful for exploring features.</p>
                </div>
                <div>
                  <h4 style="color: var(--color-danger); margin: 0 0 0.5rem;">🗑️ Clearing All Data</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-light);">Click "Clear All Data" to permanently delete everything. This cannot be undone! Use Export first if you want to save your data.</p>
                </div>
              </div>
            </div>
            <div class="card">
              <h3>🔄 Demo Data</h3>
              <p class="text-muted mb-2">Reset to sample data with charts spanning 5 months.</p>
              <button class="btn btn-primary" onclick="app.resetSeedData()">Reset Demo Data</button>
            </div>
            <div class="card">
              <h3>💾 Export</h3>
              <p class="text-muted mb-2">Download your data for backup.</p>
              <div class="flex gap-1 flex-wrap">
                <button class="btn btn-secondary" onclick="app.exportData()">Export Data (JSON)</button>
                <button class="btn btn-secondary" onclick="app.showImportData()">Import Data</button>
              </div>
            </div>
            <div class="card" style="border-left:4px solid var(--color-danger);">
              <h3 style="color:var(--color-danger);">⚠️ Danger Zone</h3>
              <p class="text-muted mb-2">Permanently delete all data. This cannot be undone!</p>
              <button class="btn btn-danger" onclick="app.clearAllData()">🗑️ Clear All Data</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ===== MODAL FUNCTIONS =====
  function showModal(title, content, buttons) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onclick="app.closeModal()">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        ${buttons ? `<div class="modal-footer">${buttons}</div>` : ''}
      </div>
    `;
    modal.onclick = function(e) {
      if (e.target === modal) app.closeModal();
    };
    document.body.appendChild(modal);
  }

  function closeModal() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.remove());
  }

  // ===== APP OBJECT =====
  const app = {
    currentView: 'dashboard',

    init() {
      Storage.init();
      this.render();
      console.log('Board Game Tracker initialized');
    },

    navigate(view) {
      this.currentView = view;
      this.render();
      // Update nav active state
      document.querySelectorAll('.nav .btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('nav-' + view);
      if (activeBtn) activeBtn.classList.add('active');
    },

    render() {
      const main = document.getElementById('main-content');
      if (!main) return;

      const views = {
        dashboard: renderDashboard,
        users: renderUsers,
        games: renderGames,
        matches: renderMatches,
        analytics: renderAnalytics,
        settings: renderSettings
      };

      main.innerHTML = views[this.currentView] ? views[this.currentView]() : renderDashboard();
    },

    // User functions
    showAddUser() {
      showModal('Add Player', `
        <form onsubmit="app.addUser(event)">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" name="name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email">
          </div>
          <button type="submit" class="btn btn-primary">Add Player</button>
        </form>
      `);
    },

    addUser(e) {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      
      const existingUsers = Storage.getAllUsers();
      if (existingUsers.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        alert('A player with this name already exists.');
        return;
      }
      
      Storage.createUser(name, form.email.value);
      this.closeModal();
      this.render();
    },

    deleteUser(id) {
      if (confirm('Delete this player?')) {
        Storage.deleteUser(id);
        this.render();
      }
    },

    showEditUser(id) {
      const user = Storage.getUser(id);
      if (!user) return;
      showModal('Edit Player', `
        <form onsubmit="app.editUser(event, '${id}')">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" name="name" value="${escapeHtml(user.name)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" name="email" value="${escapeHtml(user.email || '')}">
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      `);
    },

    editUser(e, id) {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      
      const existingUsers = Storage.getAllUsers();
      if (existingUsers.some(u => u.id !== id && u.name.toLowerCase() === name.toLowerCase())) {
        alert('A player with this name already exists.');
        return;
      }
      
      Storage.updateUser(id, { name, email: form.email.value });
      this.closeModal();
      this.render();
    },

    // Game functions
    showAddGame() {
      showModal('Add Game', `
        <form onsubmit="app.addGame(event)">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" name="name" required>
          </div>
          <div class="flex gap-2">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Min Players</label>
              <input type="number" class="form-input" name="minPlayers" value="1" min="1">
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Max Players</label>
              <input type="number" class="form-input" name="maxPlayers" value="4" min="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" name="category">
              <option>Strategy</option>
              <option>Family</option>
              <option>Party</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Add Game</button>
        </form>
      `);
    },

    addGame(e) {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      
      const existingGames = Storage.getAllGames();
      if (existingGames.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        alert('A game with this name already exists.');
        return;
      }
      
      Storage.createGame(name, form.minPlayers.value, form.maxPlayers.value, form.category.value);
      this.closeModal();
      this.render();
    },

    addPopularGame(name, minPlayers, maxPlayers, category) {
      const existingGames = Storage.getAllGames();
      if (existingGames.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        alert('This game is already in your collection.');
        return;
      }
      Storage.createGame(name, minPlayers, maxPlayers, category);
      this.render();
    },

    deleteGame(id) {
      if (confirm('Delete this game?')) {
        Storage.deleteGame(id);
        this.render();
      }
    },

    showEditGame(id) {
      const game = Storage.getGame(id);
      if (!game) return;
      showModal('Edit Game', `
        <form onsubmit="app.editGame(event, '${id}')">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" name="name" value="${escapeHtml(game.name)}" required>
          </div>
          <div class="flex gap-2">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Min Players</label>
              <input type="number" class="form-input" name="minPlayers" value="${game.minPlayers}" min="1">
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Max Players</label>
              <input type="number" class="form-input" name="maxPlayers" value="${game.maxPlayers}" min="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" name="category">
              <option ${game.category === 'Strategy' ? 'selected' : ''}>Strategy</option>
              <option ${game.category === 'Family' ? 'selected' : ''}>Family</option>
              <option ${game.category === 'Party' ? 'selected' : ''}>Party</option>
              <option ${game.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      `);
    },

    editGame(e, id) {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      
      const existingGames = Storage.getAllGames();
      if (existingGames.some(g => g.id !== id && g.name.toLowerCase() === name.toLowerCase())) {
        alert('A game with this name already exists.');
        return;
      }
      
      Storage.updateGame(id, { name, minPlayers: parseInt(form.minPlayers.value), maxPlayers: parseInt(form.maxPlayers.value), category: form.category.value });
      this.closeModal();
      this.render();
    },

    // Match functions
    showAddMatch() {
      const games = Storage.getAllGames();
      const users = Storage.getAllUsers();

      if (games.length === 0 || users.length < 2) {
        alert('You need at least 2 players and 1 game to record a match.');
        return;
      }

      showModal('Record Match', `
        <form onsubmit="app.addMatch(event)">
          <div class="form-group">
            <label class="form-label">Game *</label>
            <select class="form-select" name="gameId" required>
              ${games.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Players * (select 2 or more)</label>
            <div id="player-checkboxes" class="flex flex-wrap gap-1">
              ${users.map(u => `
                <label class="badge badge-info" style="cursor:pointer;padding:0.5rem;">
                  <input type="checkbox" name="playerIds" value="${u.id}" style="display:none;">
                  ${escapeHtml(u.name)}
                </label>
              `).join('')}
            </div>
          </div>
          <div id="score-inputs"></div>
          <button type="submit" class="btn btn-primary mt-2">Record Match</button>
        </form>
      `);

      // Add click handlers for player checkboxes
      document.querySelectorAll('#player-checkboxes input').forEach(cb => {
        cb.addEventListener('change', function() {
          const label = this.closest('label');
          if (this.checked) {
            label.classList.remove('badge-info');
            label.classList.add('badge-success');
          } else {
            label.classList.remove('badge-success');
            label.classList.add('badge-info');
          }
          app.updateScoreInputs();
        });
      });
    },

    updateScoreInputs() {
      const container = document.getElementById('score-inputs');
      const checked = document.querySelectorAll('#player-checkboxes input:checked');
      
      container.innerHTML = checked.length >= 2 ? '<h4 class="mt-2">Scores</h4>' : '<p class="text-muted">Select at least 2 players</p>';
      
      checked.forEach(cb => {
        const user = Storage.getUser(cb.value);
        container.innerHTML += `
          <div class="flex gap-1 mb-1" style="align-items:center;">
            <span style="min-width:100px;">${escapeHtml(user.name)}</span>
            <input type="number" class="form-input" name="score_${cb.value}" placeholder="Score" style="flex:1;">
          </div>
        `;
      });
    },

    addMatch(e) {
      e.preventDefault();
      const form = e.target;
      const gameId = form.gameId.value;
      const playerCheckboxes = form.querySelectorAll('input[name="playerIds"]:checked');
      
      if (playerCheckboxes.length < 2) {
        alert('Select at least 2 players');
        return;
      }

      const playerIds = Array.from(playerCheckboxes).map(cb => cb.value);
      const results = playerIds.map((playerId, index) => {
        const scoreInput = form[`score_${playerId}`];
        return { playerId, score: parseInt(scoreInput?.value || 0), rank: index + 1 };
      });

      // Sort by score to determine ranks
      results.sort((a, b) => b.score - a.score);
      results.forEach((r, i) => r.rank = i + 1);

      // Handle ties - same score = same rank
      for (let i = 1; i < results.length; i++) {
        if (results[i].score === results[i-1].score) {
          results[i].rank = results[i-1].rank;
        }
      }

      Storage.createMatch(gameId, playerIds, results);
      this.closeModal();
      this.render();
    },

    deleteMatch(id) {
      if (confirm('Delete this match?')) {
        Storage.deleteMatch(id);
        this.render();
      }
    },

    showEditMatch(id) {
      const match = Storage.getMatch(id);
      const games = Storage.getAllGames();
      const users = Storage.getAllUsers();
      
      if (!match) return;

      showModal('Edit Match', `
        <form onsubmit="app.editMatch(event, '${id}')">
          <div class="form-group">
            <label class="form-label">Game *</label>
            <select class="form-select" name="gameId" required>
              ${games.map(g => `<option value="${g.id}" ${g.id === match.gameId ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date Played</label>
            <input type="date" class="form-input" name="playedAt" value="${new Date(match.playedAt).toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">Players & Scores</label>
            <div id="edit-score-inputs">
              ${match.results.map(r => {
                const user = users.find(u => u.id === r.playerId);
                return `
                  <div class="flex gap-1 mb-1" style="align-items:center;">
                    <span style="min-width:100px;">${escapeHtml(user ? user.name : 'Unknown')}</span>
                    <input type="hidden" name="playerId_${r.playerId}" value="${r.playerId}">
                    <input type="number" class="form-input" name="score_${r.playerId}" value="${r.score}" placeholder="Score" style="flex:1;">
                    <input type="number" class="form-input" name="rank_${r.playerId}" value="${r.rank}" placeholder="Rank" style="width:70px;">
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      `);
    },

    editMatch(e, id) {
      e.preventDefault();
      const form = e.target;
      const gameId = form.gameId.value;
      const playedAt = new Date(form.playedAt).toISOString();
      
      const results = [];
      const match = Storage.getMatch(id);
      
      match.results.forEach(r => {
        const score = parseInt(form[`score_${r.playerId}`]?.value || 0);
        const rank = parseInt(form[`rank_${r.playerId}`]?.value || 1);
        results.push({ playerId: r.playerId, score, rank });
      });

      results.sort((a, b) => b.score - a.score);
      
      for (let i = 0; i < results.length; i++) {
        if (i > 0 && results[i].score === results[i-1].score) {
          results[i].rank = results[i-1].rank;
        } else {
          results[i].rank = i + 1;
        }
      }

      const playerIds = results.map(r => r.playerId);
      
      Storage.updateMatch(id, { gameId, playerIds, results, playedAt });
      this.closeModal();
      this.render();
    },

    clearAllData() {
      if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({}));
        this.render();
      }
    },

    resetSeedData() {
      if (confirm('Reset all data to demo data? This will replace your current data.')) {
        localStorage.removeItem('bgt_seeded');
        Storage.seedData();
        localStorage.setItem('bgt_seeded', 'true');
        this.render();
        alert('Demo data has been reset!');
      }
    },

    exportData() {
      const data = {
        users: Storage.getAllUsers(),
        games: Storage.getAllGames(),
        matches: Storage.getAllMatches(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boardgame_tracker_backup.json';
      a.click();
      URL.revokeObjectURL(url);
    },

    showImportData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            
            // Validate structure
            if (!data.users || !data.games || !data.matches) {
              alert('Invalid file format. Missing users, games, or matches.');
              return;
            }
            
            // Validate data types
            if (!Array.isArray(data.users) || !Array.isArray(data.games) || !Array.isArray(data.matches)) {
              alert('Invalid file format. Expected arrays for users, games, and matches.');
              return;
            }

            // Validate each user
            for (const user of data.users) {
              if (!user.id || !user.name) {
                alert('Invalid user data: missing id or name.');
                return;
              }
            }

            // Validate each game
            for (const game of data.games) {
              if (!game.id || !game.name) {
                alert('Invalid game data: missing id or name.');
                return;
              }
            }

            // Validate each match
            for (const match of data.matches) {
              if (!match.id || !match.gameId || !match.playerIds || !Array.isArray(match.playerIds) || !match.results) {
                alert('Invalid match data: missing required fields.');
                return;
              }
            }

            // Get existing data
            const existingUsers = Storage.getAllUsers();
            const existingGames = Storage.getAllGames();
            const existingMatches = Storage.getAllMatches();

            // Merge users (skip duplicates by name)
            const existingUserNames = new Set(existingUsers.map(u => u.name.toLowerCase()));
            const newUsers = data.users.filter(u => !existingUserNames.has(u.name.toLowerCase()));
            
            // Merge games (skip duplicates by name)
            const existingGameNames = new Set(existingGames.map(g => g.name.toLowerCase()));
            const newGames = data.games.filter(g => !existingGameNames.has(g.name.toLowerCase()));

            // Add all matches (they reference IDs)
            const newMatches = data.matches;

            const totalUsers = existingUsers.length + newUsers.length;
            const totalGames = existingGames.length + newGames.length;
            const totalMatches = existingMatches.length + newMatches.length;

            const summary = `Current: ${existingUsers.length} users, ${existingGames.length} games, ${existingMatches.length} matches\n\n` +
              `Importing: ${newUsers.length} new users, ${newGames.length} new games, ${newMatches.length} matches\n\n` +
              `After import: ${totalUsers} users, ${totalGames} games, ${totalMatches} matches`;

            if (confirm(summary + '\n\nContinue with import?')) {
              Storage._setData(STORAGE_KEYS.USERS, [...existingUsers, ...newUsers]);
              Storage._setData(STORAGE_KEYS.GAMES, [...existingGames, ...newGames]);
              Storage._setData(STORAGE_KEYS.MATCHES, [...existingMatches, ...newMatches]);
              this.render();
              alert(`Imported ${newUsers.length} users, ${newGames.length} games, ${newMatches.length} matches!`);
            }
          } catch (err) {
            alert('Error reading file: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    closeModal
  };

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
    window.app = app;
  });

})();
