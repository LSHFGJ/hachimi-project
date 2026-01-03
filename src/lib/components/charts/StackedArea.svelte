<script>
    import { scaleLinear, scaleTime } from "d3-scale";
    import { area, stack, curveMonotoneX } from "d3-shape";
    import { timeParse } from "d3-time-format";

    /** @type {Array<{date: string, total: number, catRelated: number}>} */
    export let data = [];

    /** @type {number} */
    export let width = 600;

    /** @type {number} */
    export let height = 400;

    /** @type {number} */
    export let activeYear = null;

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const parseDate = timeParse("%Y-%m");

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: processedData = data.map((d) => ({
        date: parseDate(d.date),
        catRelated: d.catRelated,
        other: d.total - d.catRelated,
    }));

    $: xScale = scaleTime()
        .domain([
            processedData[0]?.date || new Date(),
            processedData[processedData.length - 1]?.date || new Date(),
        ])
        .range([0, innerWidth]);

    $: yScale = scaleLinear()
        .domain([0, Math.max(...data.map((d) => d.total)) * 1.1])
        .range([innerHeight, 0]);

    $: stackedData = stack().keys(["catRelated", "other"])(processedData);

    $: areaGenerator = area()
        .x((d) => xScale(d.data.date))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]))
        .curve(curveMonotoneX);

    const colors = ["var(--color-cat)", "var(--color-other)"];
    const labels = ["猫咪相关", "其他"];

    $: xTicks = processedData.filter((_, i) => i % 3 === 0);
    $: yTicks = yScale.ticks(5);
</script>

<svg {width} {height} role="img" aria-label="哈基米视频数量时间轴">
    <title>哈基米视频数量堆叠面积图</title>

    <g transform="translate({margin.left}, {margin.top})">
        <!-- Grid lines -->
        {#each yTicks as tick}
            <line
                x1="0"
                y1={yScale(tick)}
                x2={innerWidth}
                y2={yScale(tick)}
                stroke="rgba(0,0,0,0.06)"
                stroke-dasharray="4,4"
            />
        {/each}

        <!-- Stacked areas with flat colors -->
        {#each stackedData as layer, i}
            <path
                d={areaGenerator(layer)}
                fill={colors[i]}
                fill-opacity="0.8"
                class="area-path"
                style="--delay: {i * 100}ms"
            />
        {/each}

        <!-- X axis -->
        <g transform="translate(0, {innerHeight})">
            <line
                x1="0"
                y1="0"
                x2={innerWidth}
                y2="0"
                stroke="var(--color-text-secondary)"
                opacity="0.3"
            />
            {#each xTicks as d}
                <g transform="translate({xScale(d.date)}, 0)">
                    <line
                        y1="0"
                        y2="6"
                        stroke="var(--color-text-secondary)"
                        opacity="0.5"
                    />
                    <text
                        y="20"
                        text-anchor="middle"
                        fill="var(--color-text-secondary)"
                        font-size="12"
                    >
                        {d.date?.getFullYear()}
                    </text>
                </g>
            {/each}
        </g>

        <!-- Y axis -->
        <g>
            {#each yTicks as tick}
                <text
                    x="-10"
                    y={yScale(tick)}
                    text-anchor="end"
                    dominant-baseline="middle"
                    fill="var(--color-text-secondary)"
                    font-size="11"
                >
                    {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
                </text>
            {/each}
            <text
                transform="rotate(-90)"
                x={-innerHeight / 2}
                y="-45"
                text-anchor="middle"
                fill="var(--color-text-secondary)"
                font-size="12"
            >
                视频数量
            </text>
        </g>

        <!-- Legend -->
        <g transform="translate({innerWidth - 120}, 0)">
            {#each labels as label, i}
                <g transform="translate(0, {i * 22})">
                    <rect width="14" height="14" rx="3" fill={colors[i]} />
                    <text x="20" y="11" fill="var(--color-text)" font-size="12"
                        >{label}</text
                    >
                </g>
            {/each}
        </g>
    </g>
</svg>

<style>
    svg {
        overflow: visible;
    }

    .area-path {
        opacity: 0;
        animation: fadeInArea 0.8s ease-out forwards;
        animation-delay: var(--delay);
    }

    @keyframes fadeInArea {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
