/* =========================================================================
 * Copa do Mundo 2026 — acompanhamento de jogos
 * Fonte de dados: openfootball (JSON público, sem chave de API, com CORS).
 * Tudo é recalculado a cada carregamento da página (reload) a partir da API.
 * O usuário pode editar resultados; edições ficam salvas localmente
 * (localStorage), são marcadas visualmente e NÃO são sobrescritas pela API.
 * ========================================================================= */

(function () {
  "use strict";

  var DATA_URL =
    "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
  var STORAGE_KEY = "wc2026_overrides_v1";
  var THEME_KEY = "wc2026_theme_v1";

  // Estado global
  var STATE = {
    matches: [], // jogos vindos da API (com id estável)
    byNum: {}, // num -> jogo (mata-mata)
    overrides: {}, // id -> { ft:[a,b]|null, p:[a,b]|null }
    standings: {}, // "Group A" -> [linhas ordenadas]
    thirdSlots: {}, // num do jogo R32 -> nome do país (melhor 3º atribuído)
    groupsComplete: false,
    phase: "groups", // "groups" | "knockout"
    lastUpdated: null,
    simNow: null // data simulada (ms) p/ filtrar "próximos jogos" — só via ?date
  };

  var DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  /* ----------------------------- utilidades ----------------------------- */

  function getCountry(name) {
    var c = typeof COUNTRIES !== "undefined" ? COUNTRIES[name] : null;
    return c || null;
  }

  // É o nome de um país de verdade (e não um placeholder tipo "1A"/"W73")?
  function isCountry(name) {
    return !!getCountry(name);
  }

  // id estável por jogo (mata-mata usa num; grupos usam data+times)
  function matchId(m) {
    if (m.num != null) return "k" + m.num;
    return "g|" + m.date + "|" + m.team1 + "|" + m.team2;
  }

  // Converte "13:00 UTC-6" + "2026-06-11" para o horário em GMT-3 (Brasília).
  // Retorna um Date cujos campos UTC representam o relógio de parede GMT-3.
  function toGmt3(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    var parts = String(timeStr).trim().split(/\s+/);
    var hm = parts[0].split(":");
    var hh = parseInt(hm[0], 10);
    var mm = parseInt(hm[1] || "0", 10);
    var offset = 0;
    if (parts[1]) {
      var mtz = parts[1].match(/UTC([+-]\d+)/i);
      if (mtz) offset = parseInt(mtz[1], 10);
    }
    var d = dateStr.split("-").map(Number);
    var utcMs = Date.UTC(d[0], d[1] - 1, d[2], hh, mm) - offset * 3600000;
    var gmt3Ms = utcMs - 3 * 3600000;
    return new Date(gmt3Ms);
  }

  function fmtDayLabel(dt) {
    if (!dt) return "";
    return DOW[dt.getUTCDay()] + ", " + dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()];
  }
  function fmtTime(dt) {
    if (!dt) return "";
    var h = String(dt.getUTCHours()).padStart(2, "0");
    var m = String(dt.getUTCMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  /* --------------------------- placar efetivo --------------------------- */
  // Resultado considerado: override do usuário tem prioridade sobre a API.

  // Placar final segundo a API. Na fonte (openfootball), `ft` é o placar dos
  // 90 minutos; quando há prorrogação, o placar final vem em `et`.
  function apiScore(m) {
    if (!m.score) return null;
    var ft = Array.isArray(m.score.et) ? m.score.et : m.score.ft;
    if (!Array.isArray(ft)) return null;
    return { ft: ft.slice(), p: m.score.p ? m.score.p.slice() : null };
  }

  function effectiveScore(m) {
    var id = matchId(m);
    if (Object.prototype.hasOwnProperty.call(STATE.overrides, id)) {
      return STATE.overrides[id]; // pode ter ft:null (jogo "zerado" manualmente)
    }
    return apiScore(m);
  }
  function isEdited(m) {
    return Object.prototype.hasOwnProperty.call(STATE.overrides, matchId(m));
  }
  function hasResult(m) {
    var s = effectiveScore(m);
    return !!(s && s.ft && s.ft[0] != null && s.ft[1] != null);
  }

  /* ----------------------------- overrides ------------------------------ */

  function loadOverrides() {
    try {
      STATE.overrides = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      STATE.overrides = {};
    }
  }
  function saveOverrides() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.overrides));
    } catch (e) {
      /* ignore */
    }
  }
  // NOTA (ADR-0002): a 2ª preferência de usuário (tema) introduziu o helper
  // `prefs` namespaced abaixo. Os overrides seguem em sua própria chave
  // (`wc2026_overrides_v1`); roteá-los por `prefs` é refino futuro (fora de APR-02).
  function setOverride(m, ft, p) {
    STATE.overrides[matchId(m)] = { ft: ft, p: p || null };
    saveOverrides();
  }
  function clearOverride(m) {
    delete STATE.overrides[matchId(m)];
    saveOverrides();
  }

  /* --------------------------- preferências / tema ---------------------- */
  // Helper `prefs` namespaced (ADR-0002): leitura/escrita centralizadas sob o
  // prefixo wc2026_*_v1, degradando com segurança. Recebe o storage para ser
  // testável (funções puras) sem depender do localStorage do navegador.
  function makePrefs(store) {
    return {
      get: function (key, dflt) {
        try {
          var raw = store.getItem(key);
          return raw == null ? dflt : JSON.parse(raw);
        } catch (e) {
          return dflt;
        }
      },
      set: function (key, value) {
        try {
          store.setItem(key, JSON.stringify(value));
        } catch (e) {
          /* ignore */
        }
      }
    };
  }

  function defaultStore() {
    try {
      if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    } catch (e) {
      /* acesso bloqueado (ex.: modo privado) */
    }
    return {
      getItem: function () {
        return null;
      },
      setItem: function () {}
    };
  }

  var prefs = makePrefs(defaultStore());

  // Resolve o tema EFETIVO (puro): light/dark explícitos vencem; system — ou
  // qualquer valor inválido — segue a preferência do SO (default seguro).
  function resolveTheme(pref, systemPrefersDark) {
    if (pref === "light" || pref === "dark") return pref;
    return systemPrefersDark ? "dark" : "light";
  }

  function darkModeMQL() {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  }

  // Grava o tema efetivo em data-theme (o CSS só conhece light|dark).
  function applyTheme(pref) {
    var mql = darkModeMQL();
    var effective = resolveTheme(pref, mql ? mql.matches : false);
    document.documentElement.setAttribute("data-theme", effective);
  }

  function setupThemeControl() {
    var pref = prefs.get(THEME_KEY, "system");
    applyTheme(pref);
    var sel = document.getElementById("theme-select");
    if (sel) {
      sel.value = pref;
      sel.addEventListener("change", function () {
        pref = sel.value;
        prefs.set(THEME_KEY, pref);
        applyTheme(pref);
      });
    }
    // Em `system`, reflete ao vivo a troca de tema do SO (sem reload). Usa o
    // `pref` em memória (não relê o storage, que mente quando bloqueado — senão
    // uma troca do SO sobrescreveria uma escolha explícita light/dark).
    var mql = darkModeMQL();
    if (mql && typeof mql.addEventListener === "function") {
      mql.addEventListener("change", function () {
        if (pref === "system") applyTheme("system");
      });
    }
  }

  /* --------------------------- classificação ---------------------------- */

  function emptyRow(team) {
    return {
      team: team,
      J: 0,
      V: 0,
      E: 0,
      D: 0,
      GP: 0,
      GC: 0,
      SG: 0,
      PTS: 0
    };
  }

  function computeStandings() {
    var groups = {};
    // inicializa linhas a partir do calendário
    STATE.matches.forEach(function (m) {
      if (!m.group) return;
      if (!groups[m.group]) groups[m.group] = {};
      if (isCountry(m.team1) && !groups[m.group][m.team1])
        groups[m.group][m.team1] = emptyRow(m.team1);
      if (isCountry(m.team2) && !groups[m.group][m.team2])
        groups[m.group][m.team2] = emptyRow(m.team2);
    });

    var allGroupDone = true;
    STATE.matches.forEach(function (m) {
      if (!m.group) return;
      var s = effectiveScore(m);
      if (!s || !s.ft || s.ft[0] == null || s.ft[1] == null) {
        allGroupDone = false;
        return;
      }
      var a = groups[m.group][m.team1],
        b = groups[m.group][m.team2];
      if (!a || !b) return;
      var g1 = s.ft[0],
        g2 = s.ft[1];
      a.J++;
      b.J++;
      a.GP += g1;
      a.GC += g2;
      b.GP += g2;
      b.GC += g1;
      if (g1 > g2) {
        a.V++;
        b.D++;
        a.PTS += 3;
      } else if (g1 < g2) {
        b.V++;
        a.D++;
        b.PTS += 3;
      } else {
        a.E++;
        b.E++;
        a.PTS += 1;
        b.PTS += 1;
      }
    });

    var out = {};
    Object.keys(groups).forEach(function (g) {
      var rows = Object.keys(groups[g]).map(function (t) {
        var r = groups[g][t];
        r.SG = r.GP - r.GC;
        return r;
      });
      rows.sort(sortRows);
      out[g] = rows;
    });
    STATE.standings = out;
    STATE.groupsComplete =
      allGroupDone &&
      STATE.matches.some(function (m) {
        return m.group;
      });
  }

  // Critérios: pontos, saldo, gols pró, ordem alfabética (PT) como desempate final.
  function sortRows(a, b) {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;
    if (b.SG !== a.SG) return b.SG - a.SG;
    if (b.GP !== a.GP) return b.GP - a.GP;
    return ptName(a.team).localeCompare(ptName(b.team), "pt");
  }

  function ptName(name) {
    var c = getCountry(name);
    return c ? c.pt : name;
  }

  // Um grupo está "fechado" quando TODOS os seus jogos já têm placar efetivo.
  // Assim que isso acontece, o 1º e o 2º daquele grupo já podem ser exibidos
  // nos placeholders do mata-mata — independentemente dos outros grupos.
  function groupComplete(g) {
    var ms = STATE.matches.filter(function (m) {
      return m.group === g;
    });
    return (
      ms.length > 0 &&
      ms.every(function (m) {
        return hasResult(m);
      })
    );
  }

  // Pontuação máxima que uma linha ainda pode alcançar (3 jogos por grupo).
  function maxFuturePts(r) {
    return r.PTS + 3 * Math.max(0, 3 - r.J);
  }

  // Quantos 3ºs colocados de OUTROS grupos esta linha já supera (pelos mesmos
  // critérios de desempate). Como 8 dos 12 terceiros avançam, superar >= 4
  // significa estar garantidamente entre os 8 que vão ao mata-mata.
  function betterThanThirds(g, r) {
    var n = 0;
    Object.keys(STATE.standings).forEach(function (g2) {
      if (g2 === g) return;
      var third = STATE.standings[g2] && STATE.standings[g2][2];
      if (third && sortRows(r, third) < 0) n++;
    });
    return n;
  }

  // Status de classificação JÁ CONFIRMADO da linha i do grupo g:
  //  "green"  classificado (garantido entre os 2 primeiros)
  //  "yellow" 3º colocado com a linha encerrada e melhor que >= 4 outros terceiros
  //  "red"    eliminado (garantidamente fora do top-3 do grupo)
  //  ""       ainda em aberto (sem realce)
  function confirmStatus(g, rows, i) {
    var r = rows[i];
    if (!r) return "";
    var complete = groupComplete(g);

    // verde — classificado
    if (r.V >= 2) return "green"; // 2 vitórias num grupo de 4 garantem top-2
    if (complete && i <= 1) return "green";
    if (i <= 1) {
      var canReach = 0;
      rows.forEach(function (u, j) {
        if (j !== i && maxFuturePts(u) >= r.PTS) canReach++;
      });
      if (canReach <= 1) return "green"; // no máx. 1 time pode alcançá-la → top-2
    }

    // amarelo — 3º que avança (antes do vermelho: 3º nunca é vermelho)
    if (i === 2 && r.J >= 3 && betterThanThirds(g, r) >= 4) return "yellow";

    // vermelho — eliminado
    if (complete && i === 3) return "red";
    var guaranteedAbove = 0;
    rows.forEach(function (u, j) {
      if (j !== i && u.PTS > maxFuturePts(r)) guaranteedAbove++;
    });
    if (guaranteedAbove >= 3) return "red"; // 3 times garantidamente acima → último

    return "";
  }

  /* --------------- melhores terceiros (fase eliminatória) --------------- */

  // Ranqueia os 12 terceiros colocados e atribui os 8 melhores aos slots
  // "3X/Y/Z..." do mata-mata, respeitando o conjunto de grupos permitido de
  // cada slot (atribuição estimada — a tabela oficial da FIFA pode diferir).
  function computeThirdSlots() {
    STATE.thirdSlots = {};
    if (!STATE.groupsComplete) return;

    var thirds = []; // { group:'A', row }
    Object.keys(STATE.standings).forEach(function (g) {
      var rows = STATE.standings[g];
      if (rows.length >= 3) {
        thirds.push({ group: g.replace("Group ", ""), row: rows[2] });
      }
    });
    // ranqueia terceiros pelos mesmos critérios e pega os 8 melhores
    thirds.sort(function (x, y) {
      return sortRows(x.row, y.row);
    });
    var qualified = thirds.slice(0, 8);
    var qualSet = {};
    qualified.forEach(function (t) {
      qualSet[t.group] = t;
    });

    // slots R32 que recebem um terceiro: team1 ou team2 no formato "3A/B/..."
    var slots = [];
    STATE.matches.forEach(function (m) {
      if (m.num == null) return;
      [
        ["team1", m.team1],
        ["team2", m.team2]
      ].forEach(function (pair) {
        if (/^3[A-L](\/[A-L])*$/.test(pair[1])) {
          var allowed = pair[1]
            .slice(1)
            .split("/")
            .filter(function (gp) {
              return qualSet[gp];
            });
          slots.push({ num: m.num, side: pair[0], code: pair[1], allowed: allowed });
        }
      });
    });

    // emparelhamento (backtracking) slot -> grupo terceiro qualificado
    var groupsAvail = qualified.map(function (t) {
      return t.group;
    });
    var assignment = {};
    function backtrack(i) {
      if (i >= slots.length) return true;
      var slot = slots[i];
      for (var k = 0; k < slot.allowed.length; k++) {
        var g = slot.allowed[k];
        if (assignment.__used && assignment.__used[g]) continue;
        if (!groupsAvail.includes(g)) continue;
        assignment.__used = assignment.__used || {};
        assignment.__used[g] = true;
        assignment[slot.num + ":" + slot.side] = g;
        if (backtrack(i + 1)) return true;
        delete assignment.__used[g];
        delete assignment[slot.num + ":" + slot.side];
      }
      return false;
    }
    backtrack(0);

    slots.forEach(function (slot) {
      var g = assignment[slot.num + ":" + slot.side];
      if (g && qualSet[g]) {
        STATE.thirdSlots[slot.num + ":" + slot.side] = qualSet[g].row.team;
      }
    });
  }

  /* --------------------- resolução de placeholders ---------------------- */
  // Resolve um "team ref" (1A, 2B, 3X/Y, W73, L101, ou nome de país) num
  // objeto { name, label, decided }.
  //  - name: nome do país (em inglês, p/ buscar bandeira) quando já definido
  //  - label: texto a exibir quando ainda indefinido
  //  - decided: true quando já é um país concreto

  function resolveRef(ref, side, matchNum) {
    if (ref == null) return { name: null, label: "—", decided: false };
    if (isCountry(ref)) return { name: ref, label: ptName(ref), decided: true };

    var m;
    // 1º/2º colocado de grupo
    m = ref.match(/^([12])([A-L])$/);
    if (m) {
      var place = parseInt(m[1], 10);
      var grp = "Group " + m[2];
      var rows = STATE.standings[grp];
      if (groupComplete(grp) && rows && rows[place - 1]) {
        var t = rows[place - 1].team;
        return { name: t, label: ptName(t), decided: true };
      }
      return { name: null, label: (place === 1 ? "1º " : "2º ") + "Grupo " + m[2], decided: false };
    }
    // melhor terceiro
    if (/^3[A-L]/.test(ref)) {
      var key = matchNum + ":" + side;
      if (STATE.thirdSlots[key]) {
        var tt = STATE.thirdSlots[key];
        return { name: tt, label: ptName(tt), decided: true, estimated: true };
      }
      return { name: null, label: "Melhor 3º (" + ref.slice(1) + ")", decided: false };
    }
    // vencedor / perdedor de um jogo
    m = ref.match(/^([WL])(\d+)$/);
    if (m) {
      var num = parseInt(m[2], 10);
      var src = STATE.byNum[num];
      if (src) {
        var res = matchOutcome(src);
        if (res) {
          var pick = m[1] === "W" ? res.winner : res.loser;
          if (pick) return { name: pick, label: ptName(pick), decided: true };
        }
      }
      return {
        name: null,
        label: (m[1] === "W" ? "Vencedor" : "Perdedor") + " J" + num,
        decided: false
      };
    }
    return { name: null, label: ref, decided: false };
  }

  // Vencedor/perdedor de um jogo de mata-mata (usa pênaltis se ft empatar).
  function matchOutcome(m) {
    var s = effectiveScore(m);
    if (!s || !s.ft || s.ft[0] == null || s.ft[1] == null) return null;
    var t1 = resolveRef(m.team1, "team1", m.num);
    var t2 = resolveRef(m.team2, "team2", m.num);
    if (!t1.decided || !t2.decided) return null;
    var w, l;
    if (s.ft[0] > s.ft[1]) {
      w = t1.name;
      l = t2.name;
    } else if (s.ft[0] < s.ft[1]) {
      w = t2.name;
      l = t1.name;
    } else if (s.p && s.p[0] != null && s.p[1] != null && s.p[0] !== s.p[1]) {
      if (s.p[0] > s.p[1]) {
        w = t1.name;
        l = t2.name;
      } else {
        w = t2.name;
        l = t1.name;
      }
    } else {
      return null; // empate sem pênaltis definidos
    }
    return { winner: w, loser: l };
  }

  /* ------------------------------ render -------------------------------- */

  function flagImg(name, size) {
    var c = getCountry(name);
    var cls = "flag" + (size === "lg" ? " flag-lg" : "");
    if (!c) return '<span class="flag flag-ph" title="A definir"></span>';
    var w = size === "lg" ? "w40" : "w20";
    return (
      '<img class="' +
      cls +
      '" loading="lazy" alt="" ' +
      'src="https://flagcdn.com/' +
      w +
      "/" +
      c.iso +
      '.png" ' +
      "onerror=\"this.classList.add('flag-ph');this.removeAttribute('src')\">"
    );
  }

  // escapa aspas duplas para uso seguro em atributos HTML
  function attrEsc(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function teamChip(ref, side, matchNum, big) {
    var r = resolveRef(ref, side, matchNum);
    var size = big ? "lg" : "sm";
    // title = nome completo: aparece no hover quando o texto é cortado por "…"
    var t = ' title="' + attrEsc(r.label) + '"';
    var nameHtml = r.decided
      ? flagImg(r.name, size) + '<span class="tname"' + t + ">" + r.label + "</span>"
      : '<span class="flag flag-ph"></span><span class="tname tname-ph"' +
        t +
        ">" +
        r.label +
        "</span>";
    if (r.estimated)
      nameHtml +=
        ' <span class="est" title="Atribuição estimada do melhor 3º colocado — a tabela oficial da FIFA pode diferir.">≈</span>';
    return '<span class="team">' + nameHtml + "</span>";
  }

  // ------- próximos jogos -------
  function renderUpcoming() {
    var list = STATE.matches
      .filter(function (m) {
        return !hasResult(m);
      })
      .map(function (m) {
        return { m: m, dt: toGmt3(m.date, m.time) };
      })
      .filter(function (x) {
        return x.dt;
      })
      // ?date simula "hoje": esconde jogos anteriores à data simulada
      .filter(function (x) {
        return STATE.simNow == null || x.dt.getTime() >= STATE.simNow;
      })
      .sort(function (a, b) {
        return a.dt - b.dt;
      })
      .slice(0, 8);

    var el = document.getElementById("upcoming-list");
    if (!list.length) {
      el.innerHTML = '<p class="empty">Sem jogos pendentes. 🏆</p>';
      return;
    }
    el.innerHTML = list
      .map(function (x) {
        var m = x.m;
        var stageLabel = m.group ? m.group.replace("Group ", "Grupo ") : roundPt(m.round);
        return (
          '<div class="up-card">' +
          '<div class="up-when"><span class="up-day">' +
          fmtDayLabel(x.dt) +
          "</span>" +
          '<span class="up-time">' +
          fmtTime(x.dt) +
          "</span></div>" +
          '<div class="up-teams">' +
          teamChip(m.team1, "team1", m.num) +
          '<span class="up-vs">×</span>' +
          teamChip(m.team2, "team2", m.num) +
          "</div>" +
          '<div class="up-stage">' +
          stageLabel +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function roundPt(round) {
    if (!round) return "";
    if (/^Matchday/.test(round)) return "Rodada " + round.replace("Matchday ", "");
    var map = {
      "Round of 32": "Segunda rodada",
      "Round of 16": "Oitavas de final",
      "Quarter-final": "Quartas de final",
      "Semi-final": "Semifinal",
      "Match for third place": "Disputa de 3º lugar",
      Final: "Final"
    };
    return map[round] || round;
  }

  // ------- fase de grupos -------
  // Estrutura: cada grupo tem um "slot" de classificação (re-renderizado a cada
  // edição) e uma lista de jogos editáveis (criada uma vez e mantida estável,
  // para que editar um placar não recrie os inputs nem feche a lista).
  function renderGroups() {
    var wrap = document.getElementById("groups");
    var groupNames = Object.keys(STATE.standings).sort();
    if (!groupNames.length) {
      wrap.innerHTML = '<p class="empty">Carregando grupos…</p>';
      return;
    }

    var open = wrap.classList.contains("games-open");
    var cards = groupNames
      .map(function (g) {
        var letter = g.replace("Group ", "");
        return (
          '<div class="group-card">' +
          '<h3 class="group-title">Grupo ' +
          letter +
          "</h3>" +
          '<div class="standings-slot" data-grp="' +
          g +
          '">' +
          standingsTable(g) +
          "</div>" +
          renderGroupMatches(g) +
          "</div>"
        );
      })
      .join("");

    wrap.innerHTML =
      '<div class="groups-toolbar">' +
      '<button id="toggle-games" class="toggle-games" type="button" aria-pressed="' +
      open +
      '">' +
      (open ? "▴ Ocultar jogos" : "▾ Ver jogos") +
      "</button>" +
      "</div>" +
      '<div class="groups-grid">' +
      cards +
      "</div>";

    sizeGroupGrid();
  }

  // Mede a LARGURA DE CONTEÚDO real do card mais "largo" (a classificação com o
  // nome de seleção mais comprido manda) e usa esse valor como mínimo de coluna
  // da grade. Resultado: a grade só põe na linha quantos cards cabem nesse
  // tamanho; nenhum card encolhe abaixo do conteúdo (fim do vazamento), e quando
  // não cabe nem um, a página rola horizontalmente.
  function sizeGroupGrid() {
    var grid = document.querySelector(".groups-grid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".group-card");
    if (!cards.length) return;
    var max = 0;
    Array.prototype.forEach.call(cards, function (card) {
      var clone = card.cloneNode(true);
      clone.style.cssText =
        "position:absolute!important;left:-99999px;top:0;width:min-content;visibility:hidden;";
      document.body.appendChild(clone);
      var w = clone.getBoundingClientRect().width;
      clone.parentNode.removeChild(clone);
      if (w > max) max = w;
    });
    if (max > 0) grid.style.setProperty("--group-card-min", Math.ceil(max) + "px");
  }

  // alterna a exibição dos jogos de TODOS os grupos de uma só vez
  function toggleGroupGames() {
    var wrap = document.getElementById("groups");
    var open = wrap.classList.toggle("games-open");
    var btn = document.getElementById("toggle-games");
    if (btn) {
      btn.textContent = open ? "▴ Ocultar jogos" : "▾ Ver jogos";
      btn.setAttribute("aria-pressed", String(open));
    }
  }

  function standingsTable(g) {
    var rows = STATE.standings[g] || [];
    var body = rows
      .map(function (r, i) {
        var st = confirmStatus(g, rows, i);
        var titles = {
          green: "Classificado",
          yellow: "3º colocado — pode avançar",
          red: "Eliminado"
        };
        var trClass = st ? "conf conf-" + st : "";
        var trTitle = st ? ' title="' + titles[st] + '"' : "";
        return (
          '<tr class="' +
          trClass +
          '"' +
          trTitle +
          ">" +
          '<td class="pos">' +
          (i + 1) +
          "</td>" +
          '<td class="team-cell">' +
          flagImg(r.team) +
          '<span class="tname" title="' +
          attrEsc(ptName(r.team)) +
          '">' +
          ptName(r.team) +
          "</span></td>" +
          '<td class="b">' +
          r.PTS +
          "</td>" +
          "<td>" +
          r.J +
          "</td><td>" +
          r.V +
          "</td><td>" +
          r.E +
          "</td><td>" +
          r.D +
          "</td>" +
          "<td>" +
          r.GP +
          "</td><td>" +
          r.GC +
          "</td><td>" +
          sg(r.SG) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    return (
      '<table class="standings"><thead><tr>' +
      '<th class="pos">#</th><th class="team-h">Seleção</th>' +
      th("PTS", "Pontos: vitória vale 3, empate 1, derrota 0.") +
      th("J", "Jogos disputados.") +
      th("V", "Vitórias.") +
      th("E", "Empates.") +
      th("D", "Derrotas.") +
      th("GP", "Gols pró (marcados).", "left") +
      th("GC", "Gols contra (sofridos).", "left") +
      th("SG", "Saldo de gols (GP − GC).", "left") +
      "</tr></thead><tbody>" +
      body +
      "</tbody></table>"
    );
  }

  // re-renderiza apenas as tabelas de classificação (sem tocar nos inputs)
  function updateAllStandings() {
    Object.keys(STATE.standings).forEach(function (g) {
      var slot = document.querySelector('.standings-slot[data-grp="' + cssEsc(g) + '"]');
      if (slot) slot.innerHTML = standingsTable(g);
    });
  }

  function sg(v) {
    return (v > 0 ? "+" : "") + v;
  }

  // cabeçalho com ícone de informação (tooltip no hover)
  // side="left" faz o tooltip abrir para a esquerda (colunas próximas da borda direita)
  function th(abbr, desc, side) {
    var cls = "info" + (side === "left" ? " tip-left" : "");
    return (
      '<th class="info-h"><span class="abbr">' +
      abbr +
      '</span><span class="' +
      cls +
      '" tabindex="0" aria-label="' +
      desc +
      '">ⓘ<span class="tip">' +
      desc +
      "</span></span></th>"
    );
  }

  function renderGroupMatches(g) {
    var ms = STATE.matches
      .filter(function (m) {
        return m.group === g;
      })
      .sort(function (a, b) {
        return (toGmt3(a.date, a.time) || 0) - (toGmt3(b.date, b.time) || 0);
      });
    var rows = ms
      .map(function (m) {
        return matchEditRow(m);
      })
      .join("");
    return '<div class="group-games"><div class="games-list">' + rows + "</div></div>";
  }

  // linha editável de um jogo (fase de grupos). Layout empilhado: cada time em
  // sua própria linha, com o placar editável logo à frente do nome — assim
  // nomes longos nunca "vazam" do card.
  function matchEditRow(m) {
    var s = effectiveScore(m);
    var edited = isEdited(m);
    var dt = toGmt3(m.date, m.time);
    var v1 = s && s.ft && s.ft[0] != null ? s.ft[0] : "";
    var v2 = s && s.ft && s.ft[1] != null ? s.ft[1] : "";
    var id = matchId(m);
    return (
      '<div class="game' +
      (edited ? " edited" : "") +
      '" data-id="' +
      id +
      '">' +
      '<div class="game-when">' +
      (dt ? fmtDayLabel(dt) + " · " + fmtTime(dt) : "") +
      "</div>" +
      gameSide(id, "s1", v1, m.team1, "team1", m.num) +
      gameSide(id, "s2", v2, m.team2, "team2", m.num) +
      '<div class="game-foot">' +
      footerHtml(id, edited) +
      "</div>" +
      "</div>"
    );
  }

  // uma linha "placar + seleção" de um jogo de grupo
  function gameSide(id, side, val, ref, refSide, num) {
    return (
      '<div class="game-side">' +
      '<input class="score-in" data-id="' +
      id +
      '" data-side="' +
      side +
      '" type="number" min="0" inputmode="numeric" value="' +
      val +
      '">' +
      '<span class="g-team">' +
      teamChip(ref, refSide, num) +
      "</span>" +
      "</div>"
    );
  }

  // rodapé do jogo: badge "automático/editado" + botão de reverter
  function footerHtml(id, edited) {
    return edited
      ? '<span class="edited-badge">editado</span><button class="revert" data-id="' +
          id +
          '" type="button">↺ reverter p/ API</button>'
      : '<span class="auto-badge">automático (API)</span>';
  }

  // ------- mata-mata (chaveamento de dois lados) -------
  // A FINAL fica no centro; as fases anteriores se abrem para as laterais
  // esquerda e direita. Os cards são editáveis NO PRÓPRIO chaveamento (placar à
  // frente do nome, pênaltis discretos no rodapé). Por isso o chaveamento não é
  // recriado a cada tecla: apenas os rótulos resolvidos e o realce do vencedor
  // são atualizados, para nunca perder o foco do que está sendo digitado.
  function renderKnockout() {
    var wrap = document.getElementById("knockout");
    var finalMatch = STATE.matches.filter(function (m) {
      return m.round === "Final";
    })[0];
    if (!finalMatch) {
      wrap.innerHTML = '<p class="empty">Chaveamento indisponível.</p>';
      return;
    }
    var note = STATE.groupsComplete
      ? ""
      : '<p class="ko-note">A fase de grupos ainda não terminou — as seleções aparecem conforme os resultados são confirmados. Você pode editar qualquer placar direto nos cards.</p>';
    wrap.innerHTML = note + '<div id="bracket-display">' + bracketDisplayHtml() + "</div>";
  }

  // Para cada rodada do mata-mata, a rodada que a alimenta. (A "Disputa de 3º
  // lugar" é renderizada à parte, fora da árvore, então não entra aqui.)
  var FEEDER_ROUND = {
    "Round of 16": "Round of 32",
    "Quarter-final": "Round of 16",
    "Semi-final": "Quarter-final",
    Final: "Semi-final"
  };

  // Acha, na rodada `round`, o jogo em que `country` jogou. Cada seleção disputa
  // no máximo um jogo por rodada, então essa correspondência é única — e não
  // depende do resultado (vale mesmo se o placar for editado pelo usuário).
  function feederByTeam(round, country) {
    for (var i = 0; i < STATE.matches.length; i++) {
      var g = STATE.matches[i];
      if (g.round !== round) continue;
      var t1 = resolveRef(g.team1, "team1", g.num);
      var t2 = resolveRef(g.team2, "team2", g.num);
      if (t1.name === country || t2.name === country) return g;
    }
    return null;
  }

  // Os dois jogos que alimentam um jogo de mata-mata. Normalmente cada lado vem
  // como "W<num>" (vencedor do jogo num). Mas a fonte (openfootball) SUBSTITUI
  // esse placeholder pelo nome do país assim que o jogo-fonte termina (ex.: "W73"
  // vira "Canada"). Nesse caso, recuperamos o jogo-fonte pelo país que avançou —
  // senão a árvore "perderia" jogos já decididos (e os abaixo deles).
  function childMatches(m) {
    var feederRound = FEEDER_ROUND[m.round];
    if (!feederRound) return []; // Round of 32 / grupos: é folha, sem jogos-fonte
    var kids = [];
    [m.team1, m.team2].forEach(function (ref) {
      var mm = String(ref).match(/^W(\d+)$/);
      if (mm && STATE.byNum[parseInt(mm[1], 10)]) {
        kids.push(STATE.byNum[parseInt(mm[1], 10)]);
      } else if (isCountry(ref)) {
        var src = feederByTeam(feederRound, ref);
        if (src) kids.push(src);
      }
    });
    return kids;
  }

  function bracketDisplayHtml() {
    var finalMatch = STATE.matches.filter(function (m) {
      return m.round === "Final";
    })[0];
    var third = STATE.matches.filter(function (m) {
      return m.round === "Match for third place";
    })[0];
    if (!finalMatch) return "";
    var semis = childMatches(finalMatch); // [semi esquerda, semi direita]
    var leftHtml = semis[0] ? renderNode(semis[0], "left") : "";
    var rightHtml = semis[1] ? renderNode(semis[1], "right") : "";
    // .bracket-inner tem a largura do conteúdo (rola junto com ele); a barra de
    // cabeçalhos de etapa é posicionada por JS (layoutBracket) sobre cada coluna.
    var bracket =
      '<div class="bracket-scroll"><div class="bracket-inner">' +
      '<div class="bracket-headers"></div>' +
      '<div class="bracket2">' +
      '<div class="bside left">' +
      leftHtml +
      "</div>" +
      '<div class="bcenter">' +
      bracketCard(finalMatch, false) +
      "</div>" +
      '<div class="bside right">' +
      rightHtml +
      "</div>" +
      "</div>" +
      "</div></div>";
    // 3º lugar fica abaixo do chaveamento (fora do centro), para que a final
    // permaneça alinhada verticalmente com as semifinais.
    var thirdHtml = third
      ? '<div class="third-place"><h3>Disputa de 3º lugar</h3>' +
        bracketCard(third, false) +
        "</div>"
      : "";
    return bracket + thirdHtml;
  }

  // re-render completo do chaveamento (troca de aba / carga da API). NÃO chamar
  // durante a digitação — recria os inputs e mataria o foco.
  function renderBracketOnly() {
    var el = document.getElementById("bracket-display");
    if (el) el.innerHTML = bracketDisplayHtml();
  }

  // ----- layout do chaveamento (largura + cabeçalhos de etapa por coluna) -----
  // O chaveamento usa o MESMO espaço lateral disponível dos "próximos jogos":
  // medimos a largura natural do chaveamento e, se sobra espaço, alargamos os
  // cards (--bcard-w) para preenchê-lo; se não couber, mantém o tamanho base e a
  // própria área rola lateralmente.
  var BCARD_BASE = 122,
    BCARD_MIN = 122,
    BCARD_MAX = 200,
    BCARD_COLS = 9;

  function sizeBracket() {
    var scroll = document.querySelector(".bracket-scroll");
    var b2 = document.querySelector(".bracket2");
    if (!scroll || !b2) return;
    document.documentElement.style.setProperty("--bcard-w", BCARD_BASE + "px");
    // largura natural do chaveamento no tamanho base (sem esticar para 100%)
    b2.style.width = "max-content";
    var natural = b2.getBoundingClientRect().width;
    b2.style.width = "";
    var avail = scroll.clientWidth - 6; // desconta o respiro de padding
    var w = BCARD_BASE;
    if (natural > 0 && natural < avail) {
      w = BCARD_BASE + (avail - natural) / BCARD_COLS;
      w = Math.max(BCARD_MIN, Math.min(BCARD_MAX, w));
    }
    document.documentElement.style.setProperty("--bcard-w", Math.round(w) + "px");
  }

  // Posiciona o nome de cada etapa no topo da sua coluna. As colunas não são
  // elementos próprios (o chaveamento é uma árvore recursiva), então agrupamos
  // os cards pela sua posição horizontal e rotulamos cada grupo com a etapa.
  function buildBracketHeaders() {
    var inner = document.querySelector(".bracket-inner");
    var headers = inner && inner.querySelector(".bracket-headers");
    if (!inner || !headers) return;
    headers.innerHTML = "";
    var cards = inner.querySelectorAll(".bracket2 .bcard");
    if (!cards.length) return;
    var innerLeft = inner.getBoundingClientRect().left;
    var cols = [];
    Array.prototype.forEach.call(cards, function (card) {
      var m = findMatchById(card.getAttribute("data-id"));
      if (!m) return;
      var r = card.getBoundingClientRect();
      var center = r.left - innerLeft + r.width / 2;
      var col = null;
      for (var i = 0; i < cols.length; i++) {
        if (Math.abs(cols[i].center - center) < 10) {
          col = cols[i];
          break;
        }
      }
      if (!col) cols.push({ center: center, round: m.round });
    });
    cols.forEach(function (col) {
      var h = document.createElement("div");
      h.className = "bracket-col-h";
      h.textContent = roundPt(col.round);
      h.style.left = col.center + "px";
      headers.appendChild(h);
    });
  }

  // chamada sempre que o chaveamento estiver visível e seu tamanho puder mudar
  function layoutBracket() {
    var ko = document.getElementById("knockout");
    if (!ko || ko.classList.contains("hidden")) return;
    sizeBracket();
    buildBracketHeaders();
  }

  // Renderiza recursivamente um nó. dir="left": filhos à esquerda e jogo à
  // direita. dir="right": espelhado (jogo à esquerda, filhos à direita).
  function renderNode(m, dir) {
    var kids = childMatches(m);
    var mir = dir === "right" ? " mirror" : "";
    if (kids.length === 2) {
      return (
        '<div class="bnode' +
        mir +
        '">' +
        '<div class="bchildren">' +
        '<div class="bchild">' +
        renderNode(kids[0], dir) +
        "</div>" +
        '<div class="bchild">' +
        renderNode(kids[1], dir) +
        "</div>" +
        "</div>" +
        bracketCard(m, true) +
        "</div>"
      );
    }
    return '<div class="bnode leaf' + mir + '">' + bracketCard(m, false) + "</div>";
  }

  // empate no tempo normal: ambos os placares preenchidos e iguais
  function isTie(m) {
    var s = effectiveScore(m);
    return !!(s && s.ft && s.ft[0] != null && s.ft[1] != null && s.ft[0] === s.ft[1]);
  }

  // bandeira do time de um lado, ao lado do input de pênalti (sinaliza o lado)
  function penFlag(m, refSide) {
    var r = resolveRef(m[refSide], refSide, m.num);
    return '<span class="pen-flag" title="' + attrEsc(r.label) + '">' + flagImg(r.name) + "</span>";
  }

  // bloco de pênaltis: título "pênaltis" em cima, inputs centralizados, cada um
  // com a bandeira do país correspondente ao lado. Só é exibido em caso de empate.
  function penaltiesHtml(m, id) {
    var s = effectiveScore(m);
    var p1 = s && s.p && s.p[0] != null ? s.p[0] : "";
    var p2 = s && s.p && s.p[1] != null ? s.p[1] : "";
    return (
      '<div class="pen-title">pênaltis</div>' +
      '<div class="pen-row">' +
      penFlag(m, "team1") +
      '<input class="pen-in" data-id="' +
      id +
      '" data-side="p1" type="number" min="0" inputmode="numeric" value="' +
      p1 +
      '">' +
      '<span class="dash">-</span>' +
      '<input class="pen-in" data-id="' +
      id +
      '" data-side="p2" type="number" min="0" inputmode="numeric" value="' +
      p2 +
      '">' +
      penFlag(m, "team2") +
      "</div>"
    );
  }

  // card EDITÁVEL do chaveamento: placar à frente do nome; pênaltis só em empate.
  function bracketCard(m, hasChildren) {
    var s = effectiveScore(m);
    var edited = isEdited(m);
    var dt = toGmt3(m.date, m.time);
    var id = matchId(m);
    var v1 = s && s.ft && s.ft[0] != null ? s.ft[0] : "";
    var v2 = s && s.ft && s.ft[1] != null ? s.ft[1] : "";
    var isFinal = m.round === "Final";
    var isThird = m.round === "Match for third place";
    var cls =
      "bcard" +
      (hasChildren ? " has-children" : "") +
      (isFinal ? " is-final" : "") +
      (isThird ? " is-third" : "") +
      (edited ? " edited" : "");
    // O nome da etapa agora vive no topo da coluna (layoutBracket), não no card.
    // O card mostra apenas a data; a final mantém um 🏆 discreto como destaque.
    var when = dt
      ? '<span class="bcard-when">' + fmtDayLabel(dt) + " " + fmtTime(dt) + "</span>"
      : "";
    var head = (isFinal ? "🏆 " : "") + (when || (isFinal ? "Final" : ""));
    return (
      '<div class="' +
      cls +
      '" data-id="' +
      id +
      '">' +
      '<div class="bcard-head">' +
      head +
      '<span class="bcard-badge">' +
      bcardBadge(id, edited) +
      "</span></div>" +
      bcardRow(m, "team1", "s1", id, v1) +
      bcardRow(m, "team2", "s2", id, v2) +
      '<div class="bcard-pens-slot">' +
      (isTie(m) ? penaltiesHtml(m, id) : "") +
      "</div>" +
      "</div>"
    );
  }

  // uma linha do card de mata-mata: [placar editável] [bandeira + nome]
  function bcardRow(m, refSide, scoreSide, id, val) {
    var win = isWinnerSide(m, refSide) ? " win" : "";
    return (
      '<div class="bcard-row' +
      win +
      '" data-team="' +
      refSide +
      '">' +
      '<input class="score-in bscore-in" data-id="' +
      id +
      '" data-side="' +
      scoreSide +
      '" type="number" min="0" inputmode="numeric" value="' +
      val +
      '">' +
      '<span class="bteam">' +
      teamChip(m[refSide], refSide, m.num) +
      "</span>" +
      "</div>"
    );
  }

  function bcardBadge(id, edited) {
    return edited
      ? '<span class="edited-badge sm">editado</span>' +
          '<button class="revert mini" data-id="' +
          id +
          '" type="button" title="Reverter para o resultado da API">↺</button>'
      : "";
  }

  function isWinnerSide(m, refSide) {
    var out = matchOutcome(m);
    if (!out || !out.winner) return false;
    return resolveRef(m[refSide], refSide, m.num).name === out.winner;
  }

  // Atualiza rótulos/realces do chaveamento após uma edição, SEM recriar inputs
  // (preserva foco e digitação): nomes resolvidos, realce do vencedor e a marca
  // de "editado" em todos os cards.
  function refreshKnockoutLabels() {
    var cards = document.querySelectorAll("#knockout .bcard[data-id]");
    Array.prototype.forEach.call(cards, function (card) {
      var m = findMatchById(card.getAttribute("data-id"));
      if (!m) return;
      var edited = isEdited(m);
      card.classList.toggle("edited", edited);
      var badge = card.querySelector(".bcard-badge");
      if (badge) badge.innerHTML = bcardBadge(matchId(m), edited);
      ["team1", "team2"].forEach(function (refSide) {
        var row = card.querySelector('.bcard-row[data-team="' + refSide + '"]');
        if (!row) return;
        row.classList.toggle("win", isWinnerSide(m, refSide));
        var slot = row.querySelector(".bteam");
        if (slot) slot.innerHTML = teamChip(m[refSide], refSide, m.num);
      });
      // pênaltis: aparecem só em empate. Recriamos os inputs apenas quando o
      // bloco surge/some (transição); enquanto permanece visível, atualizamos só
      // as bandeiras — assim nunca tiramos o foco de um input em digitação.
      var pslot = card.querySelector(".bcard-pens-slot");
      if (pslot) {
        var show = isTie(m),
          has = pslot.children.length > 0;
        if (show && !has) pslot.innerHTML = penaltiesHtml(m, matchId(m));
        else if (!show && has) pslot.innerHTML = "";
        else if (show && has) {
          var flags = pslot.querySelectorAll(".pen-flag");
          ["team1", "team2"].forEach(function (refSide, k) {
            if (!flags[k]) return;
            var rr = resolveRef(m[refSide], refSide, m.num);
            flags[k].innerHTML = flagImg(rr.name);
            flags[k].setAttribute("title", rr.label);
          });
        }
      }
    });
  }

  /* --------------------------- edição (eventos) ------------------------- */

  // lê os inputs de um jogo no DOM e grava o override (sem re-renderizar nada)
  function commitEdit(id) {
    var sel = cssEsc(id);
    var s1 = document.querySelector('.score-in[data-id="' + sel + '"][data-side="s1"]');
    var s2 = document.querySelector('.score-in[data-id="' + sel + '"][data-side="s2"]');
    var p1 = document.querySelector('.pen-in[data-id="' + sel + '"][data-side="p1"]');
    var p2 = document.querySelector('.pen-in[data-id="' + sel + '"][data-side="p2"]');
    function num(el) {
      return el && el.value !== "" ? parseInt(el.value, 10) : null;
    }
    var a = num(s1),
      b = num(s2);
    var pa = num(p1),
      pb = num(p2);
    // mantém valores parciais (ex.: só o mandante preenchido) para não apagar
    // o que o usuário digitou; placares incompletos não contam na classificação.
    var ft = a === null && b === null ? null : [a, b];
    var p = pa === null && pb === null ? null : [pa, pb];
    var m = findMatchById(id);
    if (!m) return;
    setOverride(m, ft, p);
  }

  // atualiza só a marcação visual da linha editada (classe + rodapé), sem mexer
  // nos inputs em que o usuário está digitando
  function updateRowState(id) {
    var m = findMatchById(id);
    if (!m) return;
    var edited = isEdited(m);
    var rows = document.querySelectorAll('.game[data-id="' + cssEsc(id) + '"]');
    rows.forEach(function (row) {
      row.classList.toggle("edited", edited);
      var foot = row.querySelector(".game-foot");
      if (foot) foot.innerHTML = footerHtml(id, edited);
    });
  }

  // ao reverter, devolve os inputs ao valor que veio da API
  function resetRowInputs(id, m) {
    var s = apiScore(m);
    function setVal(side, cls, val) {
      var el = document.querySelector(
        "." + cls + '[data-id="' + cssEsc(id) + '"][data-side="' + side + '"]'
      );
      if (el) el.value = val;
    }
    setVal("s1", "score-in", s && s.ft && s.ft[0] != null ? s.ft[0] : "");
    setVal("s2", "score-in", s && s.ft && s.ft[1] != null ? s.ft[1] : "");
    setVal("p1", "pen-in", s && s.p && s.p[0] != null ? s.p[0] : "");
    setVal("p2", "pen-in", s && s.p && s.p[1] != null ? s.p[1] : "");
  }

  function findMatchById(id) {
    for (var i = 0; i < STATE.matches.length; i++) {
      if (matchId(STATE.matches[i]) === id) return STATE.matches[i];
    }
    return null;
  }

  function cssEsc(s) {
    return String(s).replace(/(["\\|])/g, "\\$1");
  }

  /* -------- query strings de teste (uso interno/admin; não documentadas) ----- */

  function getQuery() {
    var q = {};
    (typeof location !== "undefined" ? location.search : "")
      .replace(/^\?/, "")
      .split("&")
      .forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf("=");
        var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
        q[k] = i < 0 ? "" : decodeURIComponent(kv.slice(i + 1));
      });
    return q;
  }

  // "dd-mm" -> ms na mesma convenção do toGmt3 (campos UTC = relógio GMT-3).
  function parseSimDate(v) {
    var mt = String(v || "").match(/^(\d{1,2})-(\d{1,2})$/);
    if (!mt) return null;
    var d = parseInt(mt[1], 10),
      mo = parseInt(mt[2], 10);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return Date.UTC(2026, mo - 1, d, 0, 0);
  }

  function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  // Preenche TODOS os jogos com placares aleatórios, como se fossem edições do
  // usuário (vira override). Em jogos de mata-mata que empatarem, gera pênaltis
  // distintos para que o vencedor se resolva e o chaveamento avance.
  function applyFillRandom() {
    STATE.matches.forEach(function (m) {
      var a = randInt(0, 4),
        b = randInt(0, 4),
        p = null;
      if (m.num != null && a === b) {
        var pa = randInt(2, 5),
          pb = randInt(2, 5);
        while (pb === pa) pb = randInt(2, 6);
        p = [pa, pb];
      }
      STATE.overrides[matchId(m)] = { ft: [a, b], p: p };
    });
    saveOverrides();
  }

  // Reverte tudo para a API (limpa todos os overrides).
  function applyFillReset() {
    STATE.overrides = {};
    saveOverrides();
  }

  function applyTestQuery() {
    var q = getQuery();
    if (q.fill === "random") applyFillRandom();
    else if (q.fill === "reset") applyFillReset();
  }

  function isScoreInput(t) {
    return t && t.classList && (t.classList.contains("score-in") || t.classList.contains("pen-in"));
  }

  function attachEditHandlers() {
    // Salva a cada tecla e atualiza só as VISÕES derivadas. Os inputs vivem em
    // contêineres estáveis que não são recriados durante a digitação, então o
    // foco e o que está sendo digitado nunca se perdem.
    document.body.addEventListener("input", function (e) {
      var t = e.target;
      if (!isScoreInput(t)) return;
      var card = t.closest("[data-id]");
      if (!card) return;
      var id = card.getAttribute("data-id");
      commitEdit(id);
      if (t.closest("#knockout")) {
        refreshAfterEditKnockout();
      } else {
        updateRowState(id);
        refreshAfterEditGroups();
      }
    });
    document.body.addEventListener("click", function (e) {
      var t = e.target;
      // botão "Ver jogos / Ocultar jogos" (fase de grupos)
      if (t.closest && t.closest("#toggle-games")) {
        toggleGroupGames();
        return;
      }
      // reverter um placar editado para o valor da API
      if (t.classList && t.classList.contains("revert")) {
        var id = t.getAttribute("data-id");
        var m = findMatchById(id);
        if (!m) return;
        clearOverride(m);
        resetRowInputs(id, m);
        if (t.closest("#knockout")) {
          refreshAfterEditKnockout();
        } else {
          updateRowState(id);
          refreshAfterEditGroups();
        }
      }
    });
  }

  /* ------------------------------ fases --------------------------------- */

  function setPhase(phase) {
    STATE.phase = phase;
    document.getElementById("groups").classList.toggle("hidden", phase !== "groups");
    document.getElementById("knockout").classList.toggle("hidden", phase !== "knockout");
    document.getElementById("tab-groups").classList.toggle("active", phase === "groups");
    document.getElementById("tab-knockout").classList.toggle("active", phase === "knockout");
    // Ao entrar no mata-mata, reconstrói o chaveamento para refletir resultados
    // de grupos editados enquanto estávamos na outra aba (sem foco em risco).
    if (phase === "knockout") {
      renderBracketOnly();
      layoutBracket();
    }
  }

  // render completo (carga inicial / atualização da API): reconstrói tudo,
  // inclusive as listas de edição.
  function renderAll() {
    computeStandings();
    computeThirdSlots();
    renderUpcoming();
    renderGroups();
    renderKnockout();
  }

  // edição na fase de GRUPOS: recalcula classificação/terceiros e atualiza as
  // tabelas + próximos jogos, sem tocar nos inputs. O chaveamento (em outra aba)
  // é reconstruído ao alternar para ele em setPhase().
  function refreshAfterEditGroups() {
    computeStandings();
    computeThirdSlots();
    renderUpcoming();
    updateAllStandings();
  }

  // edição no MATA-MATA: classificação não muda; atualiza só os rótulos/realces
  // do chaveamento (sem recriar inputs) e a lista de próximos jogos.
  function refreshAfterEditKnockout() {
    renderUpcoming();
    refreshKnockoutLabels();
  }

  /* ------------------------------- fetch -------------------------------- */

  function annotateMatches(raw) {
    STATE.matches = (raw.matches || []).map(function (m) {
      return m;
    });
    STATE.byNum = {};
    STATE.matches.forEach(function (m) {
      if (m.num != null) STATE.byNum[m.num] = m;
    });
  }

  function setStatus(text, kind) {
    var el = document.getElementById("status");
    el.textContent = text;
    el.className = "status" + (kind ? " " + kind : "");
  }

  function fetchData(isReload) {
    setStatus("Atualizando resultados…", "loading");
    return fetch(DATA_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        annotateMatches(data);
        applyTestQuery(); // ?fill=random | ?fill=reset (admin/teste)
        STATE.lastUpdated = new Date();
        renderAll();

        // Define a fase padrão apenas na 1ª carga: grupos enquanto ativos,
        // mata-mata quando o último jogo de grupo terminar. O usuário pode alternar.
        if (!isReload) {
          setPhase(STATE.groupsComplete ? "knockout" : "groups");
        } else if (STATE.phase === "knockout") {
          // recarga da API com o usuário já no mata-mata: reposiciona cabeçalhos
          layoutBracket();
        }
        var hh = String(STATE.lastUpdated.getHours()).padStart(2, "0");
        var mm = String(STATE.lastUpdated.getMinutes()).padStart(2, "0");
        setStatus("Atualizado às " + hh + ":" + mm, "ok");
      })
      .catch(function (err) {
        setStatus(
          "Falha ao buscar dados da API (" +
            err.message +
            "). Resultados editados manualmente continuam válidos.",
          "error"
        );
        // ainda renderiza com o que houver (overrides) caso a API falhe
        if (!STATE.matches.length) {
          document.getElementById("groups").innerHTML =
            '<p class="empty">Não foi possível carregar os jogos. Verifique a conexão e recarregue.</p>';
        } else {
          renderAll();
        }
      });
  }

  /* -------------------------------- init -------------------------------- */

  // A topbar é fixa; reservamos o espaço dela no topo do body. Como ela pode
  // quebrar em mais linhas (telas estreitas), medimos a altura real e a
  // reaplicamos sempre que mudar de tamanho.
  function setupFixedHeader() {
    var header = document.querySelector(".topbar");
    if (!header) return;
    function apply() {
      document.body.style.paddingTop = header.offsetHeight + "px";
    }
    apply();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(apply).observe(header);
    }
    window.addEventListener("resize", function () {
      apply();
      sizeGroupGrid();
      layoutBracket();
    });
  }

  function init() {
    loadOverrides();
    setupThemeControl();
    STATE.simNow = parseSimDate(getQuery().date); // ?date=dd-mm (admin/teste)
    attachEditHandlers();
    setupFixedHeader();
    document.getElementById("tab-groups").addEventListener("click", function () {
      setPhase("groups");
    });
    document.getElementById("tab-knockout").addEventListener("click", function () {
      setPhase("knockout");
    });
    document.getElementById("refresh").addEventListener("click", function () {
      fetchData(true);
    });
    setPhase("groups");
    fetchData(false);
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }

  // Exporta funções puras para teste em Node (não afeta o navegador).
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      _state: STATE,
      toGmt3: toGmt3,
      fmtTime: fmtTime,
      fmtDayLabel: fmtDayLabel,
      computeStandings: computeStandings,
      computeThirdSlots: computeThirdSlots,
      resolveRef: resolveRef,
      matchOutcome: matchOutcome,
      annotateMatches: annotateMatches,
      effectiveScore: effectiveScore,
      matchId: matchId,
      sortRows: sortRows,
      childMatches: childMatches,
      makePrefs: makePrefs,
      resolveTheme: resolveTheme
    };
  }
})();
