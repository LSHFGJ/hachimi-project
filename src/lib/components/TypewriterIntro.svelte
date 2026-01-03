<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    // import matikanetannhauser from "$lib/assets/Matikanetannhauser.png";
    // import maoDie from "$lib/assets/MaoDie.png";

    const matikanetannhauser = "/missing-asset.png";
    const maoDie = "/missing-asset.png";

    /** @type {string[]} */
    export let texts = [];

    /** @type {number} */
    export let typingSpeed = 50;

    /** @type {number} */
    export let startPage = 0;

    const dispatch = createEventDispatcher();

    let currentPage = 0;
    let initialized = false;
    let displayedText = "";
    let isTyping = false;
    let showCursor = true;
    let typingComplete = false;

    $: currentText = texts[currentPage] || "";

    function typeText() {
        if (currentPage >= texts.length) return;

        isTyping = true;
        typingComplete = false;
        displayedText = "";

        const text = texts[currentPage];
        let charIndex = 0;

        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                displayedText = text.slice(0, charIndex + 1);
                charIndex++;
            } else {
                clearInterval(typeInterval);
                isTyping = false;
                typingComplete = true;
            }
        }, typingSpeed);

        return () => clearInterval(typeInterval);
    }

    function nextPage() {
        if (isTyping) return; // Disable during typing

        if (currentPage < texts.length - 1) {
            currentPage++;
            typeText();
        } else {
            // All pages done, dispatch complete event
            dispatch("complete");
        }
    }

    function prevPage() {
        if (isTyping) return; // Disable during typing

        if (currentPage > 0) {
            currentPage--;
            typeText();
        }
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        if (isTyping) return; // Disable during typing

        if (
            e.key === "Enter" ||
            e.key === " " ||
            e.key === "ArrowDown" ||
            e.key === "ArrowRight"
        ) {
            e.preventDefault();
            nextPage();
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            prevPage();
        }
    }

    /** @param {WheelEvent} e */
    function handleWheel(e) {
        if (isTyping) return; // Disable during typing

        if (e.deltaY > 0) {
            e.preventDefault();
            nextPage();
        } else if (e.deltaY < 0) {
            e.preventDefault();
            prevPage();
        }
    }

    // Cursor blink effect
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let cursorInterval;
    onMount(() => {
        // Initialize from startPage prop
        currentPage = Math.min(startPage, texts.length - 1);
        typeText();
        cursorInterval = setInterval(() => {
            showCursor = !showCursor;
        }, 530);

        return () => {
            if (cursorInterval) clearInterval(cursorInterval);
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
                {displayedText}<span class="cursor" class:visible={showCursor}
                    >|</span
                >
            </p>
        {/key}
    </div>

    <!-- Continue hint -->
    <div class="continue-hint" class:visible={typingComplete}>
        <span class="hint-text">点击继续</span>
    </div>

    <!-- Alternating character images -->
    <div class="character-images">
        {#if currentPage % 2 === 0}
            <img
                src={matikanetannhauser}
                alt="东海帝王"
                class="character-img left"
            />
        {:else}
            <img src={maoDie} alt="猫咪" class="character-img right" />
        {/if}
    </div>
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
        background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
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
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
    }

    .dot.active {
        background: #fff;
        transform: scale(1.2);
    }

    .dot.completed {
        background: rgba(255, 255, 255, 0.5);
    }

    .text-area {
        max-width: 1000px;
        text-align: center;
    }

    .typewriter-text {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 600;
        color: #ffffff;
        line-height: 1.8;
        margin: 0;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
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
        color: rgba(255, 255, 255, 0.5);
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

    /* Character images */
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
</style>
