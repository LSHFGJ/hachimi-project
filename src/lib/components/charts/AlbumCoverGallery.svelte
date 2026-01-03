<script>
    import { createEventDispatcher } from "svelte";

    /** @typedef {{ id: string, title: string, month: string, filename: string, date: string }} Track */

    /** @type {Track[]} */
    export let tracks = [];

    /** @type {Track|null} */
    export let selectedTrack = null;

    /** @type {"left"|"right"} */
    export let side = "left";

    /** @type {Set<string>} */
    export let revealedTracks = new Set();

    /** @type {Map<string, string>} */
    export let coverLookup = new Map();

    const dispatch = createEventDispatcher();

    // Shuffle tracks for random arrangement (seeded by side for consistency)
    function shuffle(arr, seed) {
        const shuffled = [...arr];
        let m = shuffled.length;
        while (m) {
            const i = Math.floor(seededRandom(seed + m) * m--);
            [shuffled[m], shuffled[i]] = [shuffled[i], shuffled[m]];
        }
        return shuffled;
    }

    function seededRandom(seed) {
        const x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    }

    $: shuffledTracks = shuffle(tracks, side === "left" ? 1 : 2);

    // Generate a unique color gradient for each track based on its id
    function getGradientColors(id) {
        const hue1 = (parseInt(id) * 37) % 360;
        const hue2 = (hue1 + 30) % 360;
        return { hue1, hue2 };
    }

    function handleClick(track) {
        dispatch("trackSelected", { track });
    }
</script>

<div
    class="album-gallery"
    class:left={side === "left"}
    class:right={side === "right"}
>
    {#each shuffledTracks as track (track.id)}
        {@const log = console.log(
            "[Gallery] Render track:",
            track.id,
            "Revealed?",
            revealedTracks.has(track.id),
            "Date:",
            track.date,
        )}
        {@const colors = getGradientColors(track.id)}
        {@const isActive = selectedTrack?.id === track.id}
        {@const isRevealed = revealedTracks.has(track.id)}
        {@const dateId = track.date ? track.date.replace(/-/g, "") : ""}
        {@const coverUrl = coverLookup.get(dateId)}
        <button
            class="album-cover"
            class:active={isActive}
            class:revealed={isRevealed}
            on:click={() => handleClick(track)}
            on:mouseenter={(e) =>
                dispatch("hover", {
                    title: track.title,
                    x: e.clientX,
                    y: e.clientY,
                })}
            on:mousemove={(e) =>
                dispatch("move", { x: e.clientX, y: e.clientY })}
            on:mouseleave={() => dispatch("leave")}
            aria-label="播放 {track.title}"
        >
            {#if isRevealed && coverUrl}
                <!-- Real Album Cover -->
                <div class="cover-container">
                    <img src={coverUrl} alt={track.title} class="real-cover" />
                    {#if isActive}
                        <div class="active-border"></div>
                    {/if}
                </div>
            {:else}
                <!-- Vinyl-style album cover placeholder -->
                <svg viewBox="0 0 60 60" class="cover-svg">
                    <defs>
                        <radialGradient
                            id="vinyl-{track.id}"
                            cx="50%"
                            cy="50%"
                            r="50%"
                        >
                            <stop
                                offset="0%"
                                stop-color="hsl({colors.hue1}, 60%, {isActive
                                    ? '45%'
                                    : '20%'})"
                            />
                            <stop
                                offset="40%"
                                stop-color="hsl({colors.hue2}, 50%, {isActive
                                    ? '35%'
                                    : '12%'})"
                            />
                            <stop
                                offset="100%"
                                stop-color="hsl({colors.hue1}, 40%, {isActive
                                    ? '25%'
                                    : '8%'})"
                            />
                        </radialGradient>
                        <linearGradient
                            id="shine-{track.id}"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stop-color="rgba(255,255,255,{isActive
                                    ? '0.3'
                                    : '0.05'})"
                            />
                            <stop
                                offset="50%"
                                stop-color="rgba(255,255,255,0)"
                            />
                            <stop
                                offset="100%"
                                stop-color="rgba(255,255,255,{isActive
                                    ? '0.15'
                                    : '0.02'})"
                            />
                        </linearGradient>
                    </defs>

                    <!-- Album background -->
                    <rect
                        x="2"
                        y="2"
                        width="56"
                        height="56"
                        rx="4"
                        fill="url(#vinyl-{track.id})"
                    />

                    <!-- Vinyl record in center -->
                    <circle cx="30" cy="30" r="18" fill="#0a0a0a" />
                    <circle
                        cx="30"
                        cy="30"
                        r="16"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        stroke-width="0.5"
                    />
                    <circle
                        cx="30"
                        cy="30"
                        r="12"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        stroke-width="0.3"
                    />
                    <circle
                        cx="30"
                        cy="30"
                        r="8"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        stroke-width="0.3"
                    />

                    <!-- Label center -->
                    <circle
                        cx="30"
                        cy="30"
                        r="6"
                        fill="hsl({colors.hue1}, 70%, {isActive
                            ? '50%'
                            : '25%'})"
                    />
                    <circle cx="30" cy="30" r="2" fill="#1a1a1a" />

                    <!-- Shine overlay -->
                    <rect
                        x="2"
                        y="2"
                        width="56"
                        height="56"
                        rx="4"
                        fill="url(#shine-{track.id})"
                    />

                    <!-- Active glow -->
                    {#if isActive}
                        <rect
                            x="2"
                            y="2"
                            width="56"
                            height="56"
                            rx="4"
                            fill="none"
                            stroke="hsl({colors.hue1}, 80%, 60%)"
                            stroke-width="2"
                            class="glow-border"
                        />
                    {/if}
                </svg>
            {/if}
            <!-- Month badge removed - it's now a guessing game! -->
        </button>
    {/each}
</div>

<style>
    .album-gallery {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding: 8px;
    }

    .album-gallery.left {
        justify-items: end;
    }

    .album-gallery.right {
        justify-items: start;
    }

    .album-cover {
        position: relative;
        width: 60px;
        height: 60px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0.4;
        filter: saturate(0.3);
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    .album-cover:focus,
    .album-cover:focus-visible {
        outline: none;
    }

    .album-cover:hover {
        opacity: 0.8;
        filter: saturate(0.7);
        transform: scale(1.1);
    }

    .album-cover.active {
        opacity: 1;
        filter: saturate(1);
        transform: scale(1.15);
        z-index: 10;
    }

    .album-cover.revealed {
        opacity: 1;
        filter: saturate(1);
    }

    .cover-svg {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .album-cover.active .cover-svg {
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
    }

    .glow-border {
        animation: glow-pulse 2s ease-in-out infinite;
    }

    @keyframes glow-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.6;
        }
    }

    .month-badge {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-accent, #ff6b6b);
        color: white;
        font-size: 8px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
        white-space: nowrap;
    }

    .month-badge.visible {
        opacity: 1;
    }

    @media (max-width: 768px) {
        .album-gallery {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }

        .album-cover {
            width: 50px;
            height: 50px;
        }
    }
    .cover-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .real-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .active-border {
        position: absolute;
        inset: 0;
        border: 2px solid #ff6b6b;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
        animation: glow-pulse 2s infinite;
    }
</style>
