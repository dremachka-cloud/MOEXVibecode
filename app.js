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

    // Рендерим календарь при переходе на страницу календаря
    if (pageName === 'calendar') {
        renderCalendar();
    }

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

    // Находим ближайшую дату заседания
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextMeetingDateStr = null;
    if (committee.meeting_dates && committee.meeting_dates.length > 0) {
        const futureDates = committee.meeting_dates
            .filter(dateStr => {
                const date = new Date(dateStr + 'T00:00:00');
                return date >= today;
            })
            .sort();

        if (futureDates.length > 0) {
            nextMeetingDateStr = futureDates[0];
        }
    }

    const container = document.getElementById('committee-detail');
    container.innerHTML = `
        <div class="committee-header">
            <h2>${committee.name}</h2>
            <p class="committee-desc">${committee.short_description}</p>
            <a href="${committee.url}" target="_blank" class="official-link">Зырь официальную страницу на MOEX →</a>

            <div class="committee-info">
                <div class="info-block">
                    <h4>Цели</h4>
                    <p>${committee.goals}</p>
                </div>
                <div class="info-block">
                    <h4>Задачи</h4>
                    <p>${committee.tasks}</p>
                </div>
                <div class="info-block">
                    <h4>Полномочия</h4>
                    <p>${committee.powers}</p>
                </div>
                ${nextMeetingDateStr ? `
                <div class="info-block">
                    <h4>Ближайшее заседание</h4>
                    <p style="font-size: 1.2em; color: var(--primary); font-weight: 600;">
                        📅 ${formatDate(nextMeetingDateStr)}
                    </p>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="decisions-section">
            <h3>Что они решили? (короче, главное)</h3>
            ${committee.decisions.map(decision => `
                <div class="decision-item">
                    <div class="decision-date">${formatDate(decision.date)}</div>
                    <div class="decision-title">${decision.title}</div>
                    <div class="decision-summary">${decision.summary}</div>
                    <div class="decision-votes">
                        <span>👍 За: ${decision.votes_for}</span>
                        <span>👎 Против: ${decision.votes_against}</span>
                        <span>🤷 Воздержался: ${decision.votes_abstain}</span>
                    </div>
                    <div class="decision-actions">
                        <span style="color: var(--text-gray)">Докладчик: ${decision.speaker}</span>
                        <a href="${decision.source_url}" target="_blank" class="official-link">📄 Смотреть на MOEX →</a>
                    </div>
                </div>
            `).join('')}
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

        <div class="nerd-section">
            <h3>📚 Чувак, если ты реальный зануда</h3>
            <p>Хочешь почитать все официальные правила и положения? Вот тебе ссылка на полный документ со всеми юридическими формулировками:</p>
            <a href="${committee.regulation_url || committee.url}" target="_blank" class="official-link">📋 Положение о комитете (для зануд) →</a>
        </div>
    `;

    showPage('committee');
}

// Календарь заседаний
function renderCalendar() {
    const container = document.getElementById('calendar-container');

    // Собираем все заседания в единый массив
    const allMeetings = [];
    committeesData.forEach(committee => {
        if (committee.meeting_dates && committee.meeting_dates.length > 0) {
            committee.meeting_dates.forEach(date => {
                allMeetings.push({
                    date: date,
                    committee: committee
                });
            });
        }
    });

    // Создаём карту заседаний по датам для быстрого доступа
    const meetingsByDate = {};
    allMeetings.forEach(meeting => {
        if (!meetingsByDate[meeting.date]) {
            meetingsByDate[meeting.date] = [];
        }
        meetingsByDate[meeting.date].push(meeting);
    });

    // Группируем по месяцам
    const monthGroups = {};
    allMeetings.forEach(meeting => {
        const date = new Date(meeting.date + 'T00:00:00');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                year: date.getFullYear(),
                month: date.getMonth()
            };
        }
    });

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    const weekDaysShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

    if (!container) {
        console.error('Calendar container not found');
        return;
    }

    // Рендерим календарь для каждого месяца
    const html = Object.keys(monthGroups).sort().map(monthKey => {
        const group = monthGroups[monthKey];
        const year = group.year;
        const month = group.month;

        // Получаем первый и последний день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Получаем день недели первого дня (0 = вс, 1 = пн, ..., 6 = сб)
        // Преобразуем к формату пн = 0, вт = 1, ..., пт = 4
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek === -1) firstDayOfWeek = 4; // Воскресенье => конец недели (после пятницы)
        if (firstDayOfWeek > 4) firstDayOfWeek = 0; // Суббота => начало следующей недели

        // Создаём массив дней
        const days = [];

        // Добавляем пустые ячейки для выравнивания
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ empty: true });
        }

        // Добавляем все дни месяца (только будние дни)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            // Пропускаем субботу (6) и воскресенье (0)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const meetings = meetingsByDate[dateStr] || [];
            days.push({
                day: day,
                dateStr: dateStr,
                meetings: meetings
            });
        }

        return `
            <div class="calendar-month">
                <h2 class="month-title">${monthNames[month]} ${year}</h2>
                <div class="calendar-grid">
                    ${weekDaysShort.map(day => `<div class="calendar-weekday-header">${day}</div>`).join('')}
                    ${days.map(dayData => {
                        if (dayData.empty) {
                            return `<div class="calendar-day calendar-day-empty"></div>`;
                        }

                        const hasMeetings = dayData.meetings.length > 0;

                        return `
                            <div class="calendar-day ${hasMeetings ? 'calendar-day-meeting' : ''}">
                                <div class="calendar-day-number">${dayData.day}</div>
                                ${hasMeetings ? `
                                    <div class="calendar-day-meetings">
                                        ${dayData.meetings.map(meeting => `
                                            <div class="calendar-meeting-badge" onclick="showCommittee('${meeting.committee.id}')">
                                                ${meeting.committee.name.replace('Комитет ', '')}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('ru', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Поиск
function populateFilters() {
    const committeeFilter = document.getElementById('filter-committee');
    committeesData.forEach(committee => {
        const option = document.createElement('option');
        option.value = committee.id;
        option.textContent = committee.name;
        committeeFilter.appendChild(option);
    });
}

function performSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const committeeFilter = document.getElementById('filter-committee').value;
    const yearFilter = document.getElementById('filter-year').value;

    if (!query.trim()) {
        document.getElementById('search-results').innerHTML = '<p class="no-results">Введи запрос для поиска</p>';
        return;
    }

    const results = [];

    committeesData.forEach(committee => {
        if (committeeFilter && committee.id !== committeeFilter) return;

        committee.decisions.forEach(decision => {
            if (yearFilter && !decision.date.startsWith(yearFilter)) return;

            const searchText = `${decision.title} ${decision.summary} ${decision.full_text}`.toLowerCase();
            if (searchText.includes(query)) {
                results.push({
                    committee: committee,
                    decision: decision
                });
            }
        });
    });

    const container = document.getElementById('search-results');

    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">Ничего не найдено. Попробуй другой запрос</p>';
        return;
    }

    container.innerHTML = `
        <h3>Найдено: ${results.length} ${getDecisionSuffix(results.length)}</h3>
        ${results.map(result => `
            <div class="decision-item" onclick="showCommittee('${result.committee.id}')">
                <div class="decision-date">${formatDate(result.decision.date)}</div>
                <div class="decision-title">${result.decision.title}</div>
                <div class="decision-summary">${result.decision.summary}</div>
                <div style="margin-top: 10px; color: var(--primary);">Комитет: ${result.committee.name}</div>
            </div>
        `).join('')}
    `;
}

function searchMembers() {
    const query = document.getElementById('member-search').value.toLowerCase();
    renderAllMembers(query);
}

// Аналитика
function renderAnalytics() {
    // Решения по комитетам
    const decisionsData = {
        labels: committeesData.map(c => c.name.replace('Комитет ', '')),
        datasets: [{
            label: 'Количество решений',
            data: committeesData.map(c => c.decisions.length),
            backgroundColor: 'rgba(87, 94, 207, 0.8)',
            borderColor: 'rgba(87, 94, 207, 1)',
            borderWidth: 1
        }]
    };

    new Chart(document.getElementById('chart-decisions'), {
        type: 'bar',
        data: decisionsData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                backgroundColor: [
                    'rgba(111, 184, 138, 0.8)',
                    'rgba(212, 122, 122, 0.8)',
                    'rgba(212, 165, 116, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });

    // Динамика по месяцам
    const monthlyData = {};
    committeesData.forEach(c => {
        c.decisions.forEach(d => {
            const month = d.date.substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    new Chart(document.getElementById('chart-timeline'), {
        type: 'line',
        data: {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                return `${month}.${year}`;
            }),
            datasets: [{
                label: 'Решений в месяц',
                data: sortedMonths.map(m => monthlyData[m]),
                borderColor: 'rgba(87, 94, 207, 1)',
                backgroundColor: 'rgba(87, 94, 207, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Голосование по докладчикам
    const speakerVotes = {};
    committeesData.forEach(c => {
        c.decisions.forEach(d => {
            if (!speakerVotes[d.speaker]) {
                speakerVotes[d.speaker] = { for: 0, against: 0, abstain: 0 };
            }
            speakerVotes[d.speaker].for += d.votes_for;
            speakerVotes[d.speaker].against += d.votes_against;
            speakerVotes[d.speaker].abstain += d.votes_abstain;
        });
    });

    const speakers = Object.keys(speakerVotes).sort((a, b) => {
        const totalA = speakerVotes[a].for + speakerVotes[a].against + speakerVotes[a].abstain;
        const totalB = speakerVotes[b].for + speakerVotes[b].against + speakerVotes[b].abstain;
        return totalB - totalA;
    }).slice(0, 10);

    new Chart(document.getElementById('chart-speakers'), {
        type: 'bar',
        data: {
            labels: speakers.map(s => s.split(' ').slice(0, 2).join(' ')),
            datasets: [
                {
                    label: 'За',
                    data: speakers.map(s => speakerVotes[s].for),
                    backgroundColor: 'rgba(111, 184, 138, 0.8)'
                },
                {
                    label: 'Против',
                    data: speakers.map(s => speakerVotes[s].against),
                    backgroundColor: 'rgba(212, 122, 122, 0.8)'
                },
                {
                    label: 'Воздержался',
                    data: speakers.map(s => speakerVotes[s].abstain),
                    backgroundColor: 'rgba(212, 165, 116, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });

    // Общая статистика
    const totalDecisions = committeesData.reduce((sum, c) => sum + c.decisions.length, 0);
    const unanimousDecisions = committeesData.reduce((sum, c) =>
        sum + c.decisions.filter(d => d.votes_against === 0 && d.votes_abstain === 0).length, 0
    );

    const allMembers = new Set();
    committeesData.forEach(c => {
        c.members.forEach(m => allMembers.add(m.name));
    });

    document.getElementById('stats-summary').innerHTML = `
        <h3>TL;DR Общая статистика</h3>
        <div class="stats-row">
            <div class="stat-item">
                <div class="stat-value">${committeesData.length}</div>
                <div class="stat-label">комитетов</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalDecisions}</div>
                <div class="stat-label">решений принято</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${allMembers.size}</div>
                <div class="stat-label">уникальных участников</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${Math.round(unanimousDecisions / totalDecisions * 100)}%</div>
                <div class="stat-label">голосов "за" (почти всегда согласны)</div>
            </div>
        </div>
    `;

    // Таблица участников с голосованием
    renderMembersVotingTable();
}

// Участники
function renderAllMembers(filterQuery = '') {
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
            const votesAbstain = memberDecisions.reduce((sum, d) => sum + d.votes_abstain, 0);

            membersMap[member.name].committees.push({
                id: committee.id,
                name: committee.name,
                position: member.position,
                company: member.company,
                reportsCount: memberDecisions.length,
                votesFor, votesAgainst, votesAbstain
            });
        });
    });

    const members = Object.values(membersMap).sort((a, b) =>
        b.committees.length - a.committees.length
    );

    // Фильтрация
    const filteredMembers = filterQuery
        ? members.filter(m => m.name.toLowerCase().includes(filterQuery))
        : members;

    const container = document.getElementById('members-list');
    container.innerHTML = filteredMembers.map(member => `
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
                            ${c.reportsCount > 0 ? `<span>👍 ${c.votesFor}</span><span>👎 ${c.votesAgainst}</span><span>🤷 ${c.votesAbstain}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Вспомогательные функции
function getCommitteeSuffix(count) {
    if (count === 1) return 'е';
    if (count >= 2 && count <= 4) return 'ах';
    return 'ах';
}

function getDecisionSuffix(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'решений';
    if (lastDigit === 1) return 'решение';
    if (lastDigit >= 2 && lastDigit <= 4) return 'решения';
    return 'решений';
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

    // Собираем все возможные прозвища и выбираем первое неиспользованное
    const usedNicknames = allMembers.map(m => m.nickname).filter(Boolean);
    const nicknames = [];

    // 1. Много комитетов (>=3)
    if (committeesCount >= 3) {
        nicknames.push('Многостаночник 🎪', 'Везде успевает ⚡', 'Универсал 🌟', 'Активист 🔥');
    }

    // 2. Много докладов (>=5)
    if (reportsCount >= 5) {
        nicknames.push('Говорун 🗣️', 'Оратор 🎤', 'Трибун 📢', 'Лидер мнений 👑');
    }

    // 3. Высокий процент "против" (>20%)
    if (againstPct > 20) {
        nicknames.push('Душнила 😤', 'Критик ⚠️', 'Скептик 🤨', 'Оппозиционер ✋');
    }

    // 4. Высокий процент воздержавшихся (>20%)
    if (abstainPct > 20) {
        nicknames.push('Боязливый 😰', 'Осторожный 🐌', 'Нерешительный 🤔', 'Сомневающийся 🧐');
    }

    // 5. Экстремально высокий процент "за" (>95%)
    if (forPct > 95) {
        nicknames.push('Соглашалка 👍', 'Позитивчик ✨', 'Оптимист 😊', 'Одобряющий 👌');
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
                                ${member.committees.map(c => `<span class="committee-badge">${c.replace('Комитет ', '').substring(0, 20)}</span>`).join(' ')}
                            </td>
                            <td class="num">${member.totalReports}</td>
                            <td class="num for">${member.votesFor}</td>
                            <td class="num against">${member.votesAgainst}</td>
                            <td class="num abstain">${member.votesAbstain}</td>
                            <td>
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
