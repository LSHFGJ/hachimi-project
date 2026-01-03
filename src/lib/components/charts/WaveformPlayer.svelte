<script>
    import { onMount, onDestroy } from "svelte";

    /** @type {boolean} */
    export let showComparison = false;

    let isPlaying = false;
    let rotation = 0;
    let tonearmAngle = 50; // Starting position (stylus outside record)
    /** @type {number|null} */
    let animationId = null;

    // Vinyl grooves pattern
    const grooves = Array.from({ length: 35 }, (_, i) => 85 + i * 4);

    function togglePlay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            tonearmAngle = 22; // Move tonearm to playing position (stylus on record)
            animate();
        } else {
            tonearmAngle = 50; // Return tonearm to rest (stylus outside record)
        }
    }

    function animate() {
        if (!isPlaying) return;
        rotation = (rotation + 1.5) % 360; // 33⅓ RPM feel
        animationId = requestAnimationFrame(animate);
    }

    onDestroy(() => {
        if (animationId) cancelAnimationFrame(animationId);
    });
</script>

<div class="turntable-container">
    <svg viewBox="0 0 500 500" class="turntable-svg">
        <defs>
            <!-- Metallic gradient for platter -->
            <radialGradient id="platterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#3a3a3a" />
                <stop offset="70%" stop-color="#2a2a2a" />
                <stop offset="100%" stop-color="#1a1a1a" />
            </radialGradient>

            <!-- Vinyl gradient -->
            <radialGradient id="vinylGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#1a1a1a" />
                <stop offset="15%" stop-color="#0f0f0f" />
                <stop offset="100%" stop-color="#050505" />
            </radialGradient>

            <!-- Vinyl shine -->
            <linearGradient id="vinylShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
                <stop offset="50%" stop-color="rgba(255,255,255,0)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
            </linearGradient>

            <!-- Label gradient -->
            <radialGradient id="labelGrad" cx="35%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#ff8a8a" />
                <stop offset="100%" stop-color="#ff6b6b" />
            </radialGradient>

            <!-- Wood texture for base -->
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4a3728" />
                <stop offset="25%" stop-color="#5c4033" />
                <stop offset="50%" stop-color="#4a3728" />
                <stop offset="75%" stop-color="#5c4033" />
                <stop offset="100%" stop-color="#4a3728" />
            </linearGradient>

            <!-- Chrome/metal for tonearm -->
            <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#e8e8e8" />
                <stop offset="30%" stop-color="#c0c0c0" />
                <stop offset="50%" stop-color="#a0a0a0" />
                <stop offset="70%" stop-color="#c0c0c0" />
                <stop offset="100%" stop-color="#e8e8e8" />
            </linearGradient>

            <!-- Shadow filter -->
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
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
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        <!-- Turntable base (wood) -->
        <rect
            x="20"
            y="20"
            width="460"
            height="460"
            rx="12"
            fill="url(#woodGrad)"
            filter="url(#shadow)"
        />

        <!-- Base top surface -->
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

        <!-- Platter base -->
        <circle
            cx="220"
            cy="250"
            r="175"
            fill="url(#platterGrad)"
            filter="url(#shadow)"
        />

        <!-- Platter rim -->
        <circle
            cx="220"
            cy="250"
            r="170"
            fill="none"
            stroke="#4a4a4a"
            stroke-width="3"
        />

        <!-- Rubber mat -->
        <circle cx="220" cy="250" r="165" fill="#1f1f1f" />
        <circle
            cx="220"
            cy="250"
            r="165"
            fill="none"
            stroke="#333"
            stroke-width="0.5"
        />

        <!-- Vinyl record group (rotates) -->
        <g transform="rotate({rotation}, 220, 250)">
            <!-- Vinyl disc -->
            <circle cx="220" cy="250" r="155" fill="url(#vinylGrad)" />

            <!-- Vinyl grooves -->
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

            <!-- Vinyl shine overlay -->
            <circle cx="220" cy="250" r="155" fill="url(#vinylShine)" />

            <!-- Vinyl edge highlight -->
            <circle
                cx="220"
                cy="250"
                r="155"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="1"
            />

            <!-- Label area -->
            <circle cx="220" cy="250" r="45" fill="url(#labelGrad)" />
            <circle
                cx="220"
                cy="250"
                r="45"
                fill="none"
                stroke="#e85555"
                stroke-width="1"
            />

            <!-- Label text -->
            <text
                x="220"
                y="235"
                text-anchor="middle"
                fill="#fff"
                font-size="8"
                font-weight="700"
                font-family="var(--font-serif)"
            >
                HACHIMI
            </text>
            <text
                x="220"
                y="248"
                text-anchor="middle"
                fill="rgba(255,255,255,0.9)"
                font-size="6"
            >
                ハチミツ
            </text>
            <text
                x="220"
                y="262"
                text-anchor="middle"
                fill="rgba(255,255,255,0.7)"
                font-size="5"
            >
                33⅓ RPM
            </text>

            <!-- Center spindle hole -->
            <circle cx="220" cy="250" r="4" fill="#1a1a1a" />
            <circle cx="220" cy="250" r="3" fill="#0a0a0a" />
        </g>

        <!-- Spindle -->
        <circle cx="220" cy="250" r="5" fill="#666" />
        <circle cx="220" cy="250" r="3" fill="#888" />
        <circle cx="220" cy="250" r="1.5" fill="#aaa" />

        <!-- Tonearm assembly - pivot at top-right, arm extends to record -->
        <g
            transform="rotate({tonearmAngle}, 420, 100)"
            style="transition: transform 0.8s ease-out;"
        >
            <!-- Tonearm base/pivot -->
            <circle cx="420" cy="100" r="22" fill="#2a2a2a" />
            <circle cx="420" cy="100" r="17" fill="url(#chromeGrad)" />
            <circle cx="420" cy="100" r="9" fill="#333" />

            <!-- Counterweight (behind pivot) -->
            <ellipse cx="450" cy="100" rx="14" ry="11" fill="#333" />
            <ellipse cx="450" cy="100" rx="11" ry="9" fill="#555" />

            <!-- Tonearm - main tube (extends from pivot toward record) -->
            <line
                x1="420"
                y1="100"
                x2="260"
                y2="220"
                stroke="url(#chromeGrad)"
                stroke-width="6"
                stroke-linecap="round"
            />

            <!-- Tonearm elbow joint -->
            <circle cx="260" cy="220" r="6" fill="url(#chromeGrad)" />

            <!-- Headshell (angled piece holding cartridge) -->
            <g transform="translate(260, 220) rotate(-45)">
                <!-- Headshell body -->
                <rect
                    x="-5"
                    y="-4"
                    width="35"
                    height="8"
                    rx="2"
                    fill="url(#chromeGrad)"
                />

                <!-- Cartridge mount -->
                <rect
                    x="25"
                    y="-6"
                    width="22"
                    height="12"
                    rx="2"
                    fill="#1a1a1a"
                />

                <!-- Cartridge body -->
                <rect x="28" y="-4" width="16" height="8" rx="1" fill="#333" />

                <!-- Stylus cantilever -->
                <line
                    x1="44"
                    y1="0"
                    x2="52"
                    y2="8"
                    stroke="#888"
                    stroke-width="1"
                />

                <!-- Stylus tip (diamond) -->
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
            <text x="0" y="25" text-anchor="middle" fill="#666" font-size="8"
                >33/45</text
            >
        </g>

        <!-- Power indicator -->
        <g transform="translate(80, 420)">
            <circle cx="0" cy="0" r="6" fill="#1a1a1a" />
            <circle
                cx="0"
                cy="0"
                r="4"
                fill={isPlaying ? "#4ade80" : "#333"}
                class="power-led"
            />
            <text x="0" y="18" text-anchor="middle" fill="#666" font-size="7"
                >POWER</text
            >
        </g>

        <!-- Brand label -->
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

    <!-- Play button -->
    <div class="controls">
        <button
            class="play-btn"
            on:click={togglePlay}
            class:playing={isPlaying}
        >
            {#if isPlaying}
                <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span>暂停</span>
            {:else}
                <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span>播放唱片</span>
            {/if}
        </button>
    </div>

    <!-- Info card -->
    {#if showComparison}
        <div class="insight">
            <p>
                <strong>🎵 洗脑的秘密</strong><br />
                原版仅出现 <span class="highlight">1-2次</span> 的"哈基米"，
                经过 Remix 的 <span class="highlight accent">高频重复</span>，
                成为了风靡全网的听觉符号。
            </p>
        </div>
    {/if}
</div>

<style>
    .turntable-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }

    .turntable-svg {
        width: 100%;
        height: auto;
        border-radius: 12px;
    }

    .power-led {
        transition: fill 0.3s ease;
        filter: drop-shadow(0 0 4px currentColor);
    }

    .controls {
        display: flex;
        justify-content: center;
    }

    .play-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 9999px;
        font-weight: 600;
        font-size: var(--font-size-sm);
        cursor: pointer;
        transition: all var(--transition-normal);
    }

    .play-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    }

    .play-btn.playing {
        background: var(--color-accent-secondary);
    }

    .play-btn.playing:hover {
        box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
    }

    .insight {
        background: var(--step-bg);
        border: 1px solid var(--step-border);
        border-radius: var(--step-radius);
        padding: var(--space-4) var(--space-6);
        text-align: center;
        font-size: var(--font-size-sm);
        line-height: 1.7;
        box-shadow: var(--step-shadow);
    }

    .insight .highlight {
        color: var(--color-cat);
        font-weight: 600;
    }

    .insight .highlight.accent {
        color: var(--color-accent);
    }

    @media (max-width: 480px) {
        .turntable-container {
            max-width: 320px;
        }
    }
</style>
