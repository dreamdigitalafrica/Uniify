/* Presentation for the authenticated workspace. The existing editors own all writes. */
(() => {
  const view = document.querySelector('#view');
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
  const isReady = task => !['Done', 'Deferred'].includes(task.status) && !E.blocked(state, task);
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
    return { scheduled, html: `<section class="studio-panel">
      <div class="studio-section-head"><h2>Your week</h2>${icon('calendar')}</div>
      <div class="studio-week">${dates.map(({ day, key }) => {
        const count = scheduled.filter(task => task.due === key).length;
        return `<span class="${key === today() ? 'is-today' : ''}" aria-label="${esc(calendar.format(day))}, ${count} scheduled"><small>${esc(day.toLocaleDateString(undefined, { weekday: 'short' }))}</small><b>${day.getDate()}</b>${count ? '<i></i>' : ''}</span>`;
      }).join('')}</div><p>${scheduled.length} ready ${scheduled.length === 1 ? 'action' : 'actions'} scheduled</p>
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
    const counts = progress();
    const percent = counts.total ? Math.round(counts.done / counts.total * 100) : 0;
    const activities = state.activity.slice(0, 12);
    const panels = {
      overview: `<div class="studio-grid"><div class="studio-primary">
        <section class="studio-spotlight">
          <div class="studio-record" aria-hidden="true"><span></span></div>
          <div class="studio-spotlight-copy"><small>${release ? 'YOUR NEXT RELEASE' : 'RELEASE PLANNING'}</small>
            <h2>${esc(release?.title || 'Plan your next release')}</h2>
            ${release ? `<p>${esc(release.type)} · ${esc(release.status)}</p><p>${esc(date(release.date))}</p>` : ''}
            ${releaseAction(release)}
          </div>
        </section>
        <section><div class="studio-section-head"><h2>Your next moves</h2><a href="#roadmap">All actions</a></div>${taskCards(priorities)}</section>
        ${priorities[0]?.reason ? `<aside class="studio-note">${icon('music')}<div><h2>Manager’s insight</h2><p>${esc(priorities[0].reason)}</p></div></aside>` : ''}
      </div><aside class="studio-context">
        <section class="studio-panel studio-progress"><h2>Roadmap progress</h2>
          <div class="studio-dial" style="--completion:${percent}%"><strong>${percent}%</strong></div>
          <p>${counts.done} of ${counts.total} actions complete</p><a href="#career">See your progress</a>
        </section>${schedule.html}
      </aside></div>`,
      week: `<div class="studio-primary">${schedule.html}${taskCards(schedule.scheduled)}</div>`,
      activity: activities.length ? `<div class="studio-tasks">${activities.map(item => `
        <article class="studio-task"><span class="studio-task-icon">${icon('clock-rotate-left')}</span>
        <div><h3>${esc(item.text)}</h3><small>${esc(new Date(item.time).toLocaleDateString())}</small></div></article>`).join('')}</div>`
        : '<p class="studio-empty">Your workspace activity will appear here.</p>'
    };
    return `<div class="studio-heading"><div><small>${esc(calendar.format(new Date()))}</small>
      <h1>${artist ? 'Welcome, ' + esc(artist) : 'Your workspace'}</h1></div>
      <button type="button" class="studio-pill studio-checkin" data-manager-checkin>${icon('calendar')} Weekly check-in</button></div>
      ${tabs('home', [['overview', 'Overview'], ['week', 'This week'], ['activity', 'Activity']], homeTab)}
      ${Object.entries(panels).map(([key, html]) => tabPanel('home', key, html, homeTab)).join('')}`;
  };

  const existingProfile = profile;
  profile = function () {
    const template = document.createElement('template');
    template.innerHTML = existingProfile();
    const photo = template.content.querySelector('.photo-editor');
    const form = template.content.querySelector('#profile-form');
    const links = template.content.querySelector('.artist-links');
    form.querySelector('.fields').insertAdjacentHTML('beforeend',
      `<label class="field full"><span>Biography</span><textarea name="bio" maxlength="1500">${esc(state.profile.bio)}</textarea></label>`);
    const p = state.profile;
    return `<section class="studio-profile">
      <div class="studio-cover">${p.cover ? `<img src="${esc(p.cover)}" alt="Artist cover">` : ''}${coverButton}</div>
      <div class="studio-identity">${photo.outerHTML}<div><h1>${esc(p.artist || 'Artist profile')}</h1>
        ${p.role ? `<p>${esc(p.role)}</p>` : ''}</div></div>
      ${tabs('profile', [['about', 'About'], ['links', 'Links'], ['career', 'Career']], profileTab)}
      ${tabPanel('profile', 'about', form.outerHTML, profileTab)}
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
