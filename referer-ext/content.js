// Referer Extension - Content Script
// Inyectado en pages de YouTube

const SUPABASE_URL = 'https://jazftsrxaycgbynarenz.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/get-video-sources`;

let sources = [];
let currentVideoId = null;
let overlayElement = null;
let activeIndex = -1;
let creatorInfo = null;

// ============ API ============

async function getVideoSources(youtubeId) {
    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ youtube_id: youtubeId }),
        });

        if (!response.ok) {
            console.error('Referer: API error', response.status);
            return { video: null, sources: [], creator: null };
        }

        return await response.json();
    } catch (error) {
        console.error('Referer: Network error', error);
        return { video: null, sources: [], creator: null };
    }
}

// ============ HELPERS ============

function getYouTubeVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('v');
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getHostname(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function seekTo(seconds) {
    const video = document.querySelector('video');
    if (video) {
        video.currentTime = seconds;
        video.play();
    }
}

// ============ OVERLAY UI ============

function removeOverlay() {
    if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
    }
    activeIndex = -1;
}

function getAttributionBadge(source) {
    if (source.is_creator_source) {
        return `<span class="referer-badge referer-badge-creator" title="Añadida por el creador del video">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
            Creador
        </span>`;
    } else if (source.contributed_by) {
        return `<span class="referer-badge referer-badge-community" title="Añadida por la comunidad">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Comunidad
        </span>`;
    }
    return '';
}

function createOverlay(sourcesData) {
    removeOverlay();

    const container = document.getElementById('secondary-inner') ||
        document.getElementById('secondary') ||
        document.getElementById('related');

    if (!container) {
        console.warn('Referer: Could not find container');
        return;
    }

    overlayElement = document.createElement('div');
    overlayElement.id = 'referer-overlay';

    // Header with optional creator verification badge
    let creatorBadge = '';
    if (creatorInfo) {
        creatorBadge = `
        <span class="referer-verified-badge" title="Creador verificado: ${escapeHtml(creatorInfo.youtube_channel_name || '')}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
        </span>`;
    }

    let html = `
    <div class="referer-header">
      <img src="${chrome.runtime.getURL('icon128.png')}" alt="R" style="width:20px;height:20px;">
      <span class="referer-title">Referer</span>
      ${creatorBadge}
      <span class="referer-count">${sourcesData.length} fuentes</span>
      <button class="referer-minimize" title="Minimizar">−</button>
    </div>
    <div class="referer-sources">
  `;

    sourcesData.forEach((s, i) => {
        const badge = getAttributionBadge(s);
        html += `
      <div class="referer-source" data-index="${i}" data-time="${s.timestamp_seconds}">
        <span class="referer-time">${formatTime(s.timestamp_seconds)}</span>
        <div class="referer-content">
          <div class="referer-claim-row">
            <p class="referer-claim">${escapeHtml(s.claim)}</p>
            ${badge}
          </div>
          <a href="${escapeHtml(s.source_url)}" target="_blank" rel="noopener" class="referer-link">
            ${getHostname(s.source_url)}
          </a>
        </div>
      </div>
    `;
    });

    html += `
    </div>
    <div class="referer-footer">
      <a href="https://referer.app" target="_blank" rel="noopener">referer.app</a>
    </div>
  `;

    overlayElement.innerHTML = html;
    container.prepend(overlayElement);

    // Click handlers
    overlayElement.querySelectorAll('.referer-source').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                const time = parseInt(el.getAttribute('data-time') || '0');
                seekTo(time);
            }
        });
    });

    // Minimize button
    const minimizeBtn = overlayElement.querySelector('.referer-minimize');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            overlayElement.classList.toggle('minimized');
            minimizeBtn.textContent = overlayElement.classList.contains('minimized') ? '+' : '−';
        });
    }
}

function updateActiveSource(currentTime) {
    const newIndex = sources.findIndex((s, i) => {
        const next = sources[i + 1];
        return currentTime >= s.timestamp_seconds &&
            (!next || currentTime < next.timestamp_seconds);
    });

    if (newIndex !== activeIndex) {
        activeIndex = newIndex;

        document.querySelectorAll('.referer-source').forEach((el, i) => {
            el.classList.toggle('active', i === newIndex);
        });

        if (newIndex >= 0) {
            const activeEl = document.querySelector('.referer-source.active');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

// ============ MAIN ============

function observeVideoTime() {
    const video = document.querySelector('video');
    if (!video) {
        setTimeout(observeVideoTime, 500);
        return;
    }

    video.addEventListener('timeupdate', () => {
        updateActiveSource(video.currentTime);
    });
}

async function init() {
    const videoId = getYouTubeVideoId();

    if (!videoId) return;
    if (videoId === currentVideoId) return;

    removeOverlay();
    currentVideoId = videoId;
    sources = [];
    creatorInfo = null;

    console.log('Referer: Checking video', videoId);

    const data = await getVideoSources(videoId);

    // Store creator info for attribution display
    if (data.creator) {
        creatorInfo = data.creator;
    }

    if (data.sources && data.sources.length > 0) {
        console.log('Referer: Found', data.sources.length, 'sources');
        sources = data.sources;

        chrome.runtime.sendMessage({
            type: 'SOURCES_FOUND',
            count: sources.length
        });

        setTimeout(() => {
            createOverlay(sources);
            observeVideoTime();
        }, 1500);
    } else {
        console.log('Referer: No sources for this video');
        chrome.runtime.sendMessage({ type: 'SOURCES_FOUND', count: 0 });
    }
}

// YouTube SPA navigation
const originalPushState = history.pushState;
history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(init, 500);
};

window.addEventListener('popstate', () => setTimeout(init, 500));
window.addEventListener('yt-navigate-finish', () => setTimeout(init, 500));

// Start
console.log('Referer: Extension loaded');
init();
