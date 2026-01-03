<script>
    /** @type {number} 0-100 */
    export let progress = 0;

    /** @type {number} */
    export let stage = 0; // 0: initial, 1: product appears, 2: stock spike

    $: tilt = Math.min(20, progress * 0.4 - 10); // -10 to +10 degrees
    $: leftWeight = Math.min(100, progress * 1.2);
    $: rightWeight = stage >= 1 ? Math.min(80, (progress - 40) * 2) : 0;

    const socialIcons = ["📺", "🎵", "📕", "💬", "🔥"];
</script>

<div class="balance-container">
    <svg viewBox="0 0 400 300" class="balance-svg">
        <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--color-accent)" />
                <stop offset="50%" stop-color="var(--color-text-secondary)" />
                <stop
                    offset="100%"
                    stop-color="var(--color-accent-secondary)"
                />
            </linearGradient>
        </defs>

        <!-- Base stand -->
        <path
            d="M180 280 L200 250 L220 280 Z"
            fill="var(--color-bg-card)"
            stroke="var(--color-text-secondary)"
            stroke-width="2"
        />
        <rect
            x="150"
            y="280"
            width="100"
            height="10"
            rx="5"
            fill="var(--color-bg-card)"
        />

        <!-- Fulcrum -->
        <circle cx="200" cy="250" r="8" fill="var(--color-accent)" />

        <!-- Balance beam -->
        <g transform="rotate({tilt}, 200, 250)">
            <rect
                x="50"
                y="245"
                width="300"
                height="10"
                rx="5"
                fill="url(#beamGradient)"
            />

            <!-- Left pan (热度) -->
            <g transform="translate(80, 255)">
                <!-- Chains -->
                <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="40"
                    stroke="var(--color-text-secondary)"
                    stroke-width="2"
                />
                <line
                    x1="60"
                    y1="0"
                    x2="60"
                    y2="40"
                    stroke="var(--color-text-secondary)"
                    stroke-width="2"
                />

                <!-- Pan -->
                <ellipse
                    cx="30"
                    cy="60"
                    rx="50"
                    ry="15"
                    fill="var(--color-bg-card)"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                />

                <!-- Icons falling in -->
                {#each socialIcons.slice(0, Math.ceil(leftWeight / 25)) as icon, i}
                    <text
                        x={15 + (i % 3) * 20}
                        y={50 + Math.floor(i / 3) * 10}
                        font-size="16"
                        class="icon animate-float"
                        style="--float-delay: {i * 200}ms"
                    >
                        {icon}
                    </text>
                {/each}
            </g>

            <!-- Right pan (财富) -->
            <g transform="translate(260, 255)">
                <!-- Chains -->
                <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="40"
                    stroke="var(--color-text-secondary)"
                    stroke-width="2"
                />
                <line
                    x1="60"
                    y1="0"
                    x2="60"
                    y2="40"
                    stroke="var(--color-text-secondary)"
                    stroke-width="2"
                />

                <!-- Pan -->
                <ellipse
                    cx="30"
                    cy="60"
                    rx="50"
                    ry="15"
                    fill="var(--color-bg-card)"
                    stroke="var(--color-accent-secondary)"
                    stroke-width="2"
                />

                <!-- Product and coins -->
                {#if stage >= 1}
                    <text x="20" y="50" font-size="24" class="product-icon"
                        >🧋</text
                    >
                {/if}
                {#if stage >= 2}
                    <text x="35" y="45" font-size="16" class="coin-icon"
                        >💰</text
                    >
                {/if}
            </g>
        </g>

        <!-- Labels -->
        <text
            x="80"
            y="180"
            text-anchor="middle"
            fill="var(--color-accent)"
            font-size="14"
            font-weight="600"
        >
            热度
        </text>
        <text
            x="320"
            y="180"
            text-anchor="middle"
            fill="var(--color-accent-secondary)"
            font-size="14"
            font-weight="600"
        >
            财富
        </text>
    </svg>

    <div class="stats">
        <div class="stat left">
            <span class="label">社交讨论量</span>
            <span class="value"
                >{Math.round(leftWeight * 150).toLocaleString()}</span
            >
        </div>
        {#if stage >= 1}
            <div class="stat right">
                <span class="label">预售量</span>
                <span class="value"
                    >{Math.round(rightWeight * 80).toLocaleString()}</span
                >
            </div>
        {/if}
    </div>
</div>

<style>
    .balance-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
    }

    .balance-svg {
        width: 100%;
        max-width: 400px;
        height: auto;
    }

    .icon {
        animation: float 2s ease-in-out infinite;
        animation-delay: var(--float-delay);
    }

    .product-icon {
        animation: bounceIn 0.5s ease-out;
    }

    .coin-icon {
        animation: sparkle 1s ease-in-out infinite;
    }

    .stats {
        display: flex;
        gap: var(--space-8);
        flex-wrap: wrap;
        justify-content: center;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
    }

    .stat .label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .stat .value {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        font-family: var(--font-display);
    }

    .stat.left .value {
        color: var(--color-accent);
    }

    .stat.right .value {
        color: var(--color-accent-secondary);
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }

    @keyframes bounceIn {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes sparkle {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.7;
            transform: scale(1.1);
        }
    }
</style>
