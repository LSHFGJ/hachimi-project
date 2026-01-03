<script>
    import { onDestroy, createEventDispatcher } from "svelte";
    import AlbumCoverGallery from "./AlbumCoverGallery.svelte";
    import DateGuessFader from "./DateGuessFader.svelte";
    import DualWaveform from "./DualWaveform.svelte";
    import StyleReportPopup from "./StyleReportPopup.svelte";
    import tracks from "$lib/data/tracks.json";
    import audioMatchData from "$lib/data/audio_match_final.json";
    import coverMatchData from "$lib/data/audio_cover_match.json";
    import blobMapping from "$lib/data/blob_mapping.json";

    // Build style report lookup from audioMatchData
    // Maps month_id (e.g. "2024.11") to style_report object
    const styleReportLookup = new Map();
    audioMatchData.forEach((monthGroup) => {
        if (monthGroup.style_report) {
            // Convert month_id format: "2024.11" -> "24.11"
            const monthId = monthGroup.month_id;
            const shortMonth = monthId.replace(/^20/, "");
            styleReportLookup.set(shortMonth, monthGroup.style_report);
            // Also store with original format for fallback
            styleReportLookup.set(monthId, monthGroup.style_report);
        }
    });

    const dispatch = createEventDispatcher();

    /** @type {boolean} */
    export let showComparison = false;
    /** @type {boolean} */
    export let conclusionMode = false;
    /** @type {boolean} - When true, highlight the pullup bar to draw attention */
    export let highlightPullup = false;

    /** @typedef {{ id: string, title: string, month: string, filename: string, date: string }} Track */

    // Lookup for cover images
    const coverLookup = new Map();
    coverMatchData.forEach((monthGroup) => {
        monthGroup.tracks.forEach((track) => {
            // Map date_id (YYYYMMDD) to blob URL
            const blobUrl = blobMapping[track.cover];
            coverLookup.set(
                track.date_id,
                blobUrl || `/src/lib/assets/${track.cover}`,
            );
        });
    });

    /** @type {Track|null} */
    let selectedTrack = null;

    let isPlaying = false;
    let rotation = 0;
    let tonearmAngle = 50;
    /** @type {number|null} */
    let animationId = null;
    /** @type {HTMLAudioElement|null} */
    let audioElement = null;

    // Guessing game state
    let guessKey = 0;
    let panelContentWidth = 350; // Default width // Used to reset DateGuessFader when track changes
    // Track IDs that have been revealed (guessed)
    let revealedTracks = new Set();

    // Style report popup state
    let showStylePopup = false;
    /** @type {{title: string, keywords: string[], description: string} | null} */
    let currentStyleReport = null;
    let lastGuessCorrect = false;

    // Audio playback tracking for waveform
    let currentTime = 0;
    let audioDuration = 180;

    // Pullup panel state
    let panelExpanded = false;

    // Tooltip state
    let tooltipVisible = false;
    let tooltipText = "";
    let tooltipX = 0;
    let tooltipY = 0;

    function handleHover(event) {
        const { title, x, y } = event.detail;
        tooltipText = title;
        tooltipX = x;
        tooltipY = y;
        tooltipVisible = true;
    }

    function handleMove(event) {
        const { x, y } = event.detail;
        tooltipX = x;
        tooltipY = y;
    }

    function handleGuessComplete(event) {
        if (!selectedTrack) return;
        console.log(
            "[Jukebox] Guess complete for:",
            selectedTrack.id,
            "Current revealed:",
            revealedTracks,
        );
        // Reveal the album cover regardless of win/loss
        revealedTracks.add(selectedTrack.id);
        revealedTracks = revealedTracks; // Trigger reactivity
        console.log("[Jukebox] New revealed set:", revealedTracks);

        // Show style report popup
        const month = selectedTrack.month;
        currentStyleReport = styleReportLookup.get(month) || null;
        lastGuessCorrect = event.detail?.correct || false;
        showStylePopup = true;
    }

    function handlePopupClose() {
        showStylePopup = false;
        currentStyleReport = null;
    }

    function handleLeave() {
        tooltipVisible = false;
    }

    function togglePanel() {
        panelExpanded = !panelExpanded;
    }

    const grooves = Array.from({ length: 35 }, (_, i) => 85 + i * 4);

    // Build timestamp lookup from audio_match_final.json
    // Match by extracting date_id from track filename
    function buildTimestampLookup() {
        const lookup = new Map();
        audioMatchData.forEach((month) => {
            month.tracks.forEach((track) => {
                // Use date_id as key for matching
                lookup.set(track.date_id, track.analysis_stats);
            });
        });
        return lookup;
    }

    const timestampLookup = buildTimestampLookup();

    // Get timestamps for selected track
    /** @param {Track|null} track */
    function getTimestampsForTrack(track) {
        if (!track || !track.date) return [];
        // Use track.date (YYYY-MM-DD) to generate date_id (YYYYMMDD)
        const dateId = track.date.replace(/-/g, "");
        const stats = timestampLookup.get(dateId);
        return stats?.timestamps || [];
    }

    $: currentTimestamps = getTimestampsForTrack(selectedTrack);
    $: currentCover =
        selectedTrack && selectedTrack.date
            ? coverLookup.get(selectedTrack.date.replace(/-/g, ""))
            : null;

    // Split tracks into left and right galleries
    const allTracks = tracks.tracks;
    const leftTracks = allTracks.slice(0, Math.ceil(allTracks.length / 2));
    const rightTracks = allTracks.slice(Math.ceil(allTracks.length / 2));

    /** @param {CustomEvent<{track: Track}>} event */
    function handleTrackSelected(event) {
        const { track } = event.detail;

        // If clicking same track, deselect it
        if (selectedTrack?.id === track.id) {
            stopPlayback();
            selectedTrack = null;
            return;
        }

        // Select new track
        selectedTrack = track;
        // Reset guessing game for new track
        guessKey = Date.now();

        // Notify parent that a song was selected
        dispatch("songSelected", { track });

        // Stop current playback
        if (isPlaying) {
            stopPlayback();
        }

        // Start new track
        startPlayback(track);
    }

    /** @param {Track} track */
    function startPlayback(track) {
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }

        // Construct blob path
        const relativeAudioPath = `Bilibili_Top3_Downloads/${track.month}/${track.filename}`;
        const audioPath =
            blobMapping[relativeAudioPath] ||
            `/src/lib/assets/${relativeAudioPath}`;
        audioElement = new Audio(audioPath);

        audioElement.addEventListener("ended", () => {
            isPlaying = false;
            tonearmAngle = 50;
            currentTime = 0;
        });

        audioElement.addEventListener("error", (e) => {
            console.warn("Audio load error:", e);
        });

        audioElement.addEventListener("loadedmetadata", () => {
            if (!audioElement) return;
            audioDuration = audioElement.duration || 180;
        });

        audioElement.addEventListener("timeupdate", () => {
            if (!audioElement) return;
            currentTime = audioElement.currentTime;
        });

        audioElement
            .play()
            .then(() => {
                isPlaying = true;
                tonearmAngle = 22;
                animate();
            })
            .catch((err) => {
                console.warn("Playback failed:", err);
            });
    }

    function stopPlayback() {
        if (audioElement) {
            audioElement.pause();
        }
        isPlaying = false;
        tonearmAngle = 50;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function togglePlay() {
        if (isPlaying) {
            if (audioElement) audioElement.pause();
            isPlaying = false;
            tonearmAngle = 50;
        } else {
            if (audioElement) {
                audioElement.play();
            }
            isPlaying = true;
            tonearmAngle = 22;
            animate();
        }
    }

    function handleSeek(event) {
        const { time } = event.detail;
        if (audioElement) {
            audioElement.currentTime = time;
            currentTime = time;
        }
    }

    /** @param {KeyboardEvent} event */
    function handleKeydown(event) {
        if (event.code === "Space" && selectedTrack) {
            event.preventDefault();
            togglePlay();
        }
    }

    function animate() {
        if (!isPlaying) return;
        rotation = (rotation + 1.5) % 360;
        animationId = requestAnimationFrame(animate);
    }

    onDestroy(() => {
        if (animationId) cancelAnimationFrame(animationId);
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
    });

    // Truncate title for display on vinyl label
    /**
     * @param {string} title
     * @param {number} [maxLen]
     */
    function truncateTitle(title, maxLen = 12) {
        if (!title) return "HACHIMI";
        // Remove emoji for cleaner display
        const clean = title.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
        return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="jukebox-wrapper">
    <!-- Play Hint Overlay -->
    {#if isPlaying}
        <div class="play-hint">
            <span class="hint-icon">⏸</span>
            <span class="hint-text">按空格暂停播放</span>
        </div>
    {/if}

    <div class="jukebox-content" class:single-mode={conclusionMode}>
        <!-- Left Album Gallery -->

        <div class="gallery-column left">
            <AlbumCoverGallery
                tracks={leftTracks}
                {selectedTrack}
                side="left"
                on:trackSelected={handleTrackSelected}
                on:hover={handleHover}
                on:move={handleMove}
                on:leave={handleLeave}
                {revealedTracks}
                {coverLookup}
            />
        </div>

        <!-- Center Turntable -->
        <div class="turntable-column">
            <svg viewBox="0 0 500 500" class="turntable-svg">
                <defs>
                    <radialGradient id="platterGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#3a3a3a" />
                        <stop offset="70%" stop-color="#2a2a2a" />
                        <stop offset="100%" stop-color="#1a1a1a" />
                    </radialGradient>

                    <radialGradient id="vinylGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#1a1a1a" />
                        <stop offset="15%" stop-color="#0f0f0f" />
                        <stop offset="100%" stop-color="#050505" />
                    </radialGradient>

                    <linearGradient
                        id="vinylShine"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
                        <stop offset="50%" stop-color="rgba(255,255,255,0)" />
                        <stop
                            offset="100%"
                            stop-color="rgba(255,255,255,0.05)"
                        />
                    </linearGradient>

                    <radialGradient id="labelGrad" cx="35%" cy="35%" r="60%">
                        <stop offset="0%" stop-color="#ff8a8a" />
                        <stop offset="100%" stop-color="#ff6b6b" />
                    </radialGradient>

                    <linearGradient
                        id="woodGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stop-color="#4a3728" />
                        <stop offset="25%" stop-color="#5c4033" />
                        <stop offset="50%" stop-color="#4a3728" />
                        <stop offset="75%" stop-color="#5c4033" />
                        <stop offset="100%" stop-color="#4a3728" />
                    </linearGradient>

                    <linearGradient
                        id="chromeGrad"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop offset="0%" stop-color="#e8e8e8" />
                        <stop offset="30%" stop-color="#c0c0c0" />
                        <stop offset="50%" stop-color="#a0a0a0" />
                        <stop offset="70%" stop-color="#c0c0c0" />
                        <stop offset="100%" stop-color="#e8e8e8" />
                    </linearGradient>

                    <filter
                        id="shadow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="8"
                            flood-opacity="0.3"
                        />
                    </filter>

                    <filter id="innerShadow">
                        <feOffset dx="0" dy="2" />
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                        />
                    </filter>
                    <clipPath id="labelClip">
                        <circle cx="220" cy="250" r="45" />
                    </clipPath>
                </defs>

                <!-- Turntable base -->
                <rect
                    x="20"
                    y="20"
                    width="460"
                    height="460"
                    rx="12"
                    fill="url(#woodGrad)"
                    filter="url(#shadow)"
                />
                <rect
                    x="25"
                    y="25"
                    width="450"
                    height="450"
                    rx="10"
                    fill="#3d2f24"
                    opacity="0.9"
                />

                <!-- Decorative corners -->
                <circle cx="50" cy="50" r="6" fill="#2a2a2a" />
                <circle cx="450" cy="50" r="6" fill="#2a2a2a" />
                <circle cx="50" cy="450" r="6" fill="#2a2a2a" />
                <circle cx="450" cy="450" r="6" fill="#2a2a2a" />

                <!-- Platter -->
                <circle
                    cx="220"
                    cy="250"
                    r="175"
                    fill="url(#platterGrad)"
                    filter="url(#shadow)"
                />
                <circle
                    cx="220"
                    cy="250"
                    r="170"
                    fill="none"
                    stroke="#4a4a4a"
                    stroke-width="3"
                />
                <circle cx="220" cy="250" r="165" fill="#1f1f1f" />
                <circle
                    cx="220"
                    cy="250"
                    r="165"
                    fill="none"
                    stroke="#333"
                    stroke-width="0.5"
                />

                <!-- Vinyl record (rotates) -->
                <g transform="rotate({rotation}, 220, 250)">
                    <circle cx="220" cy="250" r="155" fill="url(#vinylGrad)" />

                    {#each grooves as r}
                        <circle
                            cx="220"
                            cy="250"
                            {r}
                            fill="none"
                            stroke="rgba(40,40,40,0.8)"
                            stroke-width="0.5"
                        />
                    {/each}

                    <circle cx="220" cy="250" r="155" fill="url(#vinylShine)" />
                    <circle
                        cx="220"
                        cy="250"
                        r="155"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        stroke-width="1"
                    />

                    <!-- Label -->
                    <circle cx="220" cy="250" r="45" fill="url(#labelGrad)" />
                    <circle
                        cx="220"
                        cy="250"
                        r="45"
                        fill="none"
                        stroke="#e85555"
                        stroke-width="1"
                    />

                    <!-- Dynamic label content -->
                    {#if currentCover}
                        <image
                            href={currentCover}
                            x="175"
                            y="205"
                            width="90"
                            height="90"
                            preserveAspectRatio="xMidYMid slice"
                            clip-path="url(#labelClip)"
                        />
                    {:else}
                        <text
                            x="220"
                            y="253"
                            text-anchor="middle"
                            fill="#fff"
                            font-size="7"
                            font-weight="700"
                            font-family="var(--font-serif)"
                        >
                            {selectedTrack
                                ? truncateTitle(selectedTrack.title)
                                : "HACHIMI"}
                        </text>
                    {/if}

                    <circle cx="220" cy="250" r="4" fill="#1a1a1a" />
                    <circle cx="220" cy="250" r="3" fill="#0a0a0a" />
                </g>

                <!-- Spindle -->
                <circle cx="220" cy="250" r="5" fill="#666" />
                <circle cx="220" cy="250" r="3" fill="#888" />
                <circle cx="220" cy="250" r="1.5" fill="#aaa" />

                <!-- Tonearm -->
                <g
                    transform="rotate({tonearmAngle}, 420, 100)"
                    style="transition: transform 0.8s ease-out;"
                >
                    <circle cx="420" cy="100" r="22" fill="#2a2a2a" />
                    <circle cx="420" cy="100" r="17" fill="url(#chromeGrad)" />
                    <circle cx="420" cy="100" r="9" fill="#333" />

                    <ellipse cx="450" cy="100" rx="14" ry="11" fill="#333" />
                    <ellipse cx="450" cy="100" rx="11" ry="9" fill="#555" />

                    <line
                        x1="420"
                        y1="100"
                        x2="260"
                        y2="220"
                        stroke="url(#chromeGrad)"
                        stroke-width="6"
                        stroke-linecap="round"
                    />
                    <circle cx="260" cy="220" r="6" fill="url(#chromeGrad)" />

                    <g transform="translate(260, 220) rotate(-45)">
                        <rect
                            x="-5"
                            y="-4"
                            width="35"
                            height="8"
                            rx="2"
                            fill="url(#chromeGrad)"
                        />
                        <rect
                            x="25"
                            y="-6"
                            width="22"
                            height="12"
                            rx="2"
                            fill="#1a1a1a"
                        />
                        <rect
                            x="28"
                            y="-4"
                            width="16"
                            height="8"
                            rx="1"
                            fill="#333"
                        />
                        <line
                            x1="44"
                            y1="0"
                            x2="52"
                            y2="8"
                            stroke="#888"
                            stroke-width="1"
                        />
                        <circle cx="52" cy="8" r="2" fill="#ff6b6b" />
                    </g>
                </g>

                <!-- Speed selector -->
                <g transform="translate(420, 420)">
                    <rect
                        x="-25"
                        y="-15"
                        width="50"
                        height="30"
                        rx="4"
                        fill="#2a2a2a"
                    />
                    <circle cx="0" cy="0" r="8" fill="#444" />
                    <rect x="-1" y="-6" width="2" height="6" fill="#888" />
                    <text
                        x="0"
                        y="25"
                        text-anchor="middle"
                        fill="#666"
                        font-size="8">33/45</text
                    >
                </g>

                <!-- Power Button/LED -->
                <g transform="translate(460, 450)">
                    <circle cx="0" cy="0" r="6" fill="#333" />
                    <circle
                        cx="0"
                        cy="0"
                        r="4"
                        fill={isPlaying ? "#4ade80" : "#3d3530"}
                        class="power-led"
                    />
                    <text
                        x="0"
                        y="18"
                        text-anchor="middle"
                        fill="#666"
                        font-size="7">POWER</text
                    >
                </g>

                <!-- Brand -->
                <text
                    x="250"
                    y="455"
                    text-anchor="middle"
                    fill="#8a7a6a"
                    font-size="14"
                    font-weight="600"
                    font-family="var(--font-serif)"
                    letter-spacing="0.15em"
                >
                    HACHIMI AUDIO
                </text>
            </svg>
        </div>

        <!-- Right Album Gallery -->

        <div class="gallery-column right">
            <AlbumCoverGallery
                tracks={rightTracks}
                {selectedTrack}
                side="right"
                on:trackSelected={handleTrackSelected}
                on:hover={handleHover}
                on:move={handleMove}
                on:leave={handleLeave}
                {revealedTracks}
                {coverLookup}
            />
        </div>
    </div>

    <!-- Pullup Panel for frequency + date guess -->
    {#if showComparison}
        <div
            class="pullup-panel"
            class:expanded={panelExpanded}
            class:has-track={selectedTrack}
            class:hidden={conclusionMode}
            class:highlight={highlightPullup && !selectedTrack}
        >
            <!-- Pullup trigger tab -->
            <button
                class="pullup-trigger"
                on:click={togglePanel}
                disabled={!selectedTrack}
                aria-expanded={panelExpanded}
            >
                <span class="trigger-icon">▲</span>
                <span class="trigger-text">
                    {#if panelExpanded}
                        收起 <span class="playing-title">
                            {selectedTrack?.title}</span
                        >
                    {:else if selectedTrack}
                        猜猜这首哈基米音乐是什么时候发布的？
                    {:else}
                        请选择歌曲
                    {/if}
                </span>
            </button>

            <!-- Expandable content -->
            <div class="pullup-content" bind:clientWidth={panelContentWidth}>
                {#if selectedTrack}
                    <div class="panel-section waveform-section">
                        <DualWaveform
                            timestamps={currentTimestamps}
                            duration={audioDuration}
                            {currentTime}
                            width={Math.max(300, panelContentWidth - 32)}
                            height={70}
                            trackId={selectedTrack.id}
                            on:seek={handleSeek}
                        />
                    </div>

                    <div class="panel-section guess-section">
                        {#key guessKey}
                            <DateGuessFader
                                correctMonth={selectedTrack.month}
                                disabled={!isPlaying}
                                compact={true}
                                on:guessComplete={handleGuessComplete}
                            />
                        {/key}
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Custom Cursor Tooltip -->
    {#if tooltipVisible}
        <div
            class="cursor-tooltip"
            style="left: {tooltipX}px; top: {tooltipY}px;"
        >
            {tooltipText}
        </div>
    {/if}

    <!-- Style Report Popup -->
    {#if showStylePopup && selectedTrack}
        <StyleReportPopup
            trackTitle={selectedTrack.title}
            month={selectedTrack.month}
            styleReport={currentStyleReport}
            isCorrect={lastGuessCorrect}
            on:close={handlePopupClose}
        />
    {/if}
</div>

<style>
    .jukebox-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        width: 100%;
        transition: opacity 0.5s ease;
        margin: 0 auto;
        outline: none;
    }

    /* Pullup Panel Styles */
    .pullup-panel {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 700px;
        z-index: 1000;
        background: linear-gradient(135deg, #2a2520 0%, #1a1512 100%);
        border: 2px solid #3d3530;
        border-bottom: none;
        border-radius: 12px 12px 0 0;
        box-shadow:
            0 -4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        overflow: hidden;
        transition:
            bottom 0.5s ease,
            opacity 0.5s ease;
    }

    .pullup-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        width: 100%;
        padding: var(--space-2) var(--space-4);
        background: linear-gradient(135deg, #3d3530 0%, #2a2520 100%);
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #d4a574;
        font-size: var(--font-size-sm);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .pullup-trigger:hover:not(:disabled) {
        background: linear-gradient(135deg, #4a4540 0%, #3a3530 100%);
        color: #e8b994;
    }

    .pullup-trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        color: #8a7a6a;
    }

    .pullup-trigger:focus,
    .pullup-trigger:focus-visible {
        outline: none;
        box-shadow: none;
    }

    .trigger-icon {
        font-size: var(--font-size-xs);
        transition: transform 0.3s ease;
    }

    .pullup-panel.expanded .trigger-icon {
        transform: rotate(180deg);
    }

    .trigger-text {
        letter-spacing: 0.5px;
    }

    .playing-title {
        font-weight: 400;
        color: #8a7a6a;
        font-size: 0.9em;
        margin-left: var(--space-1);
    }

    .pullup-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        padding: 0;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition:
            max-height 0.4s ease-out,
            opacity 0.3s ease,
            padding 0.3s ease;
    }

    .pullup-panel.expanded .pullup-content {
        max-height: 220px;
        opacity: 1;
        padding: var(--space-3);
    }

    .panel-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin: 0 0 var(--space-2) 0;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: #d4a574;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .section-icon {
        font-size: 1rem;
    }

    .waveform-section,
    .guess-section {
        width: 100%;
    }

    .jukebox-content {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--space-4);
        width: 100%;
        max-width: 1200px;
        position: relative;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .jukebox-content.single-mode {
        transform: translateX(-25%) scale(1.25);
    }

    .jukebox-content.single-mode .gallery-column {
        opacity: 0;
        pointer-events: none;
    }

    .pullup-panel.hidden {
        opacity: 0;
        pointer-events: none;
        bottom: -40px;
    }

    .gallery-column {
        transition: opacity 0.5s ease;
        flex: 0 0 auto;
        height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 107, 107, 0.3) transparent;
    }

    .gallery-column::-webkit-scrollbar {
        width: 4px;
    }

    .gallery-column::-webkit-scrollbar-track {
        background: transparent;
    }

    .gallery-column::-webkit-scrollbar-thumb {
        background: rgba(255, 107, 107, 0.3);
        border-radius: 2px;
    }

    .turntable-column {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
    }

    .turntable-svg {
        width: 380px;
        height: auto;
        border-radius: 12px;
    }

    .power-led {
        transition: fill 0.3s ease;
        filter: drop-shadow(0 0 4px currentColor);
    }

    @media (max-width: 900px) {
        .jukebox-content {
            flex-direction: column;
            gap: var(--space-6);
        }

        .gallery-column {
            max-height: 200px;
            width: 100%;
        }

        .gallery-column.left,
        .gallery-column.right {
            order: 2;
        }

        .turntable-column {
            order: 1;
        }

        .turntable-svg {
            width: 320px;
        }
    }

    @media (max-width: 480px) {
        .turntable-svg {
            width: 280px;
        }

        .pullup-content {
            flex-direction: column;
            gap: var(--space-3);
        }

        .panel-divider {
            width: 80%;
            height: 1px;
            background: linear-gradient(
                to right,
                transparent,
                #5a5040 50%,
                transparent
            );
        }

        .waveform-section,
        .guess-section {
            min-width: auto;
            width: 100%;
        }
    }

    /* Cursor Tooltip */
    .cursor-tooltip {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        background: rgba(42, 37, 32, 0.9);
        color: #e8b994;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(212, 165, 116, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translate(12px, 12px); /* Offset from cursor */
        backdrop-filter: blur(4px);
        white-space: nowrap;
        transition: opacity 0.1s ease;
    }

    /* Highlight animation for pullup panel when song selection is needed */
    .pullup-panel.highlight {
        animation: pulse-highlight 1.5s ease-in-out infinite;
        border-color: #ff6b6b;
    }

    .pullup-panel.highlight .pullup-trigger {
        background: linear-gradient(135deg, #5a3530 0%, #4a2520 100%);
        color: #ff9f9f;
        animation: text-glow 1.5s ease-in-out infinite;
    }

    @keyframes pulse-highlight {
        0%,
        100% {
            box-shadow:
                0 -4px 20px rgba(0, 0, 0, 0.3),
                0 0 0 0 rgba(255, 107, 107, 0),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        50% {
            box-shadow:
                0 -4px 30px rgba(255, 107, 107, 0.4),
                0 0 25px 8px rgba(255, 107, 107, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
    }

    @keyframes text-glow {
        0%,
        100% {
            text-shadow: none;
        }
        50% {
            text-shadow: 0 0 10px rgba(255, 159, 159, 0.5);
        }
    }

    /* Play Hint Overlay */
    .play-hint {
        position: fixed;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 28px;
        background: linear-gradient(
            135deg,
            rgba(42, 37, 32, 0.95) 0%,
            rgba(26, 21, 18, 0.95) 100%
        );
        border: 1px solid rgba(138, 122, 106, 0.3);
        border-radius: 50px;
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        z-index: 2000;
        animation: hintFadeIn 0.4s ease-out forwards;
        backdrop-filter: blur(8px);
    }

    .hint-icon {
        font-size: 1.2rem;
        color: #ff9f9f;
        animation: pulse-icon 1.5s ease-in-out infinite;
    }

    .hint-text {
        font-family: var(--font-serif, "Source Han Serif CN", serif);
        font-size: 1rem;
        font-weight: 500;
        color: #d4c4b0;
        letter-spacing: 0.08em;
    }

    @keyframes hintFadeIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes pulse-icon {
        0%,
        100% {
            opacity: 0.7;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
    }
</style>
