<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    // import collegeLogo from "$lib/assets/college_logo.png";
    // import matikanetannhauser from "$lib/assets/Matikanetannhauser.png";
    // import maoDie from "$lib/assets/MaoDie.png";

    const collegeLogo = "/missing-asset.png";
    const matikanetannhauser = "/missing-asset.png";
    const maoDie = "/missing-asset.png";

    /** @type {string[]} */
    export let texts = [];

    /** @type {number} */
    export let typingSpeed = 50;

    /** @type {number} */
    export let startPage = 0;

    /** @type {number} */
    export let readerCount = 1;

    const dispatch = createEventDispatcher();

    let currentPage = 0;
    let displayedText = "";
    let isTyping = false;
    let showCursor = true;
    let typingComplete = false;
    let showEndScreen = false;
    let showCredits = false;

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let autoNextTimeout;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let creditsTimeout;
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let typeInterval;

    $: currentText = texts[currentPage] || "";
    $: isLastPage = currentPage === texts.length - 1;

    // Trigger credits animation 2 seconds after end screen appears
    $: if (showEndScreen && !showCredits) {
        creditsTimeout = setTimeout(() => {
            showCredits = true;
        }, 1000);
    }

    function typeText() {
        if (currentPage >= texts.length) return;

        // Clear existing interval if any
        if (typeInterval) clearInterval(typeInterval);

        isTyping = true;
        typingComplete = false;
        displayedText = "";

        const text = texts[currentPage];
        let charIndex = 0;

        typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                // Check if we're at the start of an HTML tag
                if (text[charIndex] === "<") {
                    // Find the closing '>' and include the entire tag at once
                    const tagEnd = text.indexOf(">", charIndex);
                    if (tagEnd !== -1) {
                        charIndex = tagEnd + 1;
                    } else {
                        charIndex++;
                    }
                } else {
                    charIndex++;
                }
                displayedText = text.slice(0, charIndex);
            } else {
                if (typeInterval) clearInterval(typeInterval);
                isTyping = false;
                typingComplete = true;

                // On last page, auto-continue after 2 seconds
                if (isLastPage) {
                    autoNextTimeout = setTimeout(() => {
                        showEndScreen = true;
                    }, 2000);
                }
            }
        }, typingSpeed);

        return () => {
            if (typeInterval) clearInterval(typeInterval);
        };
    }

    function nextPage() {
        if (isTyping) return;
        if (showEndScreen) return;

        // Clear any pending auto-next timeout
        if (autoNextTimeout) {
            clearTimeout(autoNextTimeout);
        }

        if (currentPage < texts.length - 1) {
            currentPage++;
            typeText();
        } else {
            // On last page, show end screen
            showEndScreen = true;
        }
    }

    function prevPage() {
        // Allow going back even if typing - stop typing immediately
        if (isTyping) {
            if (typeInterval) clearInterval(typeInterval);
            isTyping = false;
        }

        // If on end screen, hide it and return to last page
        if (showEndScreen) {
            showEndScreen = false;
            showCredits = false;
            if (creditsTimeout) clearTimeout(creditsTimeout);
            return;
        }

        if (currentPage > 0) {
            currentPage--;
            typeText();
        } else {
            // On first page, exit outro
            dispatch("prev");
        }
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        // For NEXT inputs (Enter/Space/Down/Right), prevent if typing or end screen
        if (
            e.key === "Enter" ||
            e.key === " " ||
            e.key === "ArrowDown" ||
            e.key === "ArrowRight"
        ) {
            if (isTyping || showEndScreen) return;
            e.preventDefault();
            nextPage();
        }
        // For PREV inputs (Up/Left), ALWAYS allow (handled in prevPage)
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            prevPage();
        }
    }

    /** @param {WheelEvent} e */
    function handleWheel(e) {
        if (e.deltaY > 0) {
            // Scroll down: standard logic (block if typing/end screen)
            if (!isTyping && !showEndScreen) {
                e.preventDefault();
                nextPage();
            }
        } else if (e.deltaY < 0) {
            // Scroll up: ALWAYS allow backward navigation
            e.preventDefault();
            prevPage();
        }
    }

    /** @type {ReturnType<typeof setInterval> | undefined} */
    let cursorInterval;
    onMount(() => {
        currentPage = Math.min(startPage, texts.length - 1);
        typeText();
        cursorInterval = setInterval(() => {
            showCursor = !showCursor;
        }, 530);

        return () => {
            if (cursorInterval) clearInterval(cursorInterval);
            if (autoNextTimeout) clearTimeout(autoNextTimeout);
        };
    });
</script>

<svelte:window on:keydown={handleKeydown} />

<div
    class="typewriter-container"
    class:typing={isTyping}
    on:click={nextPage}
    on:keydown={handleKeydown}
    on:wheel|preventDefault={handleWheel}
    role="button"
    tabindex="0"
>
    <!-- Page indicator -->
    {#if !showEndScreen}
        <div class="page-indicator">
            {#each texts as _, i}
                <span
                    class="dot"
                    class:active={i === currentPage}
                    class:completed={i < currentPage}
                ></span>
            {/each}
        </div>

        <!-- Main text area -->
        <div class="text-area" in:fade={{ duration: 300 }}>
            {#key currentPage}
                <p class="typewriter-text" in:fade={{ duration: 200 }}>
                    {@html displayedText}<span
                        class="cursor"
                        class:visible={showCursor}>|</span
                    >
                </p>
            {/key}
        </div>
    {/if}

    <!-- Continue hint (only show if not last page) -->
    <div
        class="continue-hint"
        class:visible={typingComplete && !isLastPage && !showEndScreen}
    >
        <span class="hint-text">点击继续</span>
    </div>

    <!-- Auto-continue countdown (only on last page before end screen) -->
    {#if isLastPage && typingComplete && !showEndScreen}
        <div class="continue-hint visible">
            <span class="hint-text countdown">2秒后自动继续...</span>
        </div>
    {/if}

    <!-- End Screen -->
    {#if showEndScreen}
        <div class="end-screen" in:fade={{ duration: 500 }}>
            <div class="end-content" class:slide-up={showCredits}>
                <h1 class="end-title">全文结束</h1>
                <p class="end-reader-count">
                    你是第 <span class="reader-number">{readerCount}</span> 个打卡本文的哈基人
                </p>
            </div>

            {#if showCredits}
                <div
                    class="credits-section"
                    in:fade={{ duration: 800, delay: 200 }}
                >
                    <div class="credits-top-row">
                        <div class="credit-group">
                            <h3>作者团队</h3>
                            <p>
                                薄王一&nbsp;&nbsp;&nbsp;陆思涵&nbsp;&nbsp;&nbsp;冯佳佳
                            </p>
                        </div>
                        <div class="credit-group">
                            <h3>指导老师</h3>
                            <p>卞清</p>
                        </div>
                    </div>

                    <div class="credit-group college-info">
                        <div class="logo-container">
                            <img
                                src={collegeLogo}
                                alt="同济大学艺术与传媒学院"
                                class="college-logo"
                            />
                        </div>
                        <p class="course-name">
                            同济大学艺术与传媒学院<br />《融合媒体报道》课程专栏
                        </p>
                    </div>

                    <div class="credit-group references-group">
                        <h3>参考来源</h3>
                        <div class="references-list">
                            <p>哔哩哔哩 (bilibili.com)、新浪财经</p>
                            <p>三联生活周刊《年度十大热梗，三十岁以下请进》</p>
                            <p>
                                极目新闻《九阳推“哈基米南北绿豆浆”爆火，大批网友直播间玩梗，公司股票一度涨停，客服：产品预售排到一个月后》
                            </p>
                            <p>
                                澎湃思想市场《“哈基米”音乐流行：年轻人愈发依赖微小、即时、可控的乐趣》
                            </p>
                            <p>
                                知著网《“哈基米音乐”：于纷争中放逐意义，我们真的在“共振”吗》
                            </p>
                            <p>
                                版权情报局《“哈基米”成豆浆！？九阳是这么做的！》
                            </p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Both characters displayed together -->
        <div class="character-images">
            <img
                src={matikanetannhauser}
                alt="东海帝王"
                class="character-img left"
            />
            <img src={maoDie} alt="猫咪" class="character-img right" />
        </div>
    {/if}
</div>

<style>
    .typewriter-container {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        /* Paper texture background matching hero */
        background-color: #e5dfd0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
            linear-gradient(180deg, #ebe5d6 0%, #ddd7c8 100%);
        cursor: pointer;
        user-select: none;
    }

    .typewriter-container.typing {
        cursor: not-allowed;
    }

    .page-indicator {
        position: absolute;
        top: 40px;
        display: flex;
        gap: 12px;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }

    .dot.active {
        background: #2c2c2c;
        transform: scale(1.2);
    }

    .dot.completed {
        background: rgba(0, 0, 0, 0.5);
    }

    .text-area {
        max-width: 1000px;
        text-align: center;
    }

    .typewriter-text {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 600;
        color: #2c2c2c;
        line-height: 1.8;
        margin: 0;
        text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
        white-space: pre-wrap;
    }

    .cursor {
        color: #ff6b6b;
        font-weight: 300;
        opacity: 0;
        transition: opacity 0.1s;
        margin-left: 2px;
    }

    .cursor.visible {
        opacity: 1;
    }

    .continue-hint {
        position: absolute;
        bottom: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.5s ease;
    }

    .continue-hint.visible {
        opacity: 1;
    }

    .hint-text {
        font-family: "Noto Sans SC", sans-serif;
        font-size: 0.9rem;
        color: rgba(0, 0, 0, 0.5);
        letter-spacing: 0.1em;
        animation: blink 1.2s ease-in-out infinite;
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.3;
        }
    }

    /* Character images - both displayed together */
    .character-images {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 250px;
        pointer-events: none;
    }

    .character-img {
        max-height: 250px;
        width: auto;
        object-fit: contain;
        opacity: 0.9;
        position: absolute;
        bottom: 0;
    }

    .character-img.left {
        left: 40px;
    }

    .character-img.right {
        right: 40px;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .typewriter-container {
            padding: 24px;
        }

        .typewriter-text {
            font-size: clamp(1.2rem, 5vw, 1.8rem);
            line-height: 2;
        }

        .page-indicator {
            top: 24px;
        }

        .continue-hint {
            bottom: 40px;
        }

        .character-images {
            bottom: 20px;
        }

        .character-img {
            max-height: 150px;
        }
    }

    /* End Screen Styles */
    .end-screen {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        /* Remove gap here as we control spacing with positioning */
    }

    .end-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .end-content.slide-up {
        transform: translateY(-150px);
    }

    .end-title {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 900;
        color: #2c2c2c;
        margin: 0;
        letter-spacing: 0.1em;
    }

    .end-reader-count {
        font-family: "Noto Sans SC", sans-serif;
        font-size: clamp(1rem, 3vw, 1.5rem);
        color: #555;
        margin: 0;
    }

    .reader-number {
        font-weight: 700;
        color: #ff6b6b;
        font-size: 1.2em;
    }

    .countdown {
        color: rgba(0, 0, 0, 0.4);
    }

    /* Credits Section */
    .credits-section {
        position: absolute;
        top: 50%;
        width: 100%;
        max-width: 900px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
        padding: 0 40px;
        text-align: center;
    }

    .credits-top-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 60px;
    }

    .credit-group h3 {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: 1.1rem;
        color: #2c2c2c;
        margin: 0 0 12px 0;
        font-weight: 700;
    }

    .credit-group p {
        font-family: "Noto Sans SC", sans-serif;
        font-size: 0.95rem;
        color: #666;
        margin: 0;
        line-height: 1.6;
    }

    .college-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
    }

    .logo-container {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .college-logo {
        height: 100%;
        width: auto;
        object-fit: contain;
    }

    .course-name {
        font-size: 0.9rem !important;
        font-weight: 500;
        color: #444 !important;
        line-height: 1.5 !important;
        text-align: center;
    }

    .references-group {
        width: 100%;
        max-width: 800px;
    }

    .references-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .references-list p {
        font-size: 0.85rem;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .references-list p span {
        font-weight: 700;
        color: #666;
    }
</style>
