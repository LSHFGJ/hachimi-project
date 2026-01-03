<script>
    import { onMount } from "svelte";

    /** @type {string} */
    export let src = "";

    /** @type {string} */
    export let alt = "3D Model";

    /** @type {number} */
    export let width = 500;

    /** @type {number} */
    export let height = 500;

    /** @type {boolean} */
    export let autoRotate = true;

    /** @type {string} */
    export let cameraOrbit = "45deg 75deg 2.5m";

    let loaded = false;

    onMount(async () => {
        // Dynamically import model-viewer to avoid SSR issues
        await import("@google/model-viewer");
        loaded = true;
    });
</script>

<div class="model-container" style="width: {width}px; height: {height}px;">
    {#if loaded}
        <model-viewer
            {src}
            {alt}
            auto-rotate={autoRotate ? "" : null}
            auto-rotate-delay="0"
            rotation-per-second="30deg"
            camera-orbit={cameraOrbit}
            disable-zoom
            interaction-prompt="none"
            shadow-intensity="1"
            exposure="0.8"
            style="width: 100%; height: 100%; background: transparent;"
        ></model-viewer>
    {:else}
        <div class="loading">
            <div class="spinner"></div>
            <span>加载模型中...</span>
        </div>
    {/if}
</div>

<style>
    .model-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
    }

    model-viewer {
        --poster-color: transparent;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        -webkit-tap-highlight-color: transparent;
    }

    model-viewer:focus,
    model-viewer:focus-visible,
    model-viewer:focus-within {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
    }

    model-viewer::part(default-progress-bar) {
        display: none;
    }

    /* Prevent any focus outlines on the container too */
    .model-container:focus,
    .model-container:focus-visible {
        outline: none !important;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #666;
        font-size: 14px;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top-color: #ff6b6b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
