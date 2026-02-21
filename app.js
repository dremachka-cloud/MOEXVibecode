// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderCommittees();
    populateFilters();
    renderAnalytics();
    renderAllMembers();
});

// Навигация
function initNavigation() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Обновить навигацию
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Показать нужную страницу
    document.getElementById('page-' + pageName).classList.add('active');

    // Прокрутка наверх
    window.scrollTo(0, 0);
}

// Отображение списка комитетов с группировкой
function renderCommittees() {
    const container = document.getElementById('committees-list');

    // Определяем группы комитетов
    const groups = [
        {
            title: 'Базовые рынки',
            emoji: '🎲',
            description: 'Главное, что торгуется',
            ids: ['a327', 'a341', 'a342']
        },
        {
            title: 'Продвинутые штуки',
            emoji: '🚀',
            description: 'Для тех, кто въехал',
            ids: ['a329', 'a2450', 'a308', 'a343']
        },
        {
            title: 'Территория эмитентов',
            emoji: '🏢',
            description: 'Компании, которые на бирже',
            ids: ['a1910', 'a2504', 'a304']
        },
        {
            title: 'Админка биржи',
            emoji: '👨‍💼',
            description: 'Кто рулит',
            ids: ['a331', 'a2435']
        }
    ];

    // Генерируем HTML для каждой группы
    container.innerHTML = groups.map(group => {
        const groupCommittees = committeesData.filter(c => group.ids.includes(c.id));

        return `
            <div class="committee-group">
                <div class="group-header">
                    <h3 class="group-title">
                        <span class="group-emoji">${group.emoji}</span>
                        ${group.title}
                    </h3>
                    <p class="group-description">${group.description}</p>
                </div>
                <div class="group-cards">
                    ${groupCommittees.map(committee => `
                        <div class="committee-card" onclick="showCommittee('${committee.id}')">
                            <h3>${committee.name}</h3>
                            <p>${committee.short_description}</p>
                            <div class="committee-stats">
                                <span class="stat">
                                    <span class="stat-number">${committee.members.length}</span> участников
                                </span>
                                <span class="stat">
                                    <span class="stat-number">${committee.decisions.length}</span> решений
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Показать детальную страницу комитета
function showCommittee(id) {
    const committee = committeesData.find(c => c.id === id);
    if (!committee) return;

    // Получаем всех участников со статистикой и прозвищами
    const allMembersStats = getAllMembersWithStats();

    const container = document.getElementById('committee-detail');
    container.innerHTML = `
        <div class="committee-header">
            <h2>${committee.name}</h2>
            <p class="committee-desc">${committee.short_description}</p>
            <a href="${committee.url}" target="_blank" class="official-link">Зырь официальную страницу на MOEX →</a>

            <div class="committee-info">
                <div class="info-block">
                    <h4>Зачем они нужны?</h4>
                    <p>${committee.goals}</p>
                </div>
                <div class="info-block">
                    <h4>Чем занимаются?</h4>
                    <p>${committee.tasks}</p>
                </div>
                <div class="info-block">
                    <h4>Что могут делать?</h4>
                    <p>${committee.powers}</p>
                </div>
            </div>
        </div>

        <div class="nerd-section">
            <h3>📚 Чувак, если ты реальный зануда</h3>
            <p>Хочешь почитать все официальные правила и положения? Вот тебе ссылка на полный документ со всеми юридическими формулировками:</p>
            <a href="${committee.regulation_url || committee.url}" target="_blank" class="official-link">📋 Положение о комитете (для зануд) →</a>
        </div>

        <div class="members-section">
            <h3>Кто в команде?</h3>
            ${committee.members.map(member => {
                const memberStats = allMembersStats[member.name];
                const nickname = memberStats ? memberStats.nickname : '';
                return `
                    <div class="member-item">
                        <div>
                            <div class="member-name">
                                ${member.name}
                                ${nickname ? `<span class="member-nickname">${nickname}</span>` : ''}
                            </div>
                            <div class="member-company">${member.company}</div>
                        </div>
                        <div class="member-position">${member.position}</div>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="decisions-section">
            <h3>Что они решили? (короче, главное)</h3>
            ${committee.decisions.map(decision => `
                <div class="decision-item">
                    <div class="decision-date">${formatDate(decision.date)}</div>
                    <div class="decision-title">${decision.title}</div>
                    <div class="decision-summary">${decision.summary}</div>
                    <div class="decision-votes">
                        <span class="vote for">👍 За: ${decision.votes_for}</span>
                        <span class="vote against">👎 Против: ${decision.votes_against}</span>
                        <span class="vote abstain">🤷 Воздержался: ${decision.votes_abstain}</span>
                    </div>
                    <div class="decision-speaker">Кто докладывал: ${decision.speaker}</div>
                    <a href="${decision.source_url || committee.url}" target="_blank" class="decision-link">📄 Смотреть на MOEX →</a>
                </div>
            `).join('')}
        </div>
    `;

    showPage('committee');
}

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Заполнение фильтров поиска
function populateFilters() {
    const select = document.getElementById('filter-committee');
    committeesData.forEach(committee => {
        const option = document.createElement('option');
        option.value = committee.id;
        option.textContent = committee.name;
        select.appendChild(option);
    });
}

// Поиск по решениям
function performSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const committeeFilter = document.getElementById('filter-committee').value;
    const yearFilter = document.getElementById('filter-year').value;

    const results = [];

    committeesData.forEach(committee => {
        if (committeeFilter && committee.id !== committeeFilter) return;

        committee.decisions.forEach(decision => {
            const year = decision.date.substring(0, 4);
            if (yearFilter && year !== yearFilter) return;

            const searchText = (
                decision.title + ' ' +
                decision.summary + ' ' +
                decision.speaker
            ).toLowerCase();

            if (!query || searchText.includes(query)) {
                results.push({
                    committee: committee.name,
                    committeeId: committee.id,
                    decision: decision
                });
            }
        });
    });

    renderSearchResults(results);
}

function renderSearchResults(results) {
    const container = document.getElementById('search-results');

    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">Упс, ничего не нашли. Попробуй другие слова!</div>';
        return;
    }

    container.innerHTML = results.map(result => {
        const committee = committeesData.find(c => c.id === result.committeeId);
        const sourceUrl = result.decision.source_url || (committee ? committee.url : 'https://www.moex.com/s262');
        return `
            <div class="decision-item">
                <div class="decision-date">${formatDate(result.decision.date)} | ${result.committee}</div>
                <div class="decision-title">${result.decision.title}</div>
                <div class="decision-summary">${result.decision.summary}</div>
                <div class="decision-votes">
                    <span class="vote for">👍 За: ${result.decision.votes_for}</span>
                    <span class="vote against">👎 Против: ${result.decision.votes_against}</span>
                    <span class="vote abstain">🤷 Воздержался: ${result.decision.votes_abstain}</span>
                </div>
                <div class="decision-speaker">Кто докладывал: ${result.decision.speaker}</div>
                <div class="decision-actions">
                    <a href="${sourceUrl}" target="_blank" class="decision-link">📄 Смотреть на MOEX →</a>
                    <span class="decision-link-secondary" onclick="showCommittee('${result.committeeId}')">Перейти в комитет</span>
                </div>
            </div>
        `;
    }).join('');
}

// Автопоиск при вводе
document.getElementById('search-input')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Аналитика
function renderAnalytics() {
    // Статистика по комитетам
    const labels = committeesData.map(c => c.name.replace('Комитет по ', '').replace('Комитет ', ''));
    const decisionCounts = committeesData.map(c => c.decisions.length);

    // Диаграмма решений
    new Chart(document.getElementById('chart-decisions'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Количество решений',
                data: decisionCounts,
                backgroundColor: '#3949ab',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Голосование
    let totalFor = 0, totalAgainst = 0, totalAbstain = 0;
    committeesData.forEach(c => {
        c.decisions.forEach(d => {
            totalFor += d.votes_for;
            totalAgainst += d.votes_against;
            totalAbstain += d.votes_abstain;
        });
    });

    new Chart(document.getElementById('chart-votes'), {
        type: 'doughnut',
        data: {
            labels: ['За', 'Против', 'Воздержался'],
            datasets: [{
                data: [totalFor, totalAgainst, totalAbstain],
                backgroundColor: ['#4caf50', '#f44336', '#ff9800']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Временная шкала
    const monthlyData = {};
    committeesData.forEach(c => {
        c.decisions.forEach(d => {
            const month = d.date.substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
    });

    const months = Object.keys(monthlyData).sort();
    const monthCounts = months.map(m => monthlyData[m]);

    new Chart(document.getElementById('chart-timeline'), {
        type: 'line',
        data: {
            labels: months.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ['', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                return `${monthNames[parseInt(month)]} ${year}`;
            }),
            datasets: [{
                label: 'Решений',
                data: monthCounts,
                borderColor: '#3949ab',
                backgroundColor: 'rgba(57, 73, 171, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Аналитика по докладчикам
    renderSpeakersChart();
    renderMembersVotingTable();

    // Общая статистика
    const totalDecisions = committeesData.reduce((sum, c) => sum + c.decisions.length, 0);
    const totalMembers = new Set(committeesData.flatMap(c => c.members.map(m => m.name))).size;

    document.getElementById('stats-summary').innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 20px;">Общая картина (TL;DR)</h3>
        <div class="stats-row">
            <div class="stat-item">
                <div class="stat-value">${committeesData.length}</div>
                <div class="stat-label">комитетов в игре</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalDecisions}</div>
                <div class="stat-label">решений принято</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalMembers}</div>
                <div class="stat-label">людей участвует</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${Math.round(totalFor / (totalFor + totalAgainst + totalAbstain) * 100)}%</div>
                <div class="stat-label">голосов "за" (почти всегда согласны)</div>
            </div>
        </div>
    `;
}

// Участники
function renderAllMembers() {
    // Получаем всех участников со статистикой и прозвищами
    const allMembersStats = getAllMembersWithStats();

    // Собираем всех уникальных участников с их комитетами
    const membersMap = {};

    committeesData.forEach(committee => {
        committee.members.forEach(member => {
            if (!membersMap[member.name]) {
                membersMap[member.name] = {
                    name: member.name,
                    nickname: allMembersStats[member.name]?.nickname || '',
                    committees: []
                };
            }

            // Считаем голоса этого члена в комитете (упрощённо - по его докладам)
            const memberDecisions = committee.decisions.filter(d => d.speaker === member.name);
            const votesFor = memberDecisions.reduce((sum, d) => sum + d.votes_for, 0);
            const votesAgainst = memberDecisions.reduce((sum, d) => sum + d.votes_against, 0);

            membersMap[member.name].committees.push({
                name: committee.name,
                id: committee.id,
                position: member.position,
                company: member.company,
                reportsCount: memberDecisions.length,
                votesFor: votesFor,
                votesAgainst: votesAgainst
            });
        });
    });

    const members = Object.values(membersMap).sort((a, b) =>
        b.committees.length - a.committees.length
    );

    const container = document.getElementById('members-list');
    container.innerHTML = members.map(member => `
        <div class="member-card">
            <h3>
                ${member.name}
                ${member.nickname ? `<span class="member-nickname-large">${member.nickname}</span>` : ''}
            </h3>
            <p>Тусит в ${member.committees.length} комитет${getCommitteeSuffix(member.committees.length)} — многозадачный чел!</p>
            <div class="member-committees">
                ${member.committees.map(c => `
                    <div class="member-committee-item" onclick="showCommittee('${c.id}')">
                        <h4>${c.name}</h4>
                        <div><strong>${c.position}</strong> | ${c.company}</div>
                        <div class="voting-stats">
                            <span>Докладов: ${c.reportsCount}</span>
                            ${c.reportsCount > 0 ? `
                                <span class="vote for">Поддержано: ${c.votesFor}</span>
                                <span class="vote against">Против: ${c.votesAgainst}</span>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function getCommitteeSuffix(count) {
    if (count === 1) return 'е';
    if (count >= 2 && count <= 4) return 'ах';
    return 'ах';
}

// Поиск по участникам
function searchMembers() {
    const query = document.getElementById('member-search').value.toLowerCase();
    const cards = document.querySelectorAll('#members-list .member-card');

    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        if (name.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Автопоиск при вводе
document.getElementById('member-search')?.addEventListener('keyup', searchMembers);

// График голосования по докладчикам
function renderSpeakersChart() {
    const speakerStats = {};

    committeesData.forEach(committee => {
        committee.decisions.forEach(decision => {
            const speaker = decision.speaker;
            if (!speakerStats[speaker]) {
                speakerStats[speaker] = {
                    name: speaker,
                    reports: 0,
                    votesFor: 0,
                    votesAgainst: 0,
                    votesAbstain: 0
                };
            }
            speakerStats[speaker].reports++;
            speakerStats[speaker].votesFor += decision.votes_for;
            speakerStats[speaker].votesAgainst += decision.votes_against;
            speakerStats[speaker].votesAbstain += decision.votes_abstain;
        });
    });

    const speakers = Object.values(speakerStats).sort((a, b) => b.reports - a.reports);
    const labels = speakers.map(s => s.name.split(' ').slice(0, 2).join(' '));

    new Chart(document.getElementById('chart-speakers'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'За',
                    data: speakers.map(s => s.votesFor),
                    backgroundColor: '#4caf50'
                },
                {
                    label: 'Против',
                    data: speakers.map(s => s.votesAgainst),
                    backgroundColor: '#f44336'
                },
                {
                    label: 'Воздержался',
                    data: speakers.map(s => s.votesAbstain),
                    backgroundColor: '#ff9800'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

// Общая функция для получения всех участников со статистикой и прозвищами
function getAllMembersWithStats() {
    const memberStats = {};

    // Собираем статистику по всем участникам
    committeesData.forEach(committee => {
        committee.members.forEach(member => {
            if (!memberStats[member.name]) {
                memberStats[member.name] = {
                    name: member.name,
                    committees: [],
                    totalReports: 0,
                    votesFor: 0,
                    votesAgainst: 0,
                    votesAbstain: 0
                };
            }

            // Добавляем комитет если ещё нет
            if (!memberStats[member.name].committees.includes(committee.name)) {
                memberStats[member.name].committees.push(committee.name);
            }
        });

        // Считаем голоса по докладам
        committee.decisions.forEach(decision => {
            if (memberStats[decision.speaker]) {
                memberStats[decision.speaker].totalReports++;
                memberStats[decision.speaker].votesFor += decision.votes_for;
                memberStats[decision.speaker].votesAgainst += decision.votes_against;
                memberStats[decision.speaker].votesAbstain += decision.votes_abstain;
            }
        });
    });

    const members = Object.values(memberStats);

    // Добавляем прозвища
    members.forEach(member => {
        member.nickname = getNickname(member, members);
    });

    return memberStats;
}

// Функция для определения прозвища участника
function getNickname(member, allMembers) {
    const total = member.votesFor + member.votesAgainst + member.votesAbstain;

    // Если нет докладов - пугливый зайчик
    if (member.totalReports === 0) {
        return 'Пугливый зайчик 🐰';
    }

    const forPct = total > 0 ? (member.votesFor / total * 100) : 0;
    const againstPct = total > 0 ? (member.votesAgainst / total * 100) : 0;
    const abstainPct = total > 0 ? (member.votesAbstain / total * 100) : 0;

    const committeesCount = member.committees.length;
    const reportsCount = member.totalReports;

    // Определяем используемые прозвища для уникальности
    const usedNicknames = allMembers
        .filter(m => m.name !== member.name && m.nickname)
        .map(m => m.nickname);

    const nicknames = [];

    // Критерии для прозвищ (в порядке приоритета)

    // 1. Много "против" (больше 30%)
    if (againstPct > 30) {
        nicknames.push('Душнила 😤', 'Мистер НЕТ 🙅', 'Критик 🔍', 'Бунтарь 😈', 'Скептик 🤨', 'Возмутитель 🌪️');
    }

    // 2. Много "воздержался" (больше 20%)
    else if (abstainPct > 20) {
        nicknames.push('Боязливый 😰', 'Нерешительный 🤔', 'Сомневающийся 🤷', 'Дипломат ⚖️', 'Осторожный 🦥', 'Философ 🧘');
    }

    // 3. Почти все "за" (больше 95%)
    else if (forPct > 95) {
        nicknames.push('Соглашалка ✅', 'Позитивчик 👍', 'Оптимист 😊', 'Миротворец 🕊️', 'Конформист 😇', 'Да-Человек 🤗');
    }

    // 4. Много докладов (больше 5)
    if (reportsCount > 5) {
        nicknames.push('Говорун 🎤', 'Трудяга 💪', 'Активист 🚀', 'Работяга ⚡', 'Энерджайзер 🔋', 'Неугомонный 🏃');
    }

    // 5. В многих комитетах (больше 2)
    if (committeesCount > 2) {
        nicknames.push('Многостаночник 🎯', 'Везде сразу 🌟', 'Универсал 🦸', 'Многозадачник 🤹');
    }

    // 6. Высокий процент "за" но не экстремальный (80-95%)
    if (forPct >= 80 && forPct <= 95) {
        nicknames.push('Командный игрок 🤝', 'Надёжный 🛡️', 'Адекват 👌', 'Разумный 🧠');
    }

    // 7. Сбалансированное голосование (30-70% за)
    if (forPct >= 30 && forPct < 80 && abstainPct < 20) {
        nicknames.push('Взвешенный ⚖️', 'Рациональный 🧐', 'Объективный 🎭', 'Справедливый ⚔️');
    }

    // 8. Мало докладов (1-2)
    if (reportsCount <= 2) {
        nicknames.push('Новичок 🌱', 'Скромняга 😊', 'Тихоня 🤫', 'Наблюдатель 👀');
    }

    // Выбираем первое неиспользованное прозвище
    for (const nickname of nicknames) {
        if (!usedNicknames.includes(nickname)) {
            return nickname;
        }
    }

    // Если все прозвища заняты, берём первое из списка
    return nicknames[0] || 'Участник 👤';
}

// Таблица голосования участников
function renderMembersVotingTable() {
    const memberStats = {};

    // Собираем статистику по всем участникам
    committeesData.forEach(committee => {
        committee.members.forEach(member => {
            if (!memberStats[member.name]) {
                memberStats[member.name] = {
                    name: member.name,
                    committees: [],
                    totalReports: 0,
                    votesFor: 0,
                    votesAgainst: 0,
                    votesAbstain: 0
                };
            }

            // Добавляем комитет если ещё нет
            if (!memberStats[member.name].committees.includes(committee.name)) {
                memberStats[member.name].committees.push(committee.name);
            }
        });

        // Считаем голоса по докладам
        committee.decisions.forEach(decision => {
            if (memberStats[decision.speaker]) {
                memberStats[decision.speaker].totalReports++;
                memberStats[decision.speaker].votesFor += decision.votes_for;
                memberStats[decision.speaker].votesAgainst += decision.votes_against;
                memberStats[decision.speaker].votesAbstain += decision.votes_abstain;
            }
        });
    });

    const members = Object.values(memberStats).sort((a, b) => {
        // Сначала по количеству докладов, потом по имени
        if (b.totalReports !== a.totalReports) return b.totalReports - a.totalReports;
        return a.name.localeCompare(b.name);
    });

    // Добавляем прозвища
    members.forEach(member => {
        member.nickname = getNickname(member, members);
    });

    const container = document.getElementById('members-voting-table');

    container.innerHTML = `
        <table class="members-table">
            <thead>
                <tr>
                    <th>Участник</th>
                    <th>Прозвище</th>
                    <th>Комитеты</th>
                    <th class="num">Докладов</th>
                    <th class="num for">За</th>
                    <th class="num against">Против</th>
                    <th class="num abstain">Воздерж.</th>
                    <th class="bar-cell">Распределение</th>
                </tr>
            </thead>
            <tbody>
                ${members.map(member => {
                    const total = member.votesFor + member.votesAgainst + member.votesAbstain;
                    const forPct = total > 0 ? (member.votesFor / total * 100) : 0;
                    const againstPct = total > 0 ? (member.votesAgainst / total * 100) : 0;
                    const abstainPct = total > 0 ? (member.votesAbstain / total * 100) : 0;

                    return `
                        <tr>
                            <td><strong>${member.name}</strong></td>
                            <td><span style="font-size: 1.1em;">${member.nickname || '—'}</span></td>
                            <td>
                                ${member.committees.map(c =>
                                    `<span class="committee-badge">${c.replace('Комитет по ', '').replace('Комитет ', '').substring(0, 15)}...</span>`
                                ).join('')}
                            </td>
                            <td class="num">${member.totalReports}</td>
                            <td class="num for">${member.votesFor}</td>
                            <td class="num against">${member.votesAgainst}</td>
                            <td class="num abstain">${member.votesAbstain}</td>
                            <td class="bar-cell">
                                ${total > 0 ? `
                                    <div class="voting-bar">
                                        <div class="for-bar" style="width: ${forPct}%"></div>
                                        <div class="against-bar" style="width: ${againstPct}%"></div>
                                        <div class="abstain-bar" style="width: ${abstainPct}%"></div>
                                    </div>
                                ` : '<span style="color: #999">Нет данных</span>'}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
