<script>
    import { fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    export let visible = false;
    export let split = false;
    export let progress = 1.0; // Default to full progress if not provided

    const messages = [
        {
            id: 1,
            text: "贵吗？",
            side: "left",
            style: "top: 25%",
            trigger: 0.1,
        },
        {
            id: 2,
            text: "有必要吗？",
            side: "left",
            style: "top: 50%",
            trigger: 0.26,
        },
        {
            id: 3,
            text: "不贵。",
            side: "right",
            style: "top: 35%",
            trigger: 0.42,
        },
        {
            id: 4,
            text: "没必要。",
            side: "right",
            style: "top: 60%",
            trigger: 0.58,
        },
        {
            id: 5,
            text: "那为什么买？",
            side: "left",
            style: "top: 75%",
            trigger: 0.74,
        },
        {
            id: 6,
            text: "因为我手滑，而且我想看看它到底有多哈基米。",
            side: "right",
            style: "top: 85%",
            trigger: 0.9,
        },
    ];
</script>

<div class="chat-container" class:split-layout={split}>
    {#if visible}
        {#each messages as msg}
            {#if progress >= msg.trigger}
                <div
                    class="message-wrapper {msg.side}"
                    style={split ? msg.style : ""}
                    in:fly={{
                        y: 20,
                        duration: 500,
                        easing: cubicOut,
                    }}
                >
                    <div class="message-bubble">
                        {msg.text}
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 400px;
        padding: 20px;
        font-family: var(--font-sans, sans-serif);
        transition: all 0.3s ease;
    }

    /* Split Layout for 3D Model Scene */
    .chat-container.split-layout {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        padding: 0;
        pointer-events: none;
    }

    .split-layout .message-wrapper {
        position: absolute;
    }

    .split-layout .message-wrapper.left {
        top: 35%;
        left: 5%; /* Moved closer to edge */
        justify-content: flex-start;
    }

    .split-layout .message-wrapper.right {
        top: 25%;
        right: 5%; /* Moved closer to edge */
        justify-content: flex-end;
    }

    .split-layout .message-wrapper.center {
        bottom: 20%;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 600px;
    }

    .message-wrapper {
        display: flex;
        width: 100%;
    }

    .message-wrapper.left {
        justify-content: flex-start;
    }

    .message-wrapper.right {
        justify-content: flex-end;
    }

    .message-wrapper.center {
        justify-content: center;
        margin-top: 10px;
    }

    .message-bubble {
        max-width: 80%;
        padding: 12px 18px;
        border-radius: 18px;
        font-size: 18px;
        line-height: 1.5;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        pointer-events: auto;
    }

    /* Message specific styles */
    .left .message-bubble {
        background-color: #ffffff;
        color: #333;
        border-bottom-left-radius: 4px;
        border: 1px solid #eee;
    }

    .right .message-bubble {
        background-color: #95ec69; /* WeChat green roughly */
        color: #000;
        border-bottom-right-radius: 4px;
    }

    .center .message-bubble {
        background-color: rgba(255, 255, 255, 0.9);
        color: #444;
        font-size: 16px;
        border-radius: 12px;
        max-width: 90%;
        text-align: center;
        padding: 15px 25px;
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(0, 0, 0, 0.05);
    }
</style>
