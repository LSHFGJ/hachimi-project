<script>
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";

    /** @type {string} */
    export let trackTitle = "";

    /** @type {string} */
    export let month = "";

    /** @type {{title: string, keywords: string[], description: string} | null} */
    export let styleReport = null;

    /** @type {boolean} */
    export let isCorrect = false;

    const dispatch = createEventDispatcher();

    // Swipe gesture state
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const SWIPE_THRESHOLD = 100;

    function handleClose() {
        dispatch("close");
    }

    /** @param {TouchEvent} e */
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        currentY = 0;
        isDragging = true;
    }

    /** @param {TouchEvent} e */
    function handleTouchMove(e) {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) {
            currentY = deltaY;
        }
    }

    /** @param {TouchEvent} e */
    function handleTouchEnd(e) {
        if (currentY > SWIPE_THRESHOLD) {
            handleClose();
        }
        currentY = 0;
        isDragging = false;
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        if (e.key === "Escape") {
            handleClose();
        }
    }

    // Format month for display
    /** @param {string} m */
    function formatMonth(m) {
        if (!m) return "";
        const parts = m.split(".");
        if (parts.length === 2) {
            // Always convert to full year: "24" -> "2024", "25" -> "2025"
            const yearPart = parts[0];
            const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
            return `${year}年${parts[1]}月`;
        }
        return m;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
    class="popup-backdrop"
    transition:fade={{ duration: 200 }}
    on:click={handleClose}
>
    <div
        class="popup-card"
        style="transform: translateY({currentY}px)"
        transition:fly={{ y: 100, duration: 300 }}
        on:click|stopPropagation
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
    >
        <div class="swipe-indicator"></div>

        <button class="close-btn" on:click={handleClose} aria-label="关闭">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
            </svg>
        </button>

        <div
            class="result-badge"
            class:correct={isCorrect}
            class:wrong={!isCorrect}
        >
            {#if isCorrect}
                <span class="badge-text">你猜对了！</span>
            {:else}
                <span class="badge-text">你猜错了！</span>
            {/if}
        </div>

        <div class="track-info">
            <div class="track-label">当前曲目</div>
            <h3 class="track-title">{trackTitle}</h3>
            <div class="track-month">{formatMonth(month)}</div>
        </div>

        {#if styleReport}
            <div class="style-section">
                <div class="style-label">本月风格</div>
                <h2 class="style-title">{styleReport.title}</h2>

                <div class="keywords-container">
                    {#each styleReport.keywords as keyword}
                        <span class="keyword-tag">{keyword}</span>
                    {/each}
                </div>

                <p class="style-description">{styleReport.description}</p>
            </div>
        {/if}

        <div class="bottom-decor"></div>
    </div>
</div>

<style>
    .popup-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 24px;
    }

    .popup-card {
        position: relative;
        width: 100%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        background: linear-gradient(145deg, #2a2520 0%, #1a1512 100%);
        border: 1px solid #4a3f35;
        border-radius: 12px;
        box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        padding: 28px 24px 24px;
        touch-action: pan-y;
    }

    .swipe-indicator {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 36px;
        height: 4px;
        background: #5a5040;
        border-radius: 2px;
        opacity: 0.5;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: #8a7a6a;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .close-btn:hover {
        background: rgba(255, 107, 107, 0.15);
        color: #ff6b6b;
        border-color: rgba(255, 107, 107, 0.25);
    }

    .result-badge {
        display: inline-flex;
        align-items: center;
        padding: 5px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 16px;
    }

    .result-badge.correct {
        background: rgba(78, 205, 196, 0.15);
        color: #4ecdc4;
        border: 1px solid rgba(78, 205, 196, 0.25);
    }

    .result-badge.wrong {
        background: rgba(212, 165, 116, 0.15);
        color: #d4a574;
        border: 1px solid rgba(212, 165, 116, 0.25);
    }

    .track-info {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .track-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6a5a4a;
        margin-bottom: 6px;
    }

    .track-title {
        font-size: 15px;
        font-weight: 600;
        color: #e8e0d8;
        margin: 0 0 8px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .track-month {
        font-size: 13px;
        color: #d4a574;
        font-weight: 600;
    }

    .style-section {
        /* No extra margin needed */
    }

    .style-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6a5a4a;
        margin-bottom: 6px;
    }

    .style-title {
        font-size: 20px;
        font-weight: 700;
        color: #ff6b6b;
        margin: 0 0 14px 0;
        font-family: var(--font-serif);
    }

    .keywords-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
    }

    .keyword-tag {
        display: inline-block;
        padding: 3px 10px;
        background: rgba(90, 80, 64, 0.3);
        border: 1px solid rgba(90, 80, 64, 0.5);
        border-radius: 3px;
        font-size: 11px;
        color: #b0a090;
        font-weight: 500;
    }

    .style-description {
        font-size: 13px;
        line-height: 1.8;
        color: #908070;
        margin: 0;
    }

    .bottom-decor {
        margin-top: 20px;
        height: 2px;
        background: linear-gradient(
            90deg,
            transparent 0%,
            #4a4035 30%,
            #d4a574 50%,
            #4a4035 70%,
            transparent 100%
        );
        border-radius: 1px;
        opacity: 0.4;
    }

    .popup-card::-webkit-scrollbar {
        width: 5px;
    }

    .popup-card::-webkit-scrollbar-track {
        background: transparent;
    }

    .popup-card::-webkit-scrollbar-thumb {
        background: #4a4035;
        border-radius: 2px;
    }
</style>
