        const $ = x => document.getElementById(x),
            fleet = [
                ['cv', 'Aircraft Carrier', '空母', 8, [
                    ['Harrier', 10, 'pick4', 'ハリアー'],
                    ['Hornet', 18, 'area3', 'ホーネット'],
                    ['Tomcat', 20, 'tomcat', 'トムキャット']
                ]],
                ['bb', 'Battleship', '戦艦', 5, [
                    ['Main Cannon', 6, 'area2', '主砲'],
                    ['Tomahawk Z', 15, 'column', 'トマホークZ'],
                    ['Triple Shot', 20, 'sparse', '三連射']
                ]],
                ['ca', 'Cruiser', '巡洋艦', 4, [
                    ['Phalanx', 4, 'corners4', 'ファランクス'],
                    ['Sea Sparrow', 6, 'corners5', 'シースパロー'],
                    ['Tomahawk', 10, 'ring', 'トマホーク']
                ]],
                ['dd', 'Destroyer', '駆逐艦', 3, [
                    ['SS-N-25', 3, 'row3', 'SS-N-25'],
                    ['Harpoon', 4, 'row4', 'ハープーン'],
                    ['Stealth', 4, 'col4', 'ステルス']
                ]],
                ['ss', 'Submarine', '潜水艦', 2, [
                    ['Twin Torpedoes', 2, 'pick2', '2連装魚雷'],
                    ['Triple Torpedoes', 3, 'pick3', '3連装魚雷'],
                    ['Quad Torpedoes', 4, 'pick4', '4連装魚雷']
                ]],
                ['re', 'Recon ship', '偵察艦', 1, [
                    ['SPS-4', 1, 'radar', 'SPS-4レーダー'],
                    ['SPS-5', 2, 'sps5', 'SPS-5レーダー'],
                    ['SPS-8', 4, 'radar5', 'SPS-8レーダー']
                ]]
            ],
            text = {
                en: { budget: 'Equipment budget', rotate: '↻ Rotate', setupHelp: 'Choose a ship, rotate if needed, then click your grid to deploy. Hover previews placement.', yourFleet: 'Your fleet', enemyWaters: 'Enemy waters', start: 'Begin battle', clear: 'Clear deployment', combat: 'Combat control', combatHelp: 'Hover enemy waters to preview a strike. All cells in a multi-cell strike resolve together. Repeated cells count as misses.', log: 'Combat log', newGame: 'New game', deploy: 'Fleet deployment', missile: 'Missile - free', deployed: 'ships deployed', invalid: 'Invalid placement.', yourTurn: 'Your turn', detected: 'Enemy fleet detected.', ready: 'Deploy all ships to begin.', victory: 'Victory — enemy fleet neutralized.', radarResult: (detected, clear) => `Radar scan: ${detected} signal(s) detected, ${clear} no signal.`, tomcatSunk: shipId => `${name(fleet.find(ship => ship[0] === shipId))} sunk — Tomcat strike!`, enemySunk: shipId => `Enemy ${name(fleet.find(ship => ship[0] === shipId))} sunk!`, shipSunk: shipId => `${name(fleet.find(ship => ship[0] === shipId))} sunk!`, strikeResult: (hit, other) => `Strike resolved: ${hit} hit(s), ${other} other cell(s).`, enemyFireAt: coordinate => `Enemy fires at ${coordinate}.`, enemyHit: 'Enemy hit your ship.', enemyMiss: 'Enemy missed.' },
                jp: { budget: '装備予算', rotate: '↻ 回転', setupHelp: '艦を選び、向きを決めて自軍グリッドをクリックすると配置できます。ホバーで配置を確認できます。', yourFleet: '自軍艦隊', enemyWaters: '敵海域', start: '戦闘開始', clear: '配置をクリア', combat: '戦闘管制', combatHelp: '敵海域をホバーすると攻撃範囲を確認できます。複数マス攻撃は同時に判定されます。攻撃済みのマスは外れになります。', log: '戦闘ログ', newGame: '新しいゲーム', deploy: '艦隊配置', missile: 'ミサイル - 無料', deployed: '隻を配置済み', invalid: '配置できません。', yourTurn: '自軍のターン', detected: '敵艦隊を探知しました。', ready: '全艦を配置して戦闘を開始してください。', victory: '勝利 — 敵艦隊を撃滅しました。', radarResult: (detected, clear) => `レーダー走査: ${detected} 信号を探知、${clear} 信号なし。`, tomcatSunk: shipId => `${name(fleet.find(ship => ship[0] === shipId))} 撃沈 — トムキャット攻撃！`, enemySunk: shipId => `敵の${name(fleet.find(ship => ship[0] === shipId))}を撃沈！`, shipSunk: shipId => `${name(fleet.find(ship => ship[0] === shipId))}が撃沈されました！`, strikeResult: (hit, other) => `攻撃結果: ${hit} マス命中、その他 ${other} マス。`, enemyFireAt: coordinate => `敵の攻撃地点: ${coordinate}。`, enemyHit: '敵弾が自軍艦に命中しました。', enemyMiss: '敵の攻撃は外れました。' }
            },
            currentText = key => text[jp ? 'jp' : 'en'][key];
        let jp = false,
            statusKey = 'ready',
            logEntries = [],
            rot = 0,
            placed = {},
            foe = [],
            shots = new Set(),
            hits = new Set(),
            misses = new Set(),
            incoming = new Set(),
            incomingHits = new Set(),
            incomingMisses = new Set(),
            near = new Set(),
            sunkCells = new Set(),
            sunkPlayerCells = new Set(),
            radarDetected = new Set(),
            radarClear = new Set(),
            cost = 0,
            phase = 'setup',
            preview = [],
            previewBoard = null;
        const isRadar = type => ['radar', 'sps5', 'radar5'].includes(type),
            name = s => jp ? s[2] : s[1],
            equipmentName = e => jp ? e[3] : e[0],
            applyText = () => {
                $('budgetLabel').textContent = currentText('budget');
                $('rotate').textContent = currentText('rotate');
                $('setupHelp').textContent = currentText('setupHelp');
                $('yourFleet').textContent = currentText('yourFleet');
                $('enemyWaters').textContent = currentText('enemyWaters');
                $('start').textContent = currentText('start');
                $('clearDeployment').textContent = currentText('clear');
                $('combatControl').textContent = currentText('combat');
                $('combatHelp').textContent = currentText('combatHelp');
                $('combatLog').textContent = currentText('log');
                $('newGame').textContent = currentText('newGame');
                $('deploy').textContent = currentText('deploy');
                $('status').textContent = currentText(statusKey);
            },
            cells = () => Array.from({
                length: 64
            }, (_, i) => i),
            xy = i => [i % 8, Math.floor(i / 8)],
            at = (x, y) => y * 8 + x;

        function renderLog() {
            const log = $('log');
            log.replaceChildren(...logEntries.map(({ key, values }) => {
                const entry = document.createElement('div'),
                    message = currentText(key);
                entry.textContent = '› ' + (typeof message === 'function' ? message(...values) : message);
                return entry
            }));
            log.scrollTop = log.scrollHeight
        }

        function say(key, ...values) {
            logEntries.push({ key, values });
            renderLog()
        }

        function layout(s, a, r) {
            let [x, y] = xy(a), out = [], w = s[0] === 'cv' ? (r ? 2 : 4) : (r ? 1 : s[3]), h = s[0] === 'cv' ? (r ? 4 : 2) : (r ? s[3] : 1);
            if (x + w > 8 || y + h > 8) return [];
            for (let j = 0; j < h; j++)
                for (let i = 0; i < w; i++) out.push(at(x + i, y + j));
            return out
        }

        function pattern(k, a) {
            let [x, y] = xy(a), out = [], add = (dx, dy) => {
                if (x + dx >= 0 && x + dx < 8 && y + dy >= 0 && y + dy < 8) out.push(at(x + dx, y + dy));
            };
            if (k === 'tomcat') return [a];
            if (k === 'column') return Array.from({
                length: 8
            }, (_, j) => at(x, j));
            if (k.startsWith('pick')) return Array.from({
                length: +k.slice(4)
            }, () => Math.floor(Math.random() * 64));
            let n = k === 'area3' ? 3 : k === 'area2' ? 2 : k === 'corners4' ? 4 : k === 'corners5' ? 5 : k === 'ring' ? 3 : k === 'row3' ? 3 : k === 'row4' || k === 'col4' ? 4 : k === 'radar' ? 2 : k === 'sps5' || k === 'sparse' ? 5 : 1;
            if (!isRadar(k) && (x + n > 8 || y + n > 8)) return [];
            if (k.startsWith('area')) {
                for (let j = 0; j < n; j++)
                    for (let i = 0; i < n; i++) add(i, j)
            }
            if (k.startsWith('corners')) {
                [
                    [0, 0],
                    [n - 1, 0],
                    [0, n - 1],
                    [n - 1, n - 1]
                ].forEach(([i, j]) => add(i, j));
                if (k === 'corners5') add(2, 2)
            }
            if (k === 'ring')
                for (let j = 0; j < 3; j++)
                    for (let i = 0; i < 3; i++)
                        if (i !== 1 || j !== 1) add(i, j);
            if (k === 'row3' || k === 'row4')
                for (let i = 0; i < n; i++) add(i, 0);
            if (k === 'col4')
                for (let j = 0; j < n; j++) add(0, j);
            if (k === 'radar')
                for (let j = 0; j < 2; j++)
                    for (let i = 0; i < 2; i++) add(i, j);
            if (k === 'radar5')
                for (let j = -2; j <= 2; j++)
                    for (let i = -2; i <= 2; i++)
                        if (Math.abs(i) + Math.abs(j) <= 2) add(i, j);
            if (k === 'sps5')[[2, 2], [0, 0], [4, 0], [0, 4], [4, 4]].forEach(([i, j]) => add(i, j));
            if (k === 'sparse')
                for (let j = 0; j < 5; j++)
                    for (let i = 0; i < 5; i++)
                        if (![1, 3].includes(i) && ![1, 3].includes(j) && !(i === 2 && j === 2)) add(i, j);
            return [...new Set(out)]
        }

        function fill() {
            let s = $('ship');
            s.innerHTML = fleet.filter(x => !placed[x[0]]).map(x => `<option value="${x[0]}">${name(x)}</option>`).join('');
            let cur = fleet.find(x => x[0] === s.value) || fleet[0];
            $('equip').innerHTML = cur[4].map((e, i) => `<option value="${i}" ${cost + e[1] > 60 ? 'disabled' : ''}>${equipmentName(e)} — ${e[1]} pts</option>`).join('');
            $('attack').innerHTML = `<option value="normal">${currentText('missile')}</option>` + fleet.flatMap(s => s[4].map((e, i) => `<option value="${s[0]}:${i}" ${cost + e[1] > 60 || placed[s[0]]?.sunk ? 'disabled' : ''}>${name(s)} / ${equipmentName(e)} (${e[1]})</option>`)).join('')
        }

        function updatePreview() {
            [['pboard', 'player'], ['eboard', 'enemy']].forEach(([id, board]) => {
                [...$(id).children].forEach((cell, i) => {
                    cell.classList.toggle('preview', previewBoard === board && preview.includes(i));
                });
            });
        }

        function draw() {
            [
                ['pboard', true],
                ['eboard', false]
            ].forEach(([id, own]) => {
                let b = $(id);
                b.innerHTML = '';
                cells().forEach(i => {
                    let c = document.createElement('button');
                    c.className = 'cell';
                    let deployed = own && Object.values(placed).find(p => p.c.includes(i));
                    if (deployed) {
                        c.classList.add('ship', `ship-${deployed.s[0]}`);
                        c.dataset.ship = deployed.s[0];
                        c.title = name(deployed.s);
                    }
                    if (own) {
                        if (incomingHits.has(i)) c.classList.add('hit');
                        if (incomingMisses.has(i)) c.classList.add('miss');
                        if (sunkPlayerCells.has(i)) c.classList.add('sunk');
                    } else {
                        if (hits.has(i)) c.classList.add('hit');
                        if (misses.has(i)) c.classList.add('miss');
                        if (near.has(i)) c.classList.add('near-miss');
                        if (sunkCells.has(i)) c.classList.add('sunk');
                        if (radarDetected.has(i)) c.classList.add('radar-detected');
                        if (radarClear.has(i)) c.classList.add('radar-clear');
                    }
                    if (previewBoard === (own ? 'player' : 'enemy') && preview.includes(i)) c.classList.add('preview');
                    c.onmouseenter = () => {
                        if (phase === 'setup' && own) {
                            previewBoard = 'player';
                            let selectedShip = fleet.find(s => s[0] === $('ship').value);
                            preview = selectedShip ? layout(selectedShip, i, rot) : [];
                            updatePreview()
                        }
                        if (phase === 'battle' && !own) {
                            let v = $('attack').value,
                                sp = fleet.find(s => s[0] === v.split(':')[0]) || fleet[0],
                                e = sp[4][+v.split(':')[1]];
                            previewBoard = 'enemy';
                            preview = v === 'normal' ? [i] : pattern(e[2], i);
                            updatePreview()
                        }
                    };
                    c.onmouseleave = () => {
                        preview = [];
                        previewBoard = null;
                        updatePreview()
                    };
                    c.onclick = () => own && phase === 'setup' ? deploy(i) : !own && phase === 'battle' ? fire(i) : null;
                    b.appendChild(c)
                })
            });
            $('budget').textContent = 60 - cost;
            $('fleet').textContent = Object.keys(placed).length + '/6 ' + currentText('deployed');
            $('start').disabled = Object.keys(placed).length !== 6 || phase !== 'setup'
        }

        function deploy(i) {
            let s = fleet.find(s => s[0] === $('ship').value),
                c = layout(s, i, rot);
            if (c.length !== s[3] || Object.values(placed).some(p => p.c.some(v => c.includes(v)))) return say('invalid');
            placed[s[0]] = {
                s,
                c,
                hp: c.length,
                sunk: false
            };
            fill();
            draw()
        }

        function begin() {
            phase = 'battle';
            foe = [];
            fleet.forEach(s => {
                let c = [],
                    n = 0;
                while (n++ < 100) {
                    c = layout(s, Math.random() * 64 | 0, Math.random() < .5 ? 0 : 1);
                    if (c.length === s[3] && !foe.some(p => p.c.some(v => c.includes(v)))) break
                }
                foe.push({
                    s,
                    c,
                    sunk: false
                })
            });
            statusKey = 'yourTurn';
            $('status').textContent = currentText(statusKey);
            say('detected');
            draw()
        }

        function fire(i) {
            let v = $('attack').value,
                sp = fleet[0],
                e = ['Normal', 0, 'normal'];
            if (v !== 'normal') {
                let [id, k] = v.split(':');
                sp = fleet.find(s => s[0] === id);
                if (placed[id]?.sunk) return;
                e = sp[4][+k];
                cost += e[1]
            }
            let cellsHit = v === 'normal' ? [i] : pattern(e[2], i),
                hit = 0;
            if (isRadar(e[2])) {
                radarDetected.clear();
                radarClear.clear();
                cellsHit.forEach(cell => {
                    if (foe.some(ship => !ship.sunk && ship.c.includes(cell))) radarDetected.add(cell);
                    else radarClear.add(cell);
                });
                say('radarResult', radarDetected.size, radarClear.size);
                fill();
                draw();
                return;
            }
            radarDetected.clear();
            radarClear.clear();
            cellsHit.forEach(c => {
                if (shots.has(c)) return;
                shots.add(c);
                let target = foe.find(s => s.c.includes(c) && !s.sunk);
                if (target) {
                    hit++;
                    hits.add(c);
                    if (e[2] === 'tomcat') {
                        target.sunk = true;
                        target.c.forEach(cell => sunkCells.add(cell));
                        say('tomcatSunk', target.s[0])
                    } else if (target.c.every(x => shots.has(x))) {
                        target.sunk = true;
                        target.c.forEach(cell => sunkCells.add(cell));
                        say('enemySunk', target.s[0])
                    }
                } else misses.add(c)
            });
            say('strikeResult', hit, cellsHit.length - hit);
            near.clear();
            misses.forEach(cell => {
                let [x, y] = xy(cell);
                if (foe.some(ship => !ship.sunk && ship.c.some(segment => {
                    let [sx, sy] = xy(segment);
                    return Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1 && (x !== sx || y !== sy);
                }))) near.add(cell);
            });
            if (foe.every(s => s.sunk)) {
                phase = 'over';
                statusKey = 'victory';
                $('status').textContent = currentText(statusKey)
            } else {
                let opts = cells().filter(c => !incoming.has(c)),
                    a = opts[Math.random() * opts.length | 0];
                incoming.add(a);
                let target = Object.values(placed).find(ship => ship.c.includes(a) && !ship.sunk);
                if (target) {
                    incomingHits.add(a);
                    target.hp--;
                    say('enemyHit');
                    if (target.hp <= 0) {
                        target.sunk = true;
                        target.c.forEach(cell => sunkPlayerCells.add(cell));
                        say('shipSunk', target.s[0]);
                    }
                } else {
                    incomingMisses.add(a);
                    say('enemyMiss');
                }
                say('enemyFireAt', String.fromCharCode(65 + a % 8) + (1 + (a / 8 | 0)));
            }
            fill();
            draw()
        }

        function clearFleet() {
            placed = {};
            cost = 0;
            phase = 'setup';
            shots.clear();
            hits.clear();
            misses.clear();
            incoming.clear();
            incomingHits.clear();
            incomingMisses.clear();
            near.clear();
            sunkCells.clear();
            sunkPlayerCells.clear();
            radarDetected.clear();
            radarClear.clear();
            foe = [];
            fill();
            draw();
            statusKey = 'ready';
            $('status').textContent = currentText(statusKey)
        }

        function reset() {
            clearFleet();
            logEntries = [];
            renderLog()
        }
        $('ship').onchange = fill;
        $('rotate').onclick = () => rot = 1 - rot;
        $('start').onclick = begin;
        $('lang').onclick = () => {
            jp = !jp;
            $('lang').textContent = jp ? 'English' : '日本語';
            document.documentElement.lang = jp ? 'ja' : 'en';
            applyText();
            renderLog();
            fill();
            draw()
        };

        function clear() {
            clearFleet()
        }
        fill();
        applyText();
        draw();