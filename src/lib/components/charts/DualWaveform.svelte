<script>
    import { scaleLinear } from "d3-scale";
    import { createEventDispatcher } from "svelte";

    /** @type {number[]} */
    export let timestamps = [];

    /** @type {number} */
    export let duration = 180;

    /** @type {number} */
    export let currentTime = 0;

    /** @type {string|number} */
    export let trackId = "";

    /** @type {number} */
    export let width = 600;

    /** @type {number} */
    export let height = 100;

    const padding = { left: 20, right: 20, top: 30, bottom: 20 };

    $: innerWidth = width - padding.left - padding.right;
    $: waveHeight = height - padding.top - padding.bottom;
    $: xScale = scaleLinear().domain([0, duration]).range([0, innerWidth]);

    // Calculate density-based peak heights
    $: peaks = calculatePeaks(timestamps, duration, innerWidth);

    // Generate background audio waveform path
    $: waveformPath = generateWaveformPath(trackId, innerWidth, waveHeight);

    $: playheadX = xScale(currentTime);

    /**
     * Calculate peak heights based on timestamp density
     * @param {number[]} times
     * @param {number} dur
     * @param {number} w
     */
    function generateWaveformPath(seed, w, h) {
        let numericSeed =
            typeof seed === "string"
                ? seed
                      .split("")
                      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                : Number(seed) || 12345;

        const points = [];
        const steps = Math.ceil(w / 3); // One point every 3 pixels

        let prevY = 0.1;
        const random = () => {
            const x = Math.sin(numericSeed++) * 10000;
            return x - Math.floor(x);
        };

        points.push([0, 0]);

        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * w;
            // Generate height using some noise-like smoothing
            const rawNoise = random();
            let yVal = prevY * 0.6 + rawNoise * 0.4;

            // Enveloping (fade in/out at ends)
            const progress = i / steps;
            const envelope = Math.sin(progress * Math.PI);

            yVal *= envelope;
            prevY = yVal;

            points.push([x, yVal * h * 0.6]); // Max height 60% of container
        }

        points.push([w, 0]);

        // Create Path 'd'
        return (
            points
                .map(
                    (p, i) =>
                        (i === 0 ? "M" : "L") +
                        ` ${p[0].toFixed(1)},${-p[1].toFixed(1)}`,
                )
                .join(" ") + " Z"
        );
    }

    function calculatePeaks(times, dur, w) {
        if (!times || times.length === 0) return [];

        // Group timestamps into bins for density calculation
        const binWidth = 2; // seconds per bin
        const bins = new Map();

        times.forEach((t) => {
            const bin = Math.floor(t / binWidth);
            bins.set(bin, (bins.get(bin) || 0) + 1);
        });

        const maxCount = Math.max(...bins.values(), 1);

        return times.map((t) => ({
            x: xScale(t),
            height:
                (0.3 + 0.7 * (bins.get(Math.floor(t / binWidth)) / maxCount)) *
                waveHeight,
            time: t,
        }));
    }

    const dispatch = createEventDispatcher();

    function handleSeek(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - padding.left;
        // Clamp x within [0, innerWidth]
        const clampedX = Math.max(0, Math.min(x, innerWidth));
        const newTime = xScale.invert(clampedX);
        dispatch("seek", { time: newTime });
    }
</script>

<div class="waveform-container" style="width: {width}px;">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svg
        {width}
        {height}
        class="waveform-svg"
        on:click={handleSeek}
        style="cursor: pointer;"
    >
        <defs>
            <linearGradient id="peakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ff6b6b" />
                <stop offset="100%" stop-color="#ff8a8a" stop-opacity="0.4" />
            </linearGradient>
        </defs>

        <!-- Background -->
        <rect
            x={padding.left - 5}
            y={padding.top - 5}
            width={innerWidth + 10}
            height={waveHeight + 10}
            rx="4"
            fill="#1a1512"
        />

        <!-- Generated Audio Waveform Background -->
        <g transform="translate({padding.left}, {padding.top + waveHeight})">
            <path
                d={waveformPath}
                fill="#2a2520"
                stroke="#3d3530"
                stroke-width="1"
                opacity="0.8"
            />
        </g>

        <!-- Baseline -->
        <line
            x1={padding.left}
            y1={padding.top + waveHeight}
            x2={width - padding.right}
            y2={padding.top + waveHeight}
            stroke="#3d3530"
            stroke-width="1"
        />

        <!-- Waveform peaks (upward from baseline) -->
        <g transform="translate({padding.left}, {padding.top + waveHeight})">
            {#each peaks as peak}
                <rect
                    x={peak.x - 1.5}
                    y={-peak.height}
                    width="3"
                    height={peak.height}
                    fill="url(#peakGrad)"
                    rx="1"
                />
            {/each}
        </g>

        <!-- Playhead -->
        {#if currentTime > 0}
            <line
                x1={padding.left + playheadX}
                y1={padding.top}
                x2={padding.left + playheadX}
                y2={padding.top + waveHeight}
                stroke="#d4a574"
                stroke-width="2"
            />
            <!-- Playhead handle -->
            <circle
                cx={padding.left + playheadX}
                cy={padding.top}
                r="6"
                fill="#d4a574"
                stroke="white"
                stroke-width="2"
                style="cursor: grab;"
            />
        {/if}

        <!-- Time axis labels -->
        <text x={padding.left} y={height - 4} fill="#666" font-size="9">
            0:00
        </text>
        <text
            x={width - padding.right}
            y={height - 4}
            text-anchor="end"
            fill="#666"
            font-size="9"
        >
            {Math.floor(duration / 60)}:{String(
                Math.floor(duration % 60),
            ).padStart(2, "0")}
        </text>
    </svg>
</div>

<style>
    .waveform-container {
        width: 100%;
        display: flex;
        justify-content: center;
        /* No wrapper styles */
    }

    .waveform-svg {
        display: block;
    }
</style>
