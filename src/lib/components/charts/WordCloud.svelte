<script>
    import { scaleSqrt } from "d3-scale";

    /** @type {Array<{word: string, frequency: number}>} */
    export let data = [];

    /** @type {number} */
    export let width = 500;

    /** @type {number} */
    export let height = 300;

    let hoveredWord = null;

    $: fontScale = scaleSqrt()
        .domain([
            Math.min(...data.map((d) => d.frequency)),
            Math.max(...data.map((d) => d.frequency)),
        ])
        .range([14, 48]);

    $: positions = generatePositions(data, width, height);

    function generatePositions(words, w, h) {
        const result = [];
        const padding = 8;
        const centerX = w / 2;
        const centerY = h / 2;

        // Sort by frequency (highest first for center placement)
        const sorted = [...words].sort((a, b) => b.frequency - a.frequency);

        // Spiral placement algorithm (simplified)
        let angle = 0;
        let radius = 0;
        const angleStep = 0.5;
        const radiusStep = 8;

        for (let i = 0; i < sorted.length; i++) {
            const word = sorted[i];
            const fontSize = fontScale(word.frequency);

            // First word goes to center
            if (i === 0) {
                result.push({
                    ...word,
                    x: centerX,
                    y: centerY,
                    fontSize,
                    rotate: 0,
                });
            } else {
                // Spiral outward
                angle += angleStep;
                radius += radiusStep * (1 / (i + 1));

                const x = centerX + Math.cos(angle) * radius * (1 + i * 0.3);
                const y = centerY + Math.sin(angle) * radius * (0.6 + i * 0.15);

                result.push({
                    ...word,
                    x: Math.max(fontSize, Math.min(w - fontSize, x)),
                    y: Math.max(fontSize, Math.min(h - fontSize, y)),
                    fontSize,
                    rotate: (Math.random() - 0.5) * 20,
                });
            }
        }

        return result;
    }

    const colors = [
        "var(--color-accent)",
        "var(--color-accent-secondary)",
        "var(--color-cat)",
        "var(--color-other)",
        "var(--color-text)",
    ];
</script>

<div class="wordcloud-container" style="width: {width}px; height: {height}px;">
    <svg {width} {height} role="img" aria-label="评论高频词云">
        <title>评论热词云图</title>
        {#each positions as word, i}
            <text
                x={word.x}
                y={word.y}
                font-size={word.fontSize}
                fill={colors[i % colors.length]}
                text-anchor="middle"
                dominant-baseline="middle"
                transform="rotate({word.rotate}, {word.x}, {word.y})"
                class="word"
                class:is-hovered={hoveredWord === word.word}
                style="--delay: {i * 50}ms"
                on:mouseenter={() => (hoveredWord = word.word)}
                on:mouseleave={() => (hoveredWord = null)}
                role="button"
                tabindex="0"
            >
                {word.word}
            </text>
        {/each}
    </svg>

    {#if hoveredWord}
        {@const wordData = data.find((d) => d.word === hoveredWord)}
        <div class="tooltip glass-card">
            <span class="word-label">{hoveredWord}</span>
            <span class="frequency"
                >{wordData?.frequency.toLocaleString()} 次提及</span
            >
        </div>
    {/if}
</div>

<style>
    .wordcloud-container {
        position: relative;
    }

    svg {
        overflow: visible;
    }

    .word {
        cursor: pointer;
        transition: all var(--transition-fast);
        opacity: 0;
        animation: fadeInWord 0.4s ease-out forwards;
        animation-delay: var(--delay);
    }

    .word:hover,
    .word.is-hovered {
        transform: scale(1.1);
        filter: brightness(1.2);
    }

    .tooltip {
        position: absolute;
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
        padding: var(--space-3) var(--space-4);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        animation: fadeIn 0.2s ease-out;
    }

    .word-label {
        font-weight: 600;
        color: var(--color-text);
    }

    .frequency {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    @keyframes fadeInWord {
        from {
            opacity: 0;
            transform: scale(0.5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
