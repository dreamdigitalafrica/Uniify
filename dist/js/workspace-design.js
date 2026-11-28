/* Authenticated workspace views and task controls. */
(() => {
  const view = document.querySelector('#view');
  const renderTemplate = html => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
  };
  const calendar = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const navigation = [
    ['overview', 'Home', 'grid-2'], ['roadmap', 'Roadmap', 'list-check'],
    ['releases', 'Releases', 'compact-disc'], ['career', 'Progress', 'chart-simple'],
    ['resources', 'Discover', 'compass']
  ];
  const iconNames = {'grid-2':'home', 'list-check':'roadmap', 'compact-disc':'releases', 'chart-simple':'progress', compass:'discover', user:'profile', pen:'edit'};
  const icon = name => window.uniifyIcon?.(iconNames[name] || name) || `<i class="fa-light fa-${name}" aria-hidden="true"></i>`;
  const nav = navigation.map(([route, label, glyph]) =>
    `<a href="#${route}" data-view="${route}" aria-label="${label}" title="${label}">${icon(glyph)}<span>${label}</span></a>`
  ).join('');
  document.querySelector('.app-sidebar nav').innerHTML = nav +
    `<a href="#profile" data-view="profile" aria-label="Artist profile" title="Artist profile">${icon('profile')}<span>Artist profile</span></a>`;
  document.querySelector('.app-layout').insertAdjacentHTML('afterend',
    `<nav class="studio-bottom-nav bottom-nav" aria-label="Workspace navigation">${nav}</nav>`);
  const mobileBrand = document.querySelector('.app-sidebar .uniify-brand').cloneNode(true);
  mobileBrand.className = 'mobile-brand';
  mobileBrand.querySelector('.sidebar-symbol')?.remove();
  document.querySelector('.top-actions').before(mobileBrand);
  document.querySelector('.app-topbar .top-actions').insertAdjacentHTML('afterbegin',
    `<span class="today">${esc(new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}))}</span>`);
  const sidebarBottom = document.querySelector('.sidebar-bottom');
  sidebarBottom.insertAdjacentHTML('afterbegin', '<a href="#profile" class="profile-button"><span class="avatar"></span><span><strong></strong><small></small></span></a>');
  const sidebarProfile = sidebarBottom.querySelector('.profile-button');
  const menu = document.querySelector('#menu-toggle');
  menu.classList.add('sidebar-toggle', 'icon-button');
  function syncSidebar() {
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    menu.innerHTML = icon(collapsed ? 'panel-open' : 'panel');
    menu.setAttribute('aria-expanded', String(!collapsed));
  }
  menu.addEventListener('click', syncSidebar);
  document.querySelector('.sidebar-symbol')?.setAttribute('src', '/dashboard-preview/assets/favicon.png');
  document.querySelector('#close-dialog').innerHTML = icon('back');

  names.overview = 'Home';
  names.resources = 'Discover';

  const coverButton = '<button type="button" class="cover-change" data-edit-cover>' +
    icon('camera') + '<span>Edit cover</span></button>';
  const isReady = task => !['Done', 'Deferred'].includes(task.status) && !E.blocked(state, task) && !task.blocker;
  const readyTasks = () => activeTasks().filter(isReady)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0) || (a.order || 0) - (b.order || 0));

  let selectedDay = today();
  function week() {
    const start = new Date(today() + 'T12:00:00');
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      return { day, key };
    });
    const keys = new Set(dates.map(entry => entry.key));
    const scheduled = readyTasks().filter(task => keys.has(task.due));
    const selected = keys.has(selectedDay) ? selectedDay : today();
    const dayTasks = scheduled.filter(task => task.due === selected);
    return { scheduled: dayTasks, html: `<section class="context-card week-card">
      <div class="section-heading"><h2>Your week</h2><span>${start.toLocaleDateString(undefined,{month:'long'})}</span></div>
      <div class="week">${dates.map(({ day, key }) => {
        const count = scheduled.filter(task => task.due === key).length;
        return `<button type="button" data-studio-day="${key}" class="${key === selected ? 'selected' : ''}"
          aria-pressed="${key === selected}" aria-label="${esc(calendar.format(day))}, ${count} scheduled">
          <small>${esc(day.toLocaleDateString(undefined, { weekday: 'narrow' }))}</small>${day.getDate()}</button>`;
      }).join('')}</div><div class="calendar-caption"><span class="session-dot"></span><p>${dayTasks.length ? esc(dayTasks[0].title) + (dayTasks.length > 1 ? ' · +' + (dayTasks.length - 1) + ' more' : '') : 'No ready actions scheduled for this day'}</p></div>
    </section>` };
  }

  let homeTab = 'overview';
  let profileTab = 'about';
  function tabs(group, options, selected) {
    return `<div class="workspace-tabs ${group === 'profile' ? 'profile-tabs' : ''}" role="tablist" aria-label="${group === 'home' ? 'Home' : 'Artist profile'}">${options.map(([key, label]) =>
      `<button type="button" id="studio-${group}-${key}" role="tab" class="${key === selected ? 'selected' : ''}" data-studio-tab="${key}" data-studio-group="${group}" aria-controls="studio-${group}-panel-${key}" aria-selected="${key === selected}" tabindex="${key === selected ? 0 : -1}">${label}</button>`
    ).join('')}</div>`;
  }
  function tabPanel(group, key, html, selected) {
    return `<section role="tabpanel" id="studio-${group}-panel-${key}" aria-labelledby="studio-${group}-${key}" ${key === selected ? '' : 'hidden'}>${html}</section>`;
  }

  const initials = artist => String(artist || 'U').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const currentRelease = () => state.releases.filter(item => !['Released', 'Archived'].includes(item.status))
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))[0];

  function actionMeta(task) {
    return `<div class="metadata"><span>${icon('clock')}${esc(task.effort || task.minutes || 30)} min</span>
      ${task.due ? `<span>${icon('calendar')}${esc(date(task.due))}</span>` : ''}</div>`;
  }

  function taskCards(tasks) {
    return `<div class="priorities">${tasks.length ? tasks.map((task, index) => `<article class="priority">
      <span class="number">${String(index + 1).padStart(2, '0')}</span>
      <span class="priority-symbol">${icon(task.releaseId ? 'music' : 'profile')}</span>
      <button type="button" class="priority-main" data-task="${esc(task.id)}"><h3>${esc(task.title)}</h3>
      ${task.reason ? `<p>${esc(task.reason)}</p>` : ''}${actionMeta(task)}</button>
      <button type="button" class="task-open" data-task="${esc(task.id)}" aria-label="Open ${esc(task.title)}">${icon('chevron')}</button>
    </article>`).join('') : '<div class="resource"><h3>No actions ready yet</h3><p>Open your roadmap or complete your career assessment.</p></div>'}</div>`;
  }

  function releaseSpotlight(release) {
    const artist = state.profile.artist;
    const dateLabel = release?.date
      ? new Intl.DateTimeFormat(undefined, {day:'numeric', month:'short'}).format(new Date(release.date+'T12:00:00'))
      : '';
    return `<section class="release-spotlight">
      <div class="spotlight-copy"><span class="eyebrow">${release ? 'YOUR NEXT RELEASE' : 'RELEASE PLANNING'}</span>
        <h2>${esc(release?.title || 'Plan your next release')}<span class="release-dot">.</span></h2>
        ${release ? `<p>${esc(release.type)} · ${esc(release.status)}</p>` : ''}
        <button type="button" class="spotlight-link" ${release ? `data-project="${esc(release.id)}"` : 'data-action="add-release"'}>${release ? 'Open release plan' : 'Create a release'} ${icon('plus')}</button>
        <div class="spotlight-footer"><span class="spotlight-avatar">${state.profile.photo ? `<img src="${esc(state.profile.photo)}" alt="">` : esc(initials(artist))}</span>
          <span>${esc(artist || 'Your workspace')}<small>${esc(state.profile.role || 'Independent artist')}</small></span>
          ${dateLabel ? `<span class="spotlight-date">${esc(dateLabel)}<br><small>TARGET RELEASE</small></span>` : ''}
        </div>
      </div><div class="record-art" aria-hidden="true"><div class="record-label">
        <span>${esc(artist || 'UNIIFY')}</span><strong>${esc(release?.title || 'On the record')}</strong><span>${esc(release?.type || 'UNIIFY FOR ARTISTS')}</span>
      </div></div>
    </section>`;
  }

  overview = function () {
    const artist = String(state.profile.artist || '').trim();
    const release = currentRelease();
    const priorities = readyTasks().slice(0, 3);
    const schedule = week();
    const previousCheckin = state.checkins?.at(-1);
    const counts = progress();
    const percent = counts.total ? Math.round(counts.done / counts.total * 100) : 0;
    const activities = state.activity.slice(0, 12);
    const panels = {
      overview: `<div class="dashboard"><div class="main-column">
        ${releaseSpotlight(release)}
        <section class="priorities-section"><div class="section-heading"><div><h2>Your next moves</h2>
          <p>${release ? 'Priorities for '+esc(release.title)+'.' : 'Actions ready to work on.'}</p></div><a href="#roadmap" class="text-button">All actions</a></div>${taskCards(priorities)}</section>
        ${priorities[0]?.reason ? `<section class="manager-note"><span class="note-icon">${icon('music')}</span><div><span class="eyebrow">A NOTE FOR YOU</span><p>${esc(priorities[0].reason)}</p></div></section>` : ''}
      </div><aside class="context-column">
        <section class="milestone compact-milestone"><div class="section-heading"><h2>Your roadmap</h2><span class="phase-indicator">${counts.total && percent === 100 ? 'COMPLETE' : 'IN PROGRESS'}</span></div>
          <div class="progress-dial"><svg viewBox="0 0 144 144" role="img" aria-label="${percent}% complete"><circle class="dial-track" cx="72" cy="72" r="59"/><circle class="dial-fill" cx="72" cy="72" r="59" stroke-dasharray="${percent*3.707} 370.7"/></svg><span>${percent}<small>%</small></span></div>
          <h3>Making progress</h3><p>${counts.done} of ${counts.total} actions complete</p><a href="#career" class="text-button">See your progress</a>
        </section>${schedule.html}
        <section class="checkin mini-checkin"><div class="checkin-head"><h3>Weekly check-in</h3>${icon('calendar')}</div>
          <p>${previousCheckin ? 'Last reviewed ' + esc(date(previousCheckin.date)) : 'What moved forward this week?'}</p>
          <button type="button" class="text-button" data-manager-checkin>Review your week</button>
        </section>
      </aside></div>`,
      week: `<div class="week-focus"><div class="section-heading"><h2>Your week, in focus</h2><span>${esc(state.profile.hours || '')}</span></div>
        ${schedule.html}${taskCards(schedule.scheduled)}<button type="button" class="secondary" data-manager-checkin>Review your week</button></div>`,
      activity: `<section class="activity-feed"><div class="section-heading"><h2>Recent activity</h2></div>
        ${activities.map(item => `<article class="activity-item"><span class="activity-icon">${icon('clock')}</span>
          <div><h3>${esc(item.text)}</h3></div><small>${esc(new Date(item.time).toLocaleDateString())}</small></article>`).join('') || '<p>Your workspace activity will appear here.</p>'}</section>`
    };
    return `<div class="greeting"><div><span class="welcome-date">${esc(calendar.format(new Date()).toUpperCase())}</span>
      <h1>${artist ? 'Welcome back, ' + esc(artist.split(/\s+/)[0]) : 'Your workspace'}.</h1>
      <p>${release ? esc(release.title) + ' · ' + esc(release.status) : 'Plan your releases and see what’s next.'}</p></div>
      <button type="button" class="secondary" data-manager-checkin>${icon('calendar')}Weekly check-in</button></div>
      ${tabs('home', [['overview', 'Overview'], ['week', 'This week'], ['activity', 'Activity']], homeTab)}
      <div id="home-content">${Object.entries(panels).map(([key, html]) => tabPanel('home', key, html, homeTab)).join('')}</div>`;
  };

  const existingProfile = profile;
  profile = function () {
    const content = renderTemplate(existingProfile());
    const photo = content.querySelector('.photo-editor');
    photo.classList.add('profile-portrait');
    photo.querySelector('.profile-avatar').classList.add('portrait-image');
    const photoEdit = photo.querySelector('.photo-edit');
    photoEdit.classList.add('portrait-edit');
    photoEdit.innerHTML = icon('camera');
    photo.querySelector('.photo-options').classList.add('image-menu');
    const form = content.querySelector('#profile-form');
    const links = content.querySelector('.artist-links');
    form.querySelector('.fields').insertAdjacentHTML('beforeend',
      `<label class="field full"><span>Biography</span><textarea name="bio" maxlength="1500">${esc(state.profile.bio)}</textarea></label>`);
    const p = state.profile;
    const linksPreview = (Array.isArray(p.links) ? p.links : []).filter(item => /^https?:\/\//i.test(item.url));
    const release = currentRelease();
    const about = `<div class="profile-grid">
      <section class="bio-section"><span class="eyebrow">THE ARTIST</span><h2>A little about ${esc((p.artist || 'you').split(/\s+/)[0])}.</h2>
        <p class="artist-bio">${esc(p.bio || 'Add a biography to introduce yourself and your music.')}</p>
        <div class="artist-details"><div><span>Role</span><strong>${esc(p.role || 'Not added')}</strong></div>
          <div><span>Career stage</span><strong>${esc(p.stage || 'Not added')}</strong></div>
          <div><span>Current focus</span><strong>${esc(p.goal || 'Set your goal')}</strong></div></div>
      </section>
      <aside class="profile-side">${release ? `<div class="profile-mini-release"><span class="eyebrow">IN THE WORKS</span>
        <div class="mini-release-art"><img src="/dashboard-preview/assets/cover.jpg" alt=""></div>
        <h3>${esc(release.title)}</h3><p>${esc(release.type)} · ${esc(release.status)}</p>
        <button type="button" class="text-button" data-project="${esc(release.id)}">View release plan</button></div>` : ''}
        <div class="profile-links-summary"><div class="section-heading"><h3>Find me online</h3>
          <button type="button" class="text-button" data-studio-show-links>Edit links</button></div>
        ${linksPreview.length ? linksPreview.slice(0,3).map(item => `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${icon('link')}<span>${esc(item.label)}</span></a>`).join('') : '<p>Add your social and streaming links.</p>'}</div>
      </aside>
    </div><div id="studio-profile-form" hidden>${form.outerHTML}</div>`;
    return `<section class="profile-page">
      <div class="profile-cover">${p.cover ? `<img src="${esc(p.cover)}" alt="Artist cover">` : '<img src="/dashboard-preview/assets/artist-cover.jpg" alt="">'}${coverButton}</div>
      <div class="profile-heading">${photo.outerHTML}<div class="profile-title"><h1>${esc(p.artist || 'Artist profile')}<span class="release-dot">.</span></h1>
        ${p.role ? `<p>${esc(p.role)}</p>` : ''}</div>
        <button type="button" class="secondary" data-studio-profile-edit aria-controls="studio-profile-form" aria-expanded="false">${icon('edit')}Edit profile</button></div>
      ${tabs('profile', [['about', 'About'], ['links', 'Links'], ['career', 'Career']], profileTab)}
      ${tabPanel('profile', 'about', about, profileTab)}
      ${tabPanel('profile', 'links', links.outerHTML, profileTab)}
      ${tabPanel('profile', 'career', `<div class="studio-panel"><h2>Career foundations</h2>
        ${p.stage ? `<p>${esc(p.stage)}</p>` : ''}${p.goal ? `<p>${esc(p.goal)}</p>` : ''}
        <a href="#assessment">Review your assessment</a></div>`, profileTab)}
    </section>`;
  };

  function selectTab(button) {
    const { studioGroup: group, studioTab: key } = button.dataset;
    if (group === 'home') homeTab = key;
    else profileTab = key;
    for (const tab of button.parentElement.querySelectorAll('[role=tab]')) {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.classList.toggle('selected', active);
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
    button.focus();
  }
  view.addEventListener('click', event => {
    const button = event.target.closest('[data-studio-tab]');
    if (button) selectTab(button);
    const day = event.target.closest('[data-studio-day]');
    if (day) {
      selectedDay = day.dataset.studioDay;
      render();
      view.querySelector(`[role=tabpanel]:not([hidden]) [data-studio-day="${selectedDay}"]`)?.focus({preventScroll:true});
    }
    if (event.target.closest('[data-studio-show-links]')) selectTab(view.querySelector('#studio-profile-links'));
    const edit = event.target.closest('[data-studio-profile-edit]');
    if (edit) {
      selectTab(view.querySelector('#studio-profile-about'));
      const form = view.querySelector('#studio-profile-form');
      form.hidden = !form.hidden;
      edit.setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) form.querySelector('input')?.focus();
      else edit.focus();
    }
  });
  view.addEventListener('keydown', event => {
    const button = event.target.closest('[data-studio-tab]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = [...button.parentElement.querySelectorAll('[role=tab]')];
    const offset = event.key === 'ArrowLeft' ? -1 : 1;
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : (items.indexOf(button) + offset + items.length) % items.length;
    selectTab(items[index]);
  });

  const listOrBoard = taskResults;
  taskResults = function () {
    if (taskLayout === 'board') {
      const board = renderTemplate(listOrBoard()).firstElementChild;
      for (const select of board.querySelectorAll('[data-board-status]')) {
        const task = activeTasks().find(item => item.id === select.dataset.boardStatus);
        if (!task || task.status === 'Done') continue;
        const waiting = E.blocked(state, task);
        if (waiting || task.blocker) [...select.options].find(option => option.value === 'Done').disabled = true;
        if (task.blocker) select.closest('.board-task').insertAdjacentHTML('afterbegin', '<span class="tag">Blocked</span>');
      }
      return board.outerHTML;
    }
    const matches = activeTasks().filter(task => {
      const project = releaseFilter === 'all' ||
        (releaseFilter === 'general' ? !task.releaseId : task.releaseId === releaseFilter);
      return project && (taskFilter === 'All' || task.status === taskFilter) &&
        task.title.toLowerCase().includes(query.toLowerCase());
    });
    if (!matches.length) return listOrBoard();
    const sections = [
      ['Career foundations', matches.filter(task => !task.phase)],
      ...E.phases.map(([phase, label]) => [label, matches.filter(task => task.phase === phase)]),
      ['Other actions', matches.filter(task => task.phase && !E.phases.some(([phase]) => task.phase === phase))]
    ];
    return sections.filter(([, items]) => items.length).map(([label, items], index) =>
      `<section class="phase studio-roadmap-phase"><div class="phase-head"><span class="phase-dot">${index + 1}</span>
      <h2>${label}</h2><small>${items.length} ${items.length === 1 ? 'action' : 'actions'}</small></div>
      ${items.map(taskRow).join('')}</section>`
    ).join('');
  };

  taskRow = function (task) {
    const done = task.status === 'Done';
    const waiting = !done && (task.blocker || E.blocked(state, task));
    const status = done ? 'Done' : task.blocker ? 'Blocked' : waiting ? 'Upcoming'
      : task.status === 'To do' ? 'Ready' : task.status;
    return `<article class="roadmap-task ${done ? 'done' : ''} ${waiting ? 'locked' : ''}">
      <input class="status-circle" type="checkbox" data-complete="${esc(task.id)}" aria-label="Complete ${esc(task.title)}" ${done ? 'checked' : ''} ${waiting ? 'disabled' : ''}>
      <button type="button" class="priority-main" data-task="${esc(task.id)}"><h3>${esc(task.title)}</h3>
      ${task.reason ? `<p>${esc(task.reason)}</p>` : ''}${actionMeta(task)}</button>
      <span class="chip">${esc(status)}</span></article>`;
  };

  const standardTaskEditor = taskDialog;
  taskDialog = function (id) {
    const task = activeTasks().find(item => item.id === id);
    if (!task) return standardTaskEditor(id);
    const waiting = E.blocked(state, task);
    const prerequisites = (task.dependencies || []).map(key => state.tasks.find(item => item.id === key))
      .filter(item => item && item.status !== 'Done');
    const follows = activeTasks().filter(item => item.dependencies?.includes(task.id) && item.status !== 'Done');
    const completed = task.status === 'Done';
    openDialog('Your next action', `<article class="studio-action-detail">
      <small>${esc(task.domain || 'Roadmap')}</small><h3>${esc(task.title)}</h3>
      <p class="studio-action-meta">${icon('clock')} ${esc(task.effort || task.minutes || 30)} min${task.due ? ' · ' + esc(date(task.due)) : ''}</p>
      ${task.reason ? `<section class="reason"><h4>Why this matters</h4><p>${esc(task.reason)}</p></section>` : ''}
      ${task.steps ? `<section><h4>What to do</h4><p>${esc(task.steps)}</p></section>` : ''}
      ${task.notes ? `<section><h4>Your notes</h4><p>${esc(task.notes)}</p></section>` : ''}
      ${prerequisites.length ? `<section class="studio-panel"><h4>Waiting on</h4><p>${prerequisites.map(item => esc(item.title)).join(' · ')}</p></section>` : ''}
      ${task.blocker ? `<section class="studio-panel"><h4>Blocker</h4><p>${esc(task.blocker)}</p></section>` : ''}
      ${follows.length ? `<section class="unlock"><div><h4>What comes next</h4><p>${follows.map(item => esc(item.title)).join(' · ')}</p></div></section>` : ''}
      <div class="dialog-actions studio-action-controls">
        <button type="button" class="primary studio-action-primary" data-studio-status="${completed ? 'To do' : 'Done'}" data-studio-task="${esc(task.id)}"
          ${!completed && (waiting || task.blocker) ? 'disabled' : ''}>${completed ? 'Reopen action' : 'Mark as complete'}</button>
        <div>
          ${!completed ? `<button type="button" class="text-button" data-studio-status="${task.status === 'Deferred' ? 'To do' : 'Deferred'}" data-studio-task="${esc(task.id)}">${task.status === 'Deferred' ? 'Bring back' : 'Do this later'}</button>
          <button type="button" class="text-button" data-studio-blocker="${esc(task.id)}">${task.blocker ? 'Update blocker' : 'I’m blocked'}</button>` : ''}
          <button type="button" class="text-button" data-studio-edit-task="${esc(task.id)}">Edit</button>
        </div>
      </div>
    </article>`);
  };

  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.studioEditTask) {
      closeDialog();
      standardTaskEditor(button.dataset.studioEditTask);
      return;
    }
    if (button.dataset.studioBlocker) {
      const task = activeTasks().find(item => item.id === button.dataset.studioBlocker);
      if (!task) return;
      closeDialog();
      openDialog('What’s blocking this action?', `<form id="studio-blocker-form" data-id="${esc(task.id)}">
        <label class="field"><span>Blocker</span><textarea name="blocker" maxlength="1000">${esc(task.blocker)}</textarea></label>
        <p>Clear this field when the action is ready to resume.</p>
        <button class="primary studio-action-primary" type="submit">Save blocker</button></form>`);
      return;
    }
    if (!button.dataset.studioTask) return;
    const task = activeTasks().find(item => item.id === button.dataset.studioTask);
    const status = button.dataset.studioStatus;
    if (!task || !['Done', 'To do', 'Deferred'].includes(status)) return;
    if (status === 'Done' && (task.blocker || E.blocked(state, task))) return;
    const waitingBefore = new Set(activeTasks().filter(item => E.blocked(state, item)).map(item => item.id));
    transition(task, status);
    adapt('Action status changed. Related steps and suggested dates were reviewed.');
    const next = readyTasks().find(item => waitingBefore.has(item.id));
    save(next ? 'Action complete. Now ready: ' + next.title : 'Roadmap updated.');
    closeDialog();
    render();
    const replacement = [...view.querySelectorAll('[data-task]')].find(item => item.dataset.task === task.id);
    (replacement || view).focus({preventScroll:true});
  });

  dialog.addEventListener('submit', event => {
    if (event.target.id !== 'studio-blocker-form') return;
    event.preventDefault();
    const task = activeTasks().find(item => item.id === event.target.dataset.id);
    if (!task) return;
    const blocker = String(new FormData(event.target).get('blocker') || '').trim().slice(0, 1000);
    task.blocker = blocker;
    record('task_blocker_updated', task.id, (blocker ? 'Blocker noted: ' : 'Blocker cleared: ') + task.title);
    save(blocker ? 'Blocker saved.' : 'Blocker cleared.');
    closeDialog();
    render();
  });

  const existingReleases = releases;
  releases = function () {
    const featured = currentRelease();
    if (!featured) return existingReleases();
    const content = renderTemplate(existingReleases());
    const grid = content.querySelector('.release-grid');
    for (const card of grid.querySelectorAll('.release-card')) {
      const releaseId = card.querySelector('[data-release]').dataset.release;
      if (releaseId === featured.id) card.remove();
      else card.querySelector('.release-art img').src = '/dashboard-preview/assets/cover.jpg';
    }
    const tasks = activeTasks().filter(task => task.releaseId === featured.id);
    const completed = tasks.filter(task => task.status === 'Done').length;
    const percent = tasks.length ? Math.round(completed * 100 / tasks.length) : 0;
    const expenses = state.entries.filter(entry => entry.type === 'Expense')
      .reduce((total, entry) => total + Number(entry.amount || 0), 0);
    return header('Releases', '', btn('New release', 'add-release')) + `<div class="dashboard studio-release-dashboard">
      <div class="main-column"><section class="milestone"><div class="milestone-top">
        <span class="eyebrow">${esc(featured.type)}</span>${icon('releases')}</div>
        <h2>${esc(featured.title)}</h2><p>${esc(date(featured.date))} · ${esc(featured.status)}</p>
        <div class="milestone-count"><span>${completed} of ${tasks.length} actions complete</span><strong>${percent}%</strong></div>
        <div class="bar" role="progressbar" aria-label="Release progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>
        <div class="studio-release-actions"><button class="secondary" type="button" data-release="${esc(featured.id)}">Manage release</button>
          <button class="text-button" type="button" data-project="${esc(featured.id)}">Open this roadmap</button></div>
        </section>${tasks.length ? `<section><div class="section-heading"><h2>Release actions</h2></div>${tasks.slice(0,3).map(taskRow).join('')}</section>` : ''}</div>
      <aside class="context-column"><section class="context-card"><div class="section-heading"><h2>Keep the budget in view</h2>${icon('wallet')}</div>
        <div class="studio-release-budget"><div><h3>${money(featured.budget)}</h3><small>Release budget</small></div>
        <div><h3>${money(expenses)}</h3><small>Workspace spend</small></div></div>
        <a class="text-button" href="#budget">View budget &amp; income</a></section></aside>
      </div>${grid.children.length ? `<section class="studio-more-releases"><h2>Other releases</h2>${grid.outerHTML}</section>` : ''}`;
  };

  const existingSettings = settings;
  settings = function () {
    return existingSettings().replace(' The save status is shown in the header.', '');
  };

  guides = function () {
    return '<div class="view-head"><h1>Discover</h1><p>Practical guides for your music career.</p></div>' +
      resources.map(resource => `<article class="resource">
        <div class="section-heading"><span class="eyebrow">${esc(resource.label.split(' · ')[0])}</span>${icon('discover')}</div>
        <h2>${esc(resource.title)}</h2><a class="text-button" href="${resource.url}">Read guide</a>
      </article>`).join('');
  };

  const account = document.querySelector('#account-links');
  if (!account.querySelector('[href="#budget"]')) {
    account.querySelector('[href="#settings"]').insertAdjacentHTML('beforebegin', '<a href="#budget">Budget &amp; income</a>');
  }
  const previousRender = render;
  render = function () {
    previousRender();
    view.dataset.studioView = current();
    for (const stat of view.querySelectorAll('.stats-row .stat-box')) stat.classList.add('stat');
    view.querySelector('.stats-row')?.classList.add('stats');
    view.querySelector('.page-heading')?.classList.add('view-head');
    const avatar = document.querySelector('#account-toggle');
    const artist = state.profile.artist;
    const identity = state.profile.photo ? `<img src="${esc(state.profile.photo)}" alt="">` : esc(initials(artist));
    avatar.innerHTML = identity;
    sidebarProfile.querySelector('.avatar').innerHTML = identity;
    sidebarProfile.querySelector('strong').textContent = artist || 'Artist profile';
    sidebarProfile.querySelector('small').textContent = state.profile.role || 'Independent artist';
    syncSidebar();
  };
  document.querySelector('#menu-toggle').setAttribute('aria-controls', 'sidebar');
  if (!window.uniifyWorkspaceBooting) render();
})();
