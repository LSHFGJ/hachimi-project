<script>
    /** @type {Array<{id: string, title: string, author: string, views: number, cover: string, date: string}>} */
    export let videos = [];

    /** @type {{id: string, title: string, author: string, views: number, cover: string, date: string} | null} */
    let selectedVideo = null;

    function formatViews(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + "万";
        return n.toLocaleString();
    }

    function handleClick(video) {
        selectedVideo = video;
    }

    function closeModal() {
        selectedVideo = null;
    }
</script>

<div class="video-grid">
    {#each videos as video, i}
        <button
            class="video-card"
            on:click={() => handleClick(video)}
            style="--delay: {i * 50}ms"
        >
            <div class="cover-wrapper">
                <img src={video.cover} alt={video.title} loading="lazy" />
                <div class="play-overlay">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="32"
                        height="32"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
            <div class="card-info">
                <h4>{video.title}</h4>
                <div class="meta">
                    <span class="author">{video.author}</span>
                    <span class="views">{formatViews(video.views)}播放</span>
                </div>
            </div>
        </button>
    {/each}
</div>

{#if selectedVideo}
    <div
        class="modal-overlay"
        on:click={closeModal}
        on:keydown={(e) => e.key === "Escape" && closeModal()}
    >
        <div class="modal-content glass-card" on:click|stopPropagation>
            <button class="close-btn" on:click={closeModal}>×</button>
            <img src={selectedVideo.cover} alt={selectedVideo.title} />
            <div class="modal-info">
                <h3>{selectedVideo.title}</h3>
                <p class="author">UP主：{selectedVideo.author}</p>
                <p class="views">{formatViews(selectedVideo.views)} 播放</p>
                <p class="date">发布日期：{selectedVideo.date}</p>
            </div>
        </div>
    </div>
{/if}

<style>
    .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-4);
        padding: var(--space-4);
    }

    @media (min-width: 768px) {
        .video-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
    }

    .video-card {
        background: var(--color-bg-card);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all var(--transition-normal);
        border: 1px solid rgba(0, 0, 0, 0.08);
        text-align: left;
        opacity: 0;
        animation: fadeInCard 0.5s ease-out forwards;
        animation-delay: var(--delay);
    }

    .video-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: var(--color-accent);
    }

    .cover-wrapper {
        position: relative;
        aspect-ratio: 16 / 9;
        overflow: hidden;
    }

    .cover-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-normal);
    }

    .video-card:hover .cover-wrapper img {
        transform: scale(1.05);
    }

    .play-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity var(--transition-fast);
    }

    .video-card:hover .play-overlay {
        opacity: 1;
    }

    .play-overlay svg {
        color: white;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .card-info {
        padding: var(--space-3);
    }

    .card-info h4 {
        font-size: var(--font-size-sm);
        font-weight: 500;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: var(--space-2);
    }

    .meta {
        display: flex;
        justify-content: space-between;
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
    }

    /* Modal styles */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: var(--space-4);
    }

    .modal-content {
        max-width: 400px;
        width: 100%;
        padding: 0;
        overflow: hidden;
        position: relative;
    }

    .modal-content img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
    }

    .modal-info {
        padding: var(--space-6);
    }

    .modal-info h3 {
        font-size: var(--font-size-lg);
        margin-bottom: var(--space-3);
    }

    .modal-info p {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-2);
    }

    .close-btn {
        position: absolute;
        top: var(--space-3);
        right: var(--space-3);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast);
    }

    .close-btn:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    @keyframes fadeInCard {
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
