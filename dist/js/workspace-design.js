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
  const icon = name => `<i class="fa-light fa-${name}" aria-hidden="true"></i>`;
  const nav = navigation.map(([route, label, glyph]) =>
    `<a href="#${route}" data-view="${route}" aria-label="${label}" title="${label}">${icon(glyph)}<span>${label}</span></a>`
  ).join('');
  document.querySelector('.app-sidebar nav').innerHTML = nav +
    '<a href="#profile" data-view="profile" aria-label="Artist profile" title="Artist profile"><i class="fa-light fa-user" aria-hidden="true"></i><span>Artist profile</span></a>';
  document.querySelector('.app-layout').insertAdjacentHTML('afterend',
    `<nav class="studio-bottom-nav" aria-label="Workspace navigation">${nav}</nav>`);
  const mobileBrand = document.querySelector('.app-sidebar .uniify-brand').cloneNode(true);
  mobileBrand.className = 'studio-mobile-brand';
  mobileBrand.querySelector('.sidebar-symbol')?.remove();
  document.querySelector('.top-actions').before(mobileBrand);
  names.overview = 'Home';
  names.resources = 'Discover';

  const coverButton = '<button type="button" class="studio-cover-edit" data-edit-cover>' +
    icon('camera') + '<span>Edit cover</span></button>';
  const releaseAction = release => release
    ? `<button type="button" class="studio-pill" data-project="${esc(release.id)}">Open release plan</button>`
    : '<button type="button" class="studio-pill" data-action="add-release">Create a release</button>';
  const isReady = task => !['Done', 'Deferred'].includes(task.status) && !E.blocked(state, task) && !task.blocker;
  const readyTasks = () => activeTasks().filter(isReady)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0) || (a.order || 0) - (b.order || 0));
  const taskCards = tasks => tasks.length ? `<div class="studio-tasks">${tasks.map(task => `
    <article class="manager-action studio-task">
      <span class="studio-task-icon">${icon(task.releaseId ? 'music' : 'list-check')}</span>
      <div><h3><button type="button" data-task="${esc(task.id)}">${esc(task.title)}</button></h3>
        ${task.reason ? `<p>${esc(task.reason)}</p>` : ''}
        <small>${icon('clock')} ${esc(task.effort || task.minutes || 30)} min
          ${task.due ? ' · ' + esc(date(task.due)) : ''}</small>
      </div>
    </article>`).join('')}</div>` : '<p class="studio-empty">No ready tasks here. Review your roadmap or complete your assessment.</p>';

  let selectedDay = today();
  function week(filterDay = false) {
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
    return { scheduled: filterDay ? dayTasks : scheduled, html: `<section class="studio-panel">
      <div class="studio-section-head"><h2>Your week</h2>${icon('calendar')}</div>
      <div class="studio-week">${dates.map(({ day, key }) => {
        const count = scheduled.filter(task => task.due === key).length;
        return `<button type="button" data-studio-day="${key}" class="${key === selected ? 'is-today' : ''}"
          aria-pressed="${key === selected}" aria-label="${esc(calendar.format(day))}, ${count} scheduled">
          <small>${esc(day.toLocaleDateString(undefined, { weekday: 'short' }))}</small><b>${day.getDate()}</b>${count ? '<i></i>' : ''}</button>`;
      }).join('')}</div><p>${dayTasks.length ? esc(dayTasks[0].title) + (dayTasks.length > 1 ? ' · +' + (dayTasks.length - 1) + ' more' : '') : 'No ready actions scheduled for this day'}</p>
    </section>` };
  }

  let homeTab = 'overview';
  let profileTab = 'about';
  function tabs(group, options, selected) {
    return `<div class="studio-tabs" role="tablist" aria-label="${group === 'home' ? 'Home' : 'Artist profile'}">${options.map(([key, label]) =>
      `<button type="button" id="studio-${group}-${key}" role="tab" data-studio-tab="${key}" data-studio-group="${group}" aria-controls="studio-${group}-panel-${key}" aria-selected="${key === selected}" tabindex="${key === selected ? 0 : -1}">${label}</button>`
    ).join('')}</div>`;
  }
  function tabPanel(group, key, html, selected) {
    return `<section role="tabpanel" id="studio-${group}-panel-${key}" aria-labelledby="studio-${group}-${key}" ${key === selected ? '' : 'hidden'}>${html}</section>`;
  }

  overview = function () {
    const artist = String(state.profile.artist || '').trim();
    const release = state.releases.filter(item => !['Released', 'Archived'].includes(item.status))
      .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))[0];
    const priorities = readyTasks().slice(0, 3);
    const schedule = week();
    const selectedSchedule = week(true);
    const previousCheckin = state.checkins?.at(-1);
    const counts = progress();
    const percent = counts.total ? Math.round(counts.done / counts.total * 100) : 0;
    const activities = state.activity.slice(0, 12);
    const panels = {
      overview: `<div class="studio-grid"><div class="studio-primary">
        <section class="studio-spotlight">
          <div class="studio-record" aria-hidden="true"><span>${release ? `<b>${esc(release.type)}</b>` : ''}</span></div>
          <div class="studio-spotlight-copy"><small>${release ? 'YOUR NEXT RELEASE' : 'RELEASE PLANNING'}</small>
            <h2>${esc(release?.title || 'Plan your next release')}</h2>
            ${release ? `<p>${esc(release.type)} · ${esc(release.status)}</p>` : ''}
            ${releaseAction(release)}
            ${release ? `<div class="studio-release-credit">
              ${state.profile.photo ? `<img src="${esc(state.profile.photo)}" alt="">` : icon('compact-disc')}
              <b>${esc(artist || 'Your release')}</b>${release.date ? `<span><small>RELEASE TARGET</small>${esc(date(release.date))}</span>` : ''}
            </div>` : ''}
          </div>
        </section>
        <section><div class="studio-section-head"><h2>Your next moves</h2><a href="#roadmap">All actions</a></div>${taskCards(priorities)}</section>
        ${priorities[0]?.reason ? `<aside class="studio-note">${icon('music')}<div><h2>Manager’s insight</h2><p>${esc(priorities[0].reason)}</p></div></aside>` : ''}
      </div><aside class="studio-context">
        <section class="studio-panel studio-progress"><h2>Roadmap progress</h2>
          <div class="studio-dial" style="--completion:${percent}%"><strong>${percent}%</strong></div>
          <p>${counts.done} of ${counts.total} actions complete</p><a href="#career">See your progress</a>
        </section>${schedule.html}
        <section class="studio-checkin-card"><h2>Weekly check-in</h2>
          <p>${previousCheckin ? 'Last reviewed ' + esc(date(previousCheckin.date)) : 'Review your progress and the time you have available.'}</p>
          <button type="button" class="studio-inline-button" data-manager-checkin>Review your week</button>
        </section>
      </aside></div>`,
      week: `<div class="studio-primary">${selectedSchedule.html}${taskCards(selectedSchedule.scheduled)}</div>`,
      activity: activities.length ? `<div class="studio-tasks">${activities.map(item => `
        <article class="studio-task"><span class="studio-task-icon">${icon('clock-rotate-left')}</span>
        <div><h3>${esc(item.text)}</h3><small>${esc(new Date(item.time).toLocaleDateString())}</small></div></article>`).join('')}</div>`
        : '<p class="studio-empty">Your workspace activity will appear here.</p>'
    };
    return `<div class="studio-heading"><div><small>${esc(calendar.format(new Date()))}</small>
      <h1>${artist ? 'Welcome back, ' + esc(artist) : 'Your workspace'}.</h1>
      <p>${release ? esc(release.title) + ' · ' + esc(release.status) : 'Plan your releases and see what’s next.'}</p></div>
      <button type="button" class="studio-pill studio-checkin" data-manager-checkin>${icon('calendar')} Weekly check-in</button></div>
      ${tabs('home', [['overview', 'Overview'], ['week', 'This week'], ['activity', 'Activity']], homeTab)}
      ${Object.entries(panels).map(([key, html]) => tabPanel('home', key, html, homeTab)).join('')}`;
  };

  const existingProfile = profile;
  profile = function () {
    const content = renderTemplate(existingProfile());
    const photo = content.querySelector('.photo-editor');
    const form = content.querySelector('#profile-form');
    const links = content.querySelector('.artist-links');
    form.querySelector('.fields').insertAdjacentHTML('beforeend',
      `<label class="field full"><span>Biography</span><textarea name="bio" maxlength="1500">${esc(state.profile.bio)}</textarea></label>`);
    const p = state.profile;
    const linksPreview = (Array.isArray(p.links) ? p.links : []).filter(item => /^https?:\/\//i.test(item.url));
    const focus = p.goal ? `<p>${esc(p.goal)}</p>` : '<p>Set a goal in your profile to focus your roadmap.</p>';
    const about = `<div class="studio-profile-about">
      <section><h2>Biography</h2><p class="studio-biography">${esc(p.bio || 'Add a biography to introduce yourself and your music.')}</p>
        <div class="studio-profile-facts"><div><small>Role</small><b>${esc(p.role || 'Not added')}</b></div>
          <div><small>Career stage</small><b>${esc(p.stage || 'Not added')}</b></div></div>
      </section>
      <aside class="studio-panel"><h2>Current focus</h2>${focus}
        <h2 class="studio-profile-links-title">Find me online</h2>
        ${linksPreview.length ? `<ul class="studio-profile-links">${linksPreview.map(item => `<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)}</a></li>`).join('')}</ul>` : '<p>Add social and streaming links in the Links tab.</p>'}
      </aside>
    </div><div id="studio-profile-form" hidden>${form.outerHTML}</div>`;
    return `<section class="studio-profile">
      <div class="studio-cover">${p.cover ? `<img src="${esc(p.cover)}" alt="Artist cover">` : ''}${coverButton}</div>
      <div class="studio-identity">${photo.outerHTML}<div><h1>${esc(p.artist || 'Artist profile')}</h1>
        ${p.role ? `<p>${esc(p.role)}</p>` : ''}</div>
        <button type="button" class="studio-pill" data-studio-profile-edit aria-controls="studio-profile-form" aria-expanded="false">${icon('pen')} Edit profile</button></div>
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
    return sections.filter(([, items]) => items.length).map(([label, items]) =>
      `<section class="studio-roadmap-phase"><div class="studio-section-head"><h2>${label}</h2><small>${items.length} ${items.length === 1 ? 'action' : 'actions'}</small></div>
      <div class="studio-tasks">${items.map(taskRow).join('')}</div></section>`
    ).join('');
  };

  const standardRow = taskRow;
  taskRow = function (task) {
    const row = renderTemplate(standardRow(task)).firstElementChild;
    row.classList.add('studio-roadmap-row');
    const status = row.querySelector('.tag');
    if (task.status !== 'Done' && (task.blocker || E.blocked(state, task))) {
      status.textContent = task.blocker ? 'Blocked' : 'Waiting';
      row.querySelector('[data-complete]').disabled = true;
    }
    return row.outerHTML;
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
      ${task.reason ? `<section class="studio-panel"><h4>Why this matters</h4><p>${esc(task.reason)}</p></section>` : ''}
      ${task.steps ? `<section><h4>What to do</h4><p>${esc(task.steps)}</p></section>` : ''}
      ${task.notes ? `<section><h4>Your notes</h4><p>${esc(task.notes)}</p></section>` : ''}
      ${prerequisites.length ? `<section class="studio-panel"><h4>Waiting on</h4><p>${prerequisites.map(item => esc(item.title)).join(' · ')}</p></section>` : ''}
      ${task.blocker ? `<section class="studio-panel"><h4>Blocker</h4><p>${esc(task.blocker)}</p></section>` : ''}
      ${follows.length ? `<section class="studio-panel"><h4>What comes next</h4><p>${follows.map(item => esc(item.title)).join(' · ')}</p></section>` : ''}
      <div class="studio-action-controls">
        <button type="button" class="studio-pill studio-action-primary" data-studio-status="${completed ? 'To do' : 'Done'}" data-studio-task="${esc(task.id)}"
          ${!completed && (waiting || task.blocker) ? 'disabled' : ''}>${completed ? 'Reopen action' : 'Mark as complete'}</button>
        <div>
          ${!completed ? `<button type="button" class="studio-inline-button" data-studio-status="${task.status === 'Deferred' ? 'To do' : 'Deferred'}" data-studio-task="${esc(task.id)}">${task.status === 'Deferred' ? 'Bring back' : 'Do this later'}</button>
          <button type="button" class="studio-inline-button" data-studio-blocker="${esc(task.id)}">${task.blocker ? 'Update blocker' : 'I’m blocked'}</button>` : ''}
          <button type="button" class="studio-inline-button" data-studio-edit-task="${esc(task.id)}">Edit</button>
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
        <button class="studio-pill studio-action-primary" type="submit">Save blocker</button></form>`);
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
    const content = renderTemplate(existingReleases());
    for (const art of content.querySelectorAll('.release-art')) {
      art.classList.add('studio-release-art');
      art.querySelector('img').remove();
      art.insertAdjacentHTML('afterbegin', '<div class="studio-record" aria-hidden="true"><span></span></div>');
    }
    return [...content.children].map(element => element.outerHTML).join('');
  };

  const existingSettings = settings;
  settings = function () {
    return existingSettings().replace(' The save status is shown in the header.', '');
  };

  guides = function () {
    return header('Discover') + `<div class="studio-guide-list">${resources.map(resource => `
      <article class="studio-guide">
        <div class="studio-guide-art"><img src="/${resource.img}" alt="" loading="lazy"></div>
        <div><small>${esc(resource.label.split(' · ')[0])}</small><h2>${esc(resource.title)}</h2>
        <a class="studio-inline-button" href="${resource.url}">Read guide</a></div>
      </article>`).join('')}</div>`;
  };

  const account = document.querySelector('#account-links');
  if (!account.querySelector('[href="#budget"]')) {
    account.querySelector('[href="#settings"]').insertAdjacentHTML('beforebegin', '<a href="#budget">Budget &amp; income</a>');
  }
  const previousRender = render;
  render = function () {
    previousRender();
    view.dataset.studioView = current();
    const avatar = document.querySelector('#account-toggle');
    if (state.profile.photo) avatar.innerHTML = `<img src="${esc(state.profile.photo)}" alt="">`;
    document.querySelector('#menu-toggle').setAttribute('aria-expanded',
      String(!document.body.classList.contains('sidebar-collapsed')));
  };
  document.querySelector('#menu-toggle').setAttribute('aria-controls', 'sidebar');
  render();
})();
