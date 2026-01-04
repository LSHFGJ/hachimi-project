<script>
    import { scaleLinear } from "d3-scale";
    import { min, max } from "d3-array";

    /** @type {Array<{date: string, open: number, high: number, low: number, close: number, volume: number, change_pct: number | string}>} */
    export let data = [];

    /** @type {number} */
    export let width = 800;

    /** @type {number} */
    export let height = 600;

    /** @type {string} */
    export let eventDate = "2025-11-13";

    // Ensure data is sorted by date ascending (old -> new) using string comparison
    $: sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    // Center the view around the event date to ensure visibility
    $: eventIndexInSorted = sortedData.findIndex((d) => d.date === eventDate);
    // If found, show 15 days before and 15 days after (total ~30 days)
    // Then we truncate the last 5 days as requested by modifying sliceEnd
    $: sliceStart =
        eventIndexInSorted !== -1
            ? Math.max(0, eventIndexInSorted - 15)
            : Math.max(0, sortedData.length - 35);
    $: sliceEnd =
        eventIndexInSorted !== -1
            ? Math.min(sortedData.length, eventIndexInSorted + 20)
            : sortedData.length;

    // Explicitly exclude the last 5 days from the determined range to create space/cut off end
    $: finalSliceEnd = Math.max(sliceStart + 1, sliceEnd - 5);
    $: recentData = sortedData.slice(sliceStart, finalSliceEnd);

    /** @type {{x: number, y: number, d: any} | null} */
    let tooltipData = null;

    function handleMouseEnter(d, i) {
        tooltipData = {
            d,
            x: getX(i),
            y: yScale(d.high),
        };
    }

    function handleMouseLeave() {
        tooltipData = null;
    }

    $: priceExtent = [
        min(recentData, (/** @type {{low: number}} */ d) => d.low) * 0.98,
        max(recentData, (/** @type {{high: number}} */ d) => d.high) * 1.02,
    ];

    $: yScale = scaleLinear()
        .domain(priceExtent)
        .range([height * 0.85, height * 0.1]);

    $: volumeScale = scaleLinear()
        .domain([
            0,
            max(recentData, (/** @type {{volume: number}} */ d) => d.volume),
        ])
        .range([0, height * 0.15]);

    // Use a fixed width calculation based on the ORIGINAL slice size (before cutting 5 days)
    // to "fix" the chart in place and create empty space on the right
    $: candleWidth = (width * 0.9) / (sliceEnd - sliceStart);
    $: candleGap = candleWidth * 0.2;

    // Find event date index in the SLICED data
    $: eventIndex = recentData.findIndex((d) => d.date === eventDate);

    /**
     * @param {number} index
     */
    function getX(index) {
        return width * 0.05 + index * candleWidth;
    }

    /**
     * @param {{ date: string; open: number; high: number; low: number; close: number; volume: number; change_pct: number | string; }} d
     * @param {boolean} isUp
     */
    function getCandleColor(d, isUp) {
        // Highlight event-related candles slightly but keep it clean
        if (d.date === eventDate) {
            return "#ff0000"; // Explicitly red for the event date
        }
        return isUp ? "#e74c3c" : "#27ae60";
    }
</script>

<div
    class="candlestick-container"
    style="width: {width}px; height: {height}px;"
>
    <!-- Date Range Indicator REMOVED -->

    <svg {width} {height} class="candlestick-chart">
        <defs>
            <!-- Glow filter for highlighted candles -->
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <!-- Shadow for depth -->
            <filter
                id="dropShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
            >
                <feDropShadow
                    dx="2"
                    dy="4"
                    stdDeviation="3"
                    flood-opacity="0.15"
                />
            </filter>
        </defs>

        <!-- Volume bars (background layer) -->
        {#each recentData as d, i}
            {@const isUp = d.close >= d.open}
            {@const x = getX(i)}
            {@const volHeight = volumeScale(d.volume)}
            <rect
                {x}
                y={height - volHeight - 15}
                width={candleWidth - candleGap}
                height={volHeight}
                fill={isUp
                    ? "rgba(231, 76, 60, 0.2)"
                    : "rgba(39, 174, 96, 0.2)"}
                class="volume-bar"
                style="--delay: {i * 20}ms"
            />
        {/each}

        <!-- Candlesticks -->
        {#each recentData as d, i}
            {@const isUp = d.close >= d.open}
            /* Snap x to grid to strictly align pixels */
            {@const rawX = getX(i)}
            {@const x = Math.floor(rawX)}

            {@const bodyTop = yScale(Math.max(d.open, d.close))}
            {@const bodyBottom = yScale(Math.min(d.open, d.close))}
            {@const bodyHeight = Math.max(1, bodyBottom - bodyTop)}

            {@const wickTop = yScale(d.high)}
            {@const wickBottom = yScale(d.low)}

            {@const baseColor = getCandleColor(d, isUp)}
            {@const isEventCandle = d.date === eventDate}

            /* FORCE ODD INTEGER WIDTH for perfect center alignment */ /* If
            width is even, the center falls on a pixel boundary (e.g. 2.0),
            making 1px line fuzzy or offset */ /* If width is odd, the center
            falls on a half-pixel (e.g. 1.5), perfectly filling the center pixel
            */
            {@const rawWidth = candleWidth - candleGap}
            {@const intWidth = Math.max(1, Math.floor(rawWidth))}
            {@const bodyWidth = intWidth % 2 === 0 ? intWidth - 1 : intWidth}

            /* Center X is strictly x + half width */ /* Example: x=10, w=3.
            Center=11.5. Line at 11.5 fills pixel 11. Rect fills 10,11,12.
            PERFECT. */
            {@const centerX = x + bodyWidth / 2}

            <g
                class="candle"
                class:event-candle={isEventCandle}
                filter={isEventCandle ? "url(#glow)" : "url(#dropShadow)"}
                style="--delay: {i *
                    25}ms; transform-origin: {centerX}px {bodyBottom}px;"
                on:mouseenter={() => handleMouseEnter(d, i)}
                on:mouseleave={handleMouseLeave}
                role="group"
                aria-label="Candlestick data for {d.date}"
            >
                <!-- Wick (high-low line) -->
                <line
                    x1={centerX}
                    y1={wickTop}
                    x2={centerX}
                    y2={wickBottom}
                    stroke={baseColor}
                    stroke-width="1"
                    shape-rendering="crispEdges"
                />

                <!-- Candle body -->
                <rect
                    {x}
                    y={bodyTop}
                    width={bodyWidth}
                    height={bodyHeight}
                    fill={baseColor}
                />

                <!-- Event Marker Line & Label -->
                {#if isEventCandle}
                    <line
                        x1={centerX}
                        y1={0}
                        x2={centerX}
                        y2={height}
                        stroke="#ff4757"
                        stroke-width="1"
                        stroke-dasharray="4 4"
                        opacity="0.5"
                    />
                    <g class="event-label">
                        <rect
                            x={x + (candleWidth - candleGap) / 2 - 40}
                            y={wickTop - 25}
                            width="80"
                            height="20"
                            rx="4"
                            fill="#ff4757"
                            opacity="0.9"
                        />
                        <text
                            x={x + (candleWidth - candleGap) / 2}
                            y={wickTop - 11}
                            text-anchor="middle"
                            fill="white"
                            font-size="11"
                            font-weight="600"
                        >
                            {d.date}
                        </text>
                    </g>
                {/if}
            </g>
        {/each}

        <!-- Floating price labels -->
        <text
            x={width - 150}
            y={yScale(priceExtent[1])}
            fill="rgba(0,0,0,0.4)"
            font-size="11"
            text-anchor="end"
        >
            ¥{priceExtent[1]?.toFixed(2)}
        </text>
        <text
            x={width - 150}
            y={yScale(priceExtent[0])}
            fill="rgba(0,0,0,0.4)"
            font-size="11"
            text-anchor="end"
        >
            ¥{priceExtent[0]?.toFixed(2)}
        </text>
        <!-- Source Label -->
        <text
            x={width - 120}
            y={height + 20}
            text-anchor="end"
            fill="#999"
            font-size="10px"
            style="font-family: var(--font-sans, sans-serif);"
        >
            数据来源：新浪财经
        </text>
    </svg>

    <!-- Stock name overlay -->
    <div class="stock-label">
        <span class="stock-code">002242</span>
        <span class="stock-name">九阳股份</span>
    </div>

    <!-- Interactive Tooltip -->
    {#if tooltipData}
        <div
            class="chart-tooltip"
            style="left: {tooltipData.x}px; top: {tooltipData.y}px;"
            role="tooltip"
        >
            <div class="tooltip-date">{tooltipData.d.date}</div>
            <div class="tooltip-row">
                <span class="label">开盘</span>
                <span class="value">{tooltipData.d.open}</span>
            </div>
            <div class="tooltip-row">
                <span class="label">收盘</span>
                <span
                    class="value"
                    class:up={tooltipData.d.close >= tooltipData.d.open}
                >
                    {tooltipData.d.close}
                </span>
            </div>
            <div class="tooltip-row">
                <span class="label">最高</span>
                <span class="value">{tooltipData.d.high}</span>
            </div>
            <div class="tooltip-row">
                <span class="label">最低</span>
                <span class="value">{tooltipData.d.low}</span>
            </div>
            <div class="tooltip-row">
                <span class="label">涨跌幅</span>
                <span
                    class="value"
                    class:up={parseFloat(String(tooltipData.d.change_pct)) > 0}
                    class:down={parseFloat(String(tooltipData.d.change_pct)) <
                        0}
                >
                    {parseFloat(String(tooltipData.d.change_pct)) > 0
                        ? "+"
                        : ""}{parseFloat(
                        String(tooltipData.d.change_pct),
                    ).toFixed(2)}%
                </span>
            </div>
        </div>
    {/if}
</div>

<style>
    .candlestick-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .candlestick-chart {
        overflow: visible;
    }

    .candle {
        /* opacity: 0; */
        /* animation: candleFadeIn 0.5s ease-out forwards; */
        /* animation-delay: var(--delay); */
        transition: transform 0.2s;
        cursor: crosshair;
        /* Ensure visible by default */
        opacity: 1;
    }

    .candle:hover {
        transform: scale(1.1);
        z-index: 10;
        filter: brightness(1.2);
    }

    .volume-bar {
        opacity: 0;
        animation: fadeIn 0.4s ease-out forwards;
        animation-delay: var(--delay);
    }

    .event-candle {
        animation: candlePulse 2s ease-in-out infinite;
    }

    .event-label {
        animation: floatUp 1.5s ease-in-out infinite;
    }

    .event-text {
        filter: drop-shadow(0 2px 4px rgba(255, 71, 87, 0.5));
    }

    @keyframes candleFadeIn {
        from {
            opacity: 0;
            transform: translateY(10px) scaleY(0.5);
        }
        to {
            opacity: 1;
            transform: translateY(0) scaleY(1);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 0.8;
        }
    }

    @keyframes candlePulse {
        0%,
        100% {
            filter: url(#glow) drop-shadow(0 0 15px rgba(255, 71, 87, 0.5));
        }
        50% {
            filter: url(#glow) drop-shadow(0 0 30px rgba(255, 71, 87, 0.8));
        }
    }

    @keyframes floatUp {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-6px);
        }
    }

    .stock-label {
        position: absolute;
        top: 20px;
        left: 25px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0.35;
        transition: opacity 0.3s;
    }

    .candlestick-container:hover .stock-label {
        opacity: 0.7;
    }

    .stock-code {
        font-size: 56px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #333;
        line-height: 1;
    }

    .stock-name {
        font-size: 16px;
        font-weight: 500;
        color: #666;
        letter-spacing: 0.05em;
    }

    .chart-tooltip {
        position: absolute;
        transform: translate(-50%, -100%);
        background: rgba(40, 40, 40, 0.95);
        -webkit-backdrop-filter: blur(4px);
        backdrop-filter: blur(4px);
        padding: 10px 14px;
        border-radius: 8px;
        color: white;
        pointer-events: none;
        z-index: 100;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        font-size: 12px;
        white-space: nowrap;
        margin-top: -15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 140px;
    }

    .chart-tooltip::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid rgba(40, 40, 40, 0.95);
    }

    .tooltip-date {
        font-weight: 700;
        margin-bottom: 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 4px;
        color: #ddd;
    }

    .tooltip-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        gap: 12px;
    }

    .tooltip-row .label {
        color: #aaa;
    }

    .tooltip-row .value {
        font-feature-settings: "tnum";
        font-variant-numeric: tabular-nums;
        font-weight: 500;
    }

    .value.up {
        color: #ff4757;
    }

    .value.down {
        color: #2ecc71;
    }
</style>
