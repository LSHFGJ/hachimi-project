<script>
    import { createEventDispatcher } from "svelte";

    /** @type {string} */
    export let correctMonth = ""; // Format: "24.10" or "25.3"

    /** @type {boolean} */
    export let disabled = false;

    /** @type {boolean} */
    export let compact = false;

    const dispatch = createEventDispatcher();

    // Generate month options from 2024.09 to 2025.12
    const months = [];
    // 2024: 9-12
    for (let m = 9; m <= 12; m++) {
        months.push({
            value: `24.${m}`,
            label: `2024.${m.toString().padStart(2, "0")}`,
        });
    }
    // 2025: 1-12
    for (let m = 1; m <= 12; m++) {
        months.push({
            value: `25.${m}`,
            label: `2025.${m.toString().padStart(2, "0")}`,
        });
    }

    let sliderValue = 0; // Index into months array
    let attemptsLeft = 2;
    let guessResult = null; // 'correct', 'wrong', 'revealed'
    let showConfetti = false;

    $: selectedMonth = months[sliderValue];

    // Reset state when correctMonth changes (new track selected)
    $: if (correctMonth) {
        resetGame();
    }

    function resetGame() {
        attemptsLeft = 2;
        guessResult = null;
        showConfetti = false;
        sliderValue = Math.floor(months.length / 2); // Start in middle
    }

    function submitGuess() {
        if (disabled || guessResult === "correct" || guessResult === "revealed")
            return;

        const isCorrect = selectedMonth.value === correctMonth;

        if (isCorrect) {
            guessResult = "correct";
            showConfetti = true;
            setTimeout(() => {
                showConfetti = false;
            }, 3000);
            dispatch("guessComplete", {
                correct: true,
                attempts: 3 - attemptsLeft,
            });
        } else {
            attemptsLeft--;
            if (attemptsLeft <= 0) {
                guessResult = "revealed";
                dispatch("guessComplete", { correct: false, attempts: 2 });
            } else {
                guessResult = "wrong";
                // Reset wrong state after animation
                setTimeout(() => {
                    if (guessResult === "wrong") guessResult = null;
                }, 1000);
            }
        }
    }

    function getCorrectMonthLabel() {
        const found = months.find((m) => m.value === correctMonth);
        return found ? found.label : correctMonth;
    }
</script>

<div class="fader-container" class:disabled class:compact>
    <div class="fader-row">
        <!-- Mixer-style fader track -->
        <div class="fader-track">
            <div class="fader-labels">
                <span class="fader-label start">2024.09</span>
                <span class="fader-label end">2025.12</span>
            </div>

            <div class="slider-wrapper">
                <!-- Tick marks -->
                <div class="tick-marks">
                    {#each months as month, i}
                        <div
                            class="tick"
                            class:major={month.value.endsWith(".1") ||
                                month.value.endsWith(".9")}
                            style="left: {(i / (months.length - 1)) * 100}%"
                        ></div>
                    {/each}
                </div>

                <input
                    type="range"
                    class="fader-slider"
                    min="0"
                    max={months.length - 1}
                    bind:value={sliderValue}
                    disabled={disabled ||
                        guessResult === "correct" ||
                        guessResult === "revealed"}
                />

                <!-- Current value display -->
                <div
                    class="value-bubble"
                    style="left: {(sliderValue / (months.length - 1)) * 100}%"
                >
                    {selectedMonth.label}
                </div>
            </div>
        </div>

        <!-- Submit button -->
        <div class="fader-actions">
            {#if guessResult === "correct"}
                <div class="result-message correct">
                    <span class="result-icon">🎉</span>
                    <span>恭喜猜对了！</span>
                </div>
            {:else if guessResult === "revealed"}
                <div class="result-message revealed">
                    <span class="reveal-label">正确答案</span>
                    <span class="reveal-value">{getCorrectMonthLabel()}</span>
                </div>
            {:else}
                <button
                    class="guess-btn"
                    class:shake={guessResult === "wrong"}
                    on:click={submitGuess}
                    {disabled}
                >
                    确认猜测
                </button>
                {#if guessResult === "wrong"}
                    <span class="hint-text">再试一次！</span>
                {/if}
            {/if}
        </div>
    </div>

    <!-- Confetti effect -->
    {#if showConfetti}
        <div class="confetti-container">
            {#each Array(20) as _, i}
                <div
                    class="confetti-piece"
                    style="
                        left: {Math.random() * 100}%;
                        animation-delay: {Math.random() * 0.5}s;
                        background: hsl({Math.random() * 360}, 80%, 60%);
                    "
                ></div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .fader-container {
        position: relative;
        width: 100%;
        padding: var(--space-2) 0;
        /* No wrapper styles */
    }

    .fader-row {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        width: 100%;
    }

    .fader-track {
        flex: 1;
        /* Ensure it takes remaining space */
    }

    .fader-actions {
        flex-shrink: 0;
        /* Keep button size */
    }

    .fader-container.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .fader-container.compact {
        padding: var(--space-2);
    }

    .fader-container.compact .fader-header {
        margin-bottom: var(--space-1);
    }

    .fader-container.compact .fader-title {
        font-size: 10px;
    }

    .fader-container.compact .attempts-badge {
        font-size: 9px;
        padding: 2px 6px;
    }

    .fader-container.compact .fader-track {
        margin-bottom: var(--space-1);
        padding: var(--space-1);
    }

    .fader-container.compact .slider-wrapper {
        height: 28px;
        padding-top: 10px;
    }

    .fader-container.compact .tick-marks {
        top: 10px;
        height: 8px;
    }

    .fader-container.compact .fader-slider::-webkit-slider-thumb {
        width: 12px;
        height: 20px;
    }

    .fader-container.compact .value-bubble {
        font-size: 9px;
        padding: 1px 6px;
    }

    .fader-container.compact .guess-btn {
        padding: 4px 12px;
        font-size: 9px;
    }

    .fader-container.compact .result-message {
        padding: var(--space-2) var(--space-3);
        font-size: 10px;
    }

    .fader-container.compact .result-icon {
        font-size: 14px;
    }

    .fader-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .fader-title {
        font-weight: 600;
        font-size: var(--font-size-sm);
        color: #d4a574;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .attempts-badge {
        font-size: 10px;
        padding: 3px 8px;
        background: linear-gradient(135deg, #4ecdc4, #45b7aa);
        color: white;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .attempts-badge.warning {
        background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
    }

    .fader-track {
        margin-bottom: var(--space-2);
        background: linear-gradient(to bottom, #1a1512, #252018);
        padding: var(--space-2);
        border-radius: 6px;
        border: 1px solid #3d3530;
    }

    .fader-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-1);
    }

    .fader-label {
        font-size: 9px;
        color: #8a8070;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .slider-wrapper {
        position: relative;
        height: 36px;
        padding-top: 14px;
    }

    .tick-marks {
        position: absolute;
        top: 14px;
        left: 8px;
        right: 8px;
        height: 12px;
    }

    .tick {
        position: absolute;
        width: 1px;
        height: 6px;
        background: #5a5040;
        opacity: 0.6;
        transform: translateX(-50%);
    }

    .tick.major {
        height: 10px;
        opacity: 0.8;
        background: #7a6050;
    }

    .fader-slider {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(to bottom, #1a1512, #333028, #1a1512);
        border-radius: 3px;
        outline: none;
        cursor: pointer;
        border: 1px solid #4a4035;
    }

    .fader-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 28px;
        background: linear-gradient(
            to bottom,
            #c0b0a0 0%,
            #e8e0d8 15%,
            #d0c0b0 50%,
            #e8e0d8 85%,
            #c0b0a0 100%
        );
        border-radius: 3px;
        cursor: grab;
        box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid #8a7a6a;
    }

    .fader-slider::-webkit-slider-thumb:active {
        cursor: grabbing;
        background: linear-gradient(
            to bottom,
            #b0a090 0%,
            #d8d0c8 15%,
            #c0b0a0 50%,
            #d8d0c8 85%,
            #b0a090 100%
        );
    }

    .fader-slider::-moz-range-thumb {
        width: 16px;
        height: 28px;
        background: linear-gradient(to bottom, #c0b0a0, #d0c0b0);
        border-radius: 3px;
        cursor: grab;
        border: 1px solid #8a7a6a;
    }

    .value-bubble {
        position: absolute;
        top: -2px;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #d4a574, #c89464);
        color: #1a1512;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        transition: left 0.1s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .fader-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
    }

    .guess-btn {
        padding: 6px 20px;
        background: linear-gradient(135deg, #d4a574 0%, #c89464 100%);
        color: #1a1512;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .guess-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }

    .guess-btn:disabled {
        background: #999;
        cursor: not-allowed;
    }

    .guess-btn.shake {
        animation: shake 0.5s ease;
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        20%,
        60% {
            transform: translateX(-8px);
        }
        40%,
        80% {
            transform: translateX(8px);
        }
    }

    .hint-text {
        font-size: var(--font-size-xs);
        color: var(--color-accent);
        font-weight: 600;
    }

    .result-message {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        font-weight: 600;
        padding: 4px 0;
        /* Minimal flat design */
        background: transparent;
        border: none;
        white-space: nowrap;
    }

    .result-message.correct {
        color: #4ecdc4;
    }

    @keyframes pulse-glow {
        0%,
        100% {
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
        }
        50% {
            box-shadow: 0 0 40px rgba(74, 222, 128, 0.8);
        }
    }

    .result-message.revealed {
        gap: 6px;
    }

    .reveal-label {
        color: #8a7a6a;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .reveal-value {
        color: #ff6b6b;
        font-family: monospace;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 1px;
        padding-bottom: 1px;
        border-bottom: 2px solid rgba(255, 107, 107, 0.3);
    }

    .result-icon {
        font-size: 20px;
    }

    /* Confetti animation */
    .confetti-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        border-radius: inherit;
    }

    .confetti-piece {
        position: absolute;
        width: 10px;
        height: 10px;
        top: -10px;
        border-radius: 2px;
        animation: confetti-fall 3s ease-out forwards;
    }

    @keyframes confetti-fall {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(300px) rotate(720deg);
        }
    }
</style>
