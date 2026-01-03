<script>
    import { onMount, onDestroy } from "svelte";
    import { fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { tweened } from "svelte/motion";
    import {
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter,
        forceCollide,
    } from "d3-force";
    import { scaleLinear, scaleSqrt } from "d3-scale";

    /** @type {{nodes: any[], links: any[]}} */
    export let data = { nodes: [], links: [] };

    /** @type {number} */
    export let width = 700;

    /** @type {number} */
    export let height = 600;

    /** @type {any[]} */
    let nodes = [];
    /** @type {any[]} */
    let links = [];
    /** @type {any} */
    let hoveredNode = null; // Only for visual highlighting, not panel
    /** @type {any} */
    let lockedNode = null;
    let isSimulationDone = false;
    let hasInteracted = false; // Track if user has interacted with any node
    let simulation = null;
    let animationFrame = null;

    // Panel only shows for clicked (locked) node
    $: activeNode = lockedNode;

    $: radiusScale = scaleSqrt()
        .domain([0, Math.max(...data.nodes.map((n) => n.count || 1))])
        .range([20, 80]);

    $: linkWidthScale = scaleLinear().domain([0, 1]).range([2, 14]);

    // Get radius - enlarged when active
    function getRadius(node) {
        const baseRadius = radiusScale(node.count);
        if (activeNode?.id === node.id) {
            return baseRadius * 1.15; // 15% larger when active
        }
        return baseRadius;
    }

    onMount(() => {
        nodes = data.nodes.map((n, i) => ({
            ...n,
            // Center node fixed at center, others spread around
            x: n.isCenter ? width / 2 : width / 2 + Math.cos(i * 0.5) * 100,
            y: n.isCenter ? height / 2 : height / 2 + Math.sin(i * 0.5) * 100,
            // Fix center node position (fx/fy prevent movement)
            fx: n.isCenter ? width / 2 : null,
            fy: n.isCenter ? height / 2 : null,
        }));

        links = data.links.map((l) => ({
            ...l,
            source: l.source,
            target: l.target,
        }));

        simulation = forceSimulation(nodes)
            .force(
                "link",
                forceLink(links)
                    .id((d) => d.id)
                    .distance(200)
                    .strength(0.2),
            )
            .force("charge", forceManyBody().strength(-650))
            .force("center", forceCenter(width / 2, height / 2))
            .force(
                "collide",
                forceCollide().radius((d) => radiusScale(d.count) + 20),
            )
            .alphaDecay(0.02)
            .velocityDecay(0.4);

        // Run initial layout
        for (let i = 0; i < 120; i++) {
            simulation.tick();
        }

        nodes = [...nodes];
        links = [...links];
        isSimulationDone = true;

        // Start gentle continuous animation
        startGentleAnimation();
    });

    onDestroy(() => {
        simulation?.stop();
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });

    function startGentleAnimation() {
        // Gentle "breathing" effect - very subtle position adjustments
        let time = 0;
        const basePositions = nodes.map((n) => ({ x: n.x, y: n.y }));

        function animate() {
            time += 0.015; // Slow animation speed

            nodes = nodes.map((node, i) => {
                if (node.isCenter) return node; // Center node stays fixed

                const base = basePositions[i];
                // Very subtle oscillation (max 2-3 pixels)
                const offsetX = Math.sin(time + i * 0.7) * 2;
                const offsetY = Math.cos(time + i * 0.5) * 2;

                return {
                    ...node,
                    x: base.x + offsetX,
                    y: base.y + offsetY,
                };
            });

            animationFrame = requestAnimationFrame(animate);
        }

        animate();
    }

    // Hover for visual highlighting only
    function handleNodeEnter(node) {
        hoveredNode = node;
    }

    function handleNodeLeave() {
        hoveredNode = null;
    }

    // Click to show panel and trigger slide
    function handleNodeClick(node) {
        if (!hasInteracted) hasInteracted = true;
        if (lockedNode?.id === node.id) {
            lockedNode = null;
        } else {
            lockedNode = node;
        }
    }

    function handleContainerLeave() {
        hoveredNode = null;
    }

    function isLinkActive(link) {
        if (!activeNode) return false;
        const srcId =
            typeof link.source === "object" ? link.source.id : link.source;
        const tgtId =
            typeof link.target === "object" ? link.target.id : link.target;
        return srcId === activeNode.id || tgtId === activeNode.id;
    }

    function isNodeConnected(node) {
        if (!activeNode) return true;
        if (node.id === activeNode.id) return true;
        return links.some((l) => {
            const srcId = typeof l.source === "object" ? l.source.id : l.source;
            const tgtId = typeof l.target === "object" ? l.target.id : l.target;
            return (
                (srcId === activeNode.id && tgtId === node.id) ||
                (tgtId === activeNode.id && srcId === node.id)
            );
        });
    }

    function formatCount(count) {
        return count.toLocaleString();
    }

    // Extract BV ID from Bilibili URL
    function extractBvid(url) {
        const match = url?.match(/BV[a-zA-Z0-9]+/);
        return match ? match[0] : null;
    }

    // Track loaded iframes - show loading until iframe fires onload
    let loadedIframes = {};

    function handleIframeLoad(bvid) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
            loadedIframes[bvid] = true;
            loadedIframes = { ...loadedIframes };
        }, 300);
    }

    // Reset loaded state when active node changes
    $: if (activeNode) {
        loadedIframes = {};
    }

    $: isPanelOpen = !!lockedNode;

    $: centerNode = data.nodes.find((n) => n.isCenter);
    $: totalCount = centerNode
        ? centerNode.count
        : data.nodes.reduce((a, b) => a + (b.count || 0), 0);

    const displayedCount = tweened(0, {
        duration: 2000,
        easing: quintOut,
    });

    $: displayedCount.set(totalCount);
</script>

{#if isSimulationDone}
    <div
        class="network-wrapper"
        class:panel-open={isPanelOpen}
        on:mouseleave={handleContainerLeave}
        role="region"
        aria-label="标签关联网络图"
    >
        <div class="chart-title">
            B站目前共有 <span class="highlight"
                >{Math.round($displayedCount).toLocaleString()}</span
            > 个哈基米相关视频
        </div>
        <div class="graph-container">
            <svg {width} {height} class="network-svg">
                <!-- Links -->
                {#each links as link}
                    {@const sx =
                        typeof link.source === "object" ? link.source.x : 0}
                    {@const sy =
                        typeof link.source === "object" ? link.source.y : 0}
                    {@const tx =
                        typeof link.target === "object" ? link.target.x : 0}
                    {@const ty =
                        typeof link.target === "object" ? link.target.y : 0}
                    {@const srcId =
                        typeof link.source === "object"
                            ? link.source.id
                            : link.source}
                    {@const tgtId =
                        typeof link.target === "object"
                            ? link.target.id
                            : link.target}
                    {@const isConnectedToCenter =
                        srcId === "hachimi-center" ||
                        tgtId === "hachimi-center"}
                    <line
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke={isLinkActive(link)
                            ? "#ff6b6b"
                            : isConnectedToCenter
                              ? "#ff6b6b"
                              : "#ccc"}
                        stroke-width={isLinkActive(link)
                            ? linkWidthScale(link.weight) * 2
                            : linkWidthScale(link.weight)}
                        opacity={activeNode
                            ? isLinkActive(link)
                                ? 0.85
                                : 0.1
                            : isConnectedToCenter
                              ? 0.5
                              : 0.3}
                        class="link-line"
                    />
                {/each}

                <!-- Nodes -->
                {#each nodes as node (node.id)}
                    <g
                        transform="translate({node.x}, {node.y})"
                        class="node-group"
                        class:dimmed={activeNode && !isNodeConnected(node)}
                        class:active={activeNode?.id === node.id}
                        class:locked={lockedNode?.id === node.id}
                        on:mouseenter={() => handleNodeEnter(node)}
                        on:mouseleave={handleNodeLeave}
                        on:click={() => handleNodeClick(node)}
                        on:keydown={(e) =>
                            e.key === "Enter" && handleNodeClick(node)}
                        role="button"
                        tabindex="0"
                    >
                        {#if !node.isCenter}
                            <title>点击查看相关视频</title>
                        {/if}
                        <circle
                            r={getRadius(node)}
                            fill={node.isCenter
                                ? "#ff6b6b"
                                : activeNode?.id === node.id
                                  ? "#ffe0e0"
                                  : "#fff"}
                            stroke={node.isCenter
                                ? "#ff6b6b"
                                : activeNode?.id === node.id
                                  ? "#ff6b6b"
                                  : "#e0e0e0"}
                            stroke-width={node.isCenter
                                ? 3
                                : lockedNode?.id === node.id
                                  ? 2.5
                                  : 1.5}
                            class="node-circle"
                        />
                        <text
                            text-anchor="middle"
                            dominant-baseline="middle"
                            font-size={node.isCenter
                                ? 18
                                : activeNode?.id === node.id
                                  ? 16
                                  : 14}
                            font-weight={node.isCenter
                                ? 700
                                : activeNode?.id === node.id
                                  ? 600
                                  : 500}
                            fill="#333"
                            class="node-label"
                        >
                            {node.label}
                        </text>
                        {#if !node.isCenter}
                            <text
                                y={getRadius(node) + 16}
                                text-anchor="middle"
                                font-size="11"
                                fill="#888"
                                class="node-count"
                            >
                                {formatCount(node.count)}
                            </text>
                        {/if}
                    </g>
                {/each}
            </svg>
        </div>

        <!-- Video Panel (click-only) -->
        {#if activeNode && activeNode.videos && activeNode.videos.length > 0}
            <div
                class="video-panel locked"
                role="dialog"
                aria-label="相关视频"
                transition:fly={{ x: 50, duration: 600, easing: quintOut }}
            >
                <div class="panel-head">
                    <span class="tag-badge">{activeNode.label}</span>
                    <span class="count-text"
                        >{formatCount(activeNode.count)} 视频</span
                    >
                    {#if lockedNode}
                        <button
                            class="close-btn"
                            on:click={() => (lockedNode = null)}>×</button
                        >
                    {/if}
                </div>
                <div class="video-embeds">
                    {#each activeNode.videos
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 4) as video}
                        {@const bvid = extractBvid(video.url)}
                        {#if bvid}
                            <div class="video-embed">
                                <div class="iframe-container">
                                    {#if !loadedIframes[bvid]}
                                        <div class="iframe-loading">
                                            <span class="loading-spinner"
                                            ></span>
                                            <span>加载中...</span>
                                        </div>
                                    {/if}
                                    <iframe
                                        src="//player.bilibili.com/player.html?bvid={bvid}&page=1&as_wide=1&danmaku=0"
                                        scrolling="no"
                                        border="0"
                                        frameborder="no"
                                        framespacing="0"
                                        allowfullscreen="true"
                                        title={video.title}
                                        on:load={() => handleIframeLoad(bvid)}
                                    ></iframe>
                                </div>
                                <div class="video-meta">
                                    <span class="video-title"
                                        >{video.title}</span
                                    >
                                    <span class="video-views"
                                        >{video.view_count}</span
                                    >
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
                {#if !lockedNode}
                    <p class="hint">点击节点可固定面板</p>
                {/if}
            </div>
        {/if}
        <div class="data-source">数据统计截止日期：2025-12-10</div>
    </div>
{:else}
    <div class="loading">加载中...</div>
{/if}

<style>
    .chart-title {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-family: "Source Han Serif SC", "Noto Serif SC", "SimSun", serif;
        font-size: 28px;
        font-weight: 900;
        color: #333;
        z-index: 5;
        pointer-events: none;
        letter-spacing: 0.05em;
    }

    .highlight {
        color: #ff6b6b;
        font-family: "D-DIN", "Impact", "Arial Black", sans-serif;
        font-size: 42px;
        font-weight: 700;
        margin: 0 6px;
        display: inline-block;
        min-width: 120px; /* Prevent layout shift */
        text-align: center;
    }

    .network-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0;
        min-width: 100%;
    }

    .data-source {
        position: absolute;
        bottom: -20px;
        left: 0;
        right: 0;
        text-align: center;
        font-family: inherit;
        font-size: 14px;
        color: #999;
        font-weight: 500;
        pointer-events: none;
    }

    .graph-container {
        flex-shrink: 0;
        will-change: transform;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        margin-left: auto;
        margin-right: auto;
        z-index: 1;
    }

    .network-wrapper.panel-open .graph-container {
        transform: translateX(-180px);
    }

    .network-svg {
        overflow: visible;
    }

    .node-group {
        cursor: pointer;
        outline: none; /* Remove focus outline */
    }

    .node-group:focus {
        outline: none;
    }

    .node-group.dimmed {
        opacity: 0.2;
    }

    .node-circle {
        transform-origin: center;
        transform-box: fill-box;
        transition:
            r 0.2s ease,
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            fill 0.15s ease,
            stroke 0.15s ease,
            stroke-width 0.15s ease;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .node-group:hover .node-circle {
        transform: scale(1.15);
        stroke: #ff6b6b;
        stroke-width: 2px;
        filter: drop-shadow(0 4px 12px rgba(255, 107, 107, 0.3));
    }

    .node-group.active .node-circle {
        filter: drop-shadow(0 3px 10px rgba(255, 107, 107, 0.35));
    }

    .node-group.locked .node-circle {
        filter: drop-shadow(0 4px 14px rgba(255, 107, 107, 0.45));
    }

    .node-label,
    .node-count {
        pointer-events: none;
        user-select: none;
        transition: font-size 0.2s ease;
    }

    .link-line {
        transition:
            stroke 0.2s ease,
            stroke-width 0.2s ease,
            opacity 0.2s ease;
    }

    .video-panel {
        /* Absolute positioning for smooth slide effect */
        position: absolute;
        left: 50%;
        margin-left: 80px;
        top: 0;
        bottom: 0;
        margin-top: auto;
        margin-bottom: auto;
        height: fit-content;
        max-height: 90vh;
        z-index: 10;

        width: 520px;
        overflow-y: auto;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 14px 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    }

    .video-panel.locked {
        border-color: #ff6b6b;
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.15);
    }

    .panel-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
    }

    .tag-badge {
        background: #ff6b6b;
        color: #fff;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
    }

    .count-text {
        color: #888;
        font-size: 12px;
        flex: 1;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
    }

    .close-btn:hover {
        color: #ff6b6b;
    }

    .video-embeds {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .video-embed {
        background: #f8f8f8;
        border-radius: 8px;
        overflow: hidden;
    }

    .iframe-container {
        position: relative;
        width: 100%;
        height: 140px;
    }

    .iframe-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #f5f5f5;
        color: #666;
        font-size: 13px;
        z-index: 10; /* Above iframe */
    }

    .loading-spinner {
        width: 28px;
        height: 28px;
        border: 3px solid #e0e0e0;
        border-top-color: #ff6b6b;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .video-embed iframe {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1; /* Below loading */
        width: 100%;
        height: 100%;
        display: block;
        border: none;
        background: #000;
    }

    .video-meta {
        padding: 8px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
    }

    .video-title {
        font-size: 12px;
        color: #333;
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .video-views {
        font-size: 11px;
        color: #ff6b6b;
        font-weight: 500;
        flex-shrink: 0;
    }

    .hint {
        margin: 10px 0 0;
        font-size: 10px;
        color: #bbb;
        text-align: center;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        color: #999;
    }

    @media (max-width: 900px) {
        .network-wrapper.panel-open .graph-container {
            transform: none;
        }

        .video-panel {
            position: absolute;
            right: auto;
            left: 50%;
            top: auto;
            bottom: 10px;
            transform: translateX(-50%);
            width: 90%;
            max-width: 320px;

            /* Reset desktop styles */
            margin-left: 0;
            margin-top: 0;
            margin-bottom: 0;
            height: auto;
            max-height: 70vh;
        }
    }
</style>
