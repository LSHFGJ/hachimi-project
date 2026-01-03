<script>
    import { onMount } from "svelte";
    import commentsData from "$lib/data/top1_video_comments_with_uid.json";

    // Get comments from the JSON file
    const comments = commentsData.top100_hot_comments || [];

    // Configuration
    const NUM_ROWS = 3; // Reduced to 3 rows as requested
    const ROW_HEIGHT = 45;

    // Distribute comments into rows randomly to prevent identical patterns
    /** @type {Array<Array<{content: string, id: number}>>} */
    let rows = [];

    // Initialize rows
    rows = Array.from({ length: NUM_ROWS }, (_, i) => {
        const rowComments = [];
        // Pick random comments for each row
        const rowCount = 20; // Number of comments per row
        for (let j = 0; j < rowCount; j++) {
            const randomComment =
                comments[Math.floor(Math.random() * comments.length)];
            rowComments.push({
                content: randomComment.content,
                id: i * 1000 + j,
            });
        }
        return rowComments;
    });

    /** @param {number} rowIndex */
    function getRowTop(rowIndex) {
        // Center the 3 rows vertically in the container
        const totalHeight = NUM_ROWS * ROW_HEIGHT;
        const startY = `calc(50% - ${totalHeight / 2}px + ${rowIndex * ROW_HEIGHT}px)`;
        return startY;
    }

    /** @param {number} rowIndex */
    function getAnimationDuration(rowIndex) {
        return `${30 + rowIndex * 5}s`;
    }

    /** @param {number} rowIndex */
    function getDirection(rowIndex) {
        return rowIndex % 2 === 0 ? "normal" : "reverse";
    }
</script>

<div class="danmaku-container">
    {#each rows as row, rowIndex}
        <div class="danmaku-row" style="top: {getRowTop(rowIndex)};">
            <!-- Track wrapper for scrolling -->
            <div
                class="danmaku-track"
                style="animation-duration: {getAnimationDuration(
                    rowIndex,
                )}; animation-direction: {getDirection(rowIndex)};"
            >
                <!-- Original Set -->
                {#each row as item (item.id)}
                    <span class="danmaku-text">{item.content}</span>
                {/each}

                <!-- Duplicate Set for Seamless Loop -->
                {#each row as item (item.id + 10000)}
                    <span class="danmaku-text">{item.content}</span>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    .danmaku-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 1; /* Clearly clearly behind content (z-2) but above background */
        opacity: 1; /* Fully opaque container */
        /* Relaxed mask */
        mask-image: linear-gradient(
            to bottom,
            transparent,
            black 10%,
            black 90%,
            transparent
        );
        -webkit-mask-image: linear-gradient(
            to bottom,
            transparent,
            black 10%,
            black 90%,
            transparent
        );
    }

    .danmaku-row {
        position: absolute;
        left: 0;
        right: 0;
        height: 45px;
        display: flex;
        align-items: center;
        overflow: hidden;
    }

    .danmaku-track {
        display: flex;
        gap: 60px;
        white-space: nowrap;
        animation: scroll-linear linear infinite;
        padding-right: 60px;
        width: max-content;
    }

    .danmaku-text {
        font-size: 20px;
        font-weight: 700;
        color: #9c9288; /* Visible, solid dark beige-grey */
        flex-shrink: 0;
        user-select: none;
    }

    @keyframes scroll-linear {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }

    @media (max-width: 768px) {
        .danmaku-text {
            font-size: 16px;
        }
        .danmaku-track {
            gap: 40px;
            padding-right: 40px;
        }
    }
</style>
