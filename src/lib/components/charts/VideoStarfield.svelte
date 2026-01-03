<script>
    import coverMapping from "$lib/data/cover_mapping.json";
    // import BilibiliLogo from "$lib/assets/Bilibili_logo.svg";
    const BilibiliLogo = "/missing-asset.svg";

    /** @type {number} */
    export let width = 800;
    /** @type {number} */
    export let height = 600;
    /** @type {boolean} */
    export let clustered = false;

    // Category colors for backgrounds
    const CATEGORY_COLORS = {
        cat: { bg: "rgba(255, 107, 107, 0.18)", label: "🐱 猫咪" },
        anime: { bg: "rgba(0, 212, 255, 0.18)", label: "🎌 动漫" },
        other: { bg: "rgba(255, 179, 71, 0.18)", label: "📦 其他" },
    };

    // List of all video cover filenames (100 files)
    // We use the API route /api/covers/[filename] to serve safe ASCII-only file names
    const coverFilenames = [
        "001_🐱我被困在了哈基乡_1.jpg",
        "002_哈雪大帽险_2.jpg",
        "003_基米说完整版_2.jpg",
        "004_🐱哈基山的基米美如水啊🐱_1.jpg",
        "005_【录像首次公布】他是哈基米史上最高的山_1.jpg",
        "006_我自己剪的时候都没绷住_3.jpg",
        "007_舒服！碰瓷被撞飞30米！_3.jpg",
        "008_bro似乎遇到了一些麻烦_1.jpg",
        "009_西部快哈手_1.jpg",
        "010_没有比这个更离谱的视频了_3.jpg",
        "011_神的没边了 曼波两下得了_2.jpg",
        "012_🎵曼波 𝑵𝒐 𝑴𝒐𝒓𝒆🎵不再曼波_2.jpg",
        "013_跳楼基_2.jpg",
        "014_你可能不认识我，但你可能听过我改编的曼波_3.jpg",
        "015_【补档】🎵曼波 𝑵𝒐 𝑴𝒐𝒓𝒆🎵不再曼波（完整版）_2.jpg",
        "016_当我在猫咪咬我的时候，突然给它唱哈基米山歌_1.jpg",
        "017_哈基米：Billie Jean_2.jpg",
        "018_《蓝莲哈》哈基米来洗涤你浮躁的心_2.jpg",
        "019_哈基米：我无怨无悔_3.jpg",
        "020_全网最火哈基米翻唱，对比原曲谁更权威？_1.jpg",
        "021_古典哈基米：野哈飞舞_2.jpg",
        "022_🎵太空曼波 𝑺𝒑𝒂𝒄𝒆 𝑾𝒂𝒍𝒌🎵哈基米纯音乐_3.jpg",
        "023_女大AKO也干了_3.jpg",
        "024_朱元璋的奋斗（1）：开局一个碗！_2.jpg",
        "025_😰有这种毅力做什么都会成功的……_3.jpg",
        "026_【AI三角洲全干员】《曼波 𝑵𝒐 𝑴𝒐𝒓𝒆》不再曼波_3.jpg",
        "027_哈基米牌零食广告2.0_3.jpg",
        "028_这才是币！B友必看！这辈子没这么卧槽过！_3.jpg",
        "029_每天一遍 大脑再见 chipi chipi chapa chapa_1.jpg",
        "030_【哈基米音乐】基米说（伯虎说停顿卡点&完整版）_2.jpg",
        "031_丢盔弃甲！彻底破防！2023年10月新番完结吐槽大总结！【泛式】_2.jpg",
        "032_画一只可爱的猫_1.jpg",
        "033_听完全家五星通缉《哈基Midnight City》⭐⭐⭐⭐⭐_2.jpg",
        "034_齐 天 大 耋_1.jpg",
        "035_神曼波【哈基米音乐】_2.jpg",
        "036_家人们我能活下来吗_1.jpg",
        "037_【完整版】最后一哈_1.jpg",
        "038_不好又落入人类陷阱了喵_1.jpg",
        "039_小猫祝大家端午安康!_3.jpg",
        "040_继上个视频有人说用厚到薄，所以后续来了_1.jpg",
        "041_蓝莲哈_3.jpg",
        "042_【鬼畜】吊德斯妙妙屋_3.jpg",
        "043_阎王网购的哈基米被我成功截获_3.jpg",
        "044_哈基米你…还是燃尽了吗_1.jpg",
        "045_来去曼波🎵加长版_2.jpg",
        "046_盘点近期网络热门配音：都是我的、哈基米_3.jpg",
        "047_【4K】两两面包夹两芝士夹面包_3.jpg",
        "048_爱猫人士灵机一动，放生数百只哈吉米到野外玩大逃杀_3.jpg",
        "049_哈基米是什么梗【梗指南】_2.jpg",
        "050_2025 热 梗 年 度 总 结 ！！！_1.jpg",
        "051_《你的马名》_2.jpg",
        "052_超 越 天 堂_2.jpg",
        "053_用真实吃鸡4倍镜在30层顶楼看800米外敌人什么效果？配上M24绝了_3.jpg",
        "054_🐱Some基米 just like this🐱_1.jpg",
        "055_1942年！哈基米格勒！_1.jpg",
        '056_"存了十六年才敢发出来"_3.jpg',
        "057_【哈基米音乐】夜曲_2.jpg",
        '058_"哈基米の爱情买卖"_2.jpg',
        "059_我被困在了哈基乡_3.jpg",
        "060_❤库♂洛米❤_3.jpg",
        "061_遇到哈基米偷吃我们的外卖该怎么办？_1.jpg",
        "062_B站热门哈基米串烧_1.jpg",
        "063_我说我不能生哈基米，绿茶以为我不能生小baby，这下可来劲了！_3.jpg",
        '064_"最后再哈一次，时间要开始加速了！"『 Crucified×哈基米 』_2.jpg',
        "065_《 先 天 曼 波 圣 体 》_2.jpg",
        "066_🐱金箍戴上后，你再也不是哈基米_1.jpg",
        "067_【哈基米FM】大哈咒_2.jpg",
        "068_【中字】原来是炼金术士啊，我还以为是猫猫呢  ネコかと思ったら錬金術師  The Cat Alche_2.jpg",
        "069_😾干嘛...😾_1.jpg",
        "070_舅妈夸我家的花瓶后的连锁反应_1.jpg",
        "071_节目效果之哈基米抢食_1.jpg",
        "072_【合集】三角洲行动威龙评价全部干员_1.jpg",
        "073_开屏雷击 人类终将超越AI_2.jpg",
        "074_哈气的梦…该醒了_1.jpg",
        "075_耄耋：我们的感情好像跳喽基_1.jpg",
        "076_广州塔怎么红温了？_2.jpg",
        "077_全家活暗暗PHONK《scopin》全网咪咪听完秒变哈气咪_2.jpg",
        "078_陕北曼波说书_2.jpg",
        "079_真正的猛男敢于拯救可爱的哈基米～_2.jpg",
        "080_如果你时常感到孤独，看看这个1米35的男人，超治愈《心灵驿站》_2.jpg",
        "081_去监狱里抓犯人效率最高，所以抓性骚扰应该去……_2.jpg",
        "082_【b站独家原版】哈基米调音-《两个笨蛋》_2.jpg",
        "083_曼波、曼波、有时哈基米_2.jpg",
        "084_『翼猫』一百年前曾存在会飞的猫？长着翅膀的天使猫是真的吗？_1.jpg",
        "085_帝宝哈基米？阿米诺斯！_2.jpg",
        "086_如果跳楼机卡在中间会怎样？_3.jpg",
        "087_哈基山的基米美不美？_2.jpg",
        "088_2024年度烂梗TOP 10！第一名99.9%的人都没想到！_3.jpg",
        "089_欧金金是什么梗【梗指南】_2.jpg",
        "090_【哈基米FM】舌尖上的基米_2.jpg",
        '091_循环歌单【不再曼波】"【哈基米の小曲】【跑刀の小曲】"_1.jpg',
        "092_1200个收藏品补给箱！开出价值5颗非洲之星？看完你还会囤吗？_3.jpg",
        "093_Doro 历 险 记_2.jpg",
        "094_「你的耄字。」_1.jpg",
        "095_【老柠萌】当鼠鼠连续三把碰到堵桥队伍，被大哥抓走后..._3.jpg",
        "096_当军迷看见93阅兵新装备时_1.jpg",
        "097_曼波哈基米虎视眈眈_2.jpg",
        "098_循环歌单《打火机 (哈基米曼波Remix)》哈基米啊南北绿豆！_1.jpg",
        "099_【纯净流哈基米】曼波你身([Phonk]Move Your Body)_1.jpg",
        "100_⚡️ 姬 你 太 美 ⚡_2.jpg",
    ];

    /**
     * Generate a deterministic value between 0 and 1 based on rank and a channel
     * Uses golden ratio and trigonometric functions for uniform distribution
     * @param {number} rank
     * @param {number} channel - different channel for different properties
     */
    function deterministicValue(rank, channel) {
        const phi = 1.618033988749895; // golden ratio
        const val = (((rank * phi + channel * 0.7071067811865476) % 1) + 1) % 1;
        return val;
    }

    // Parse metadata from filenames and create API URLs
    const videos = coverFilenames
        .map((filename, fileIndex) => {
            const match = filename.match(/^(\d+)_(.+)_(\d)\.jpg$/);
            if (!match) return null;

            const [, rankStr, title, categoryCode] = match;
            const rank = parseInt(rankStr, 10);

            // Map category codes to labels
            /** @type {Record<string, "cat" | "anime" | "other">} */
            const categoryMap = {
                "1": "cat",
                "2": "anime",
                "3": "other",
            };
            const category = categoryMap[categoryCode] || "other";

            // Use API route with safe filename (no UTF-8 encoding issues)
            const safeFilename =
                coverMapping?.[filename] || "cover_fallback.jpg";
            const url = `/api/covers/${safeFilename}`;

            // Fully deterministic values based on rank
            const detX = deterministicValue(rank, 1);
            const detY = deterministicValue(rank, 2);
            const detScale = deterministicValue(rank, 3);
            const detDelay = deterministicValue(rank, 4);

            return {
                rank,
                fileIndex, // store original file index for stable iteration
                title,
                category,
                url,
                // Deterministic positioning for starfield effect
                x: detX,
                y: detY,
                // Category-based size: cat > anime > other
                scale:
                    (0.8 + detScale * 0.4) *
                    (category === "cat"
                        ? 1.15
                        : category === "anime"
                          ? 1.0
                          : 0.85),
                // Animation delay (reduced for faster appearance)
                delay: detDelay * 1,
            };
        })
        .filter(/** @param {any} v */ (v) => v !== null)
        .sort((a, b) => (a?.rank || 0) - (b?.rank || 0)); // 按编号排序

    /** @type {typeof videos[0] | null} */
    let selectedVideo = null;

    let mouseX = 0;
    let mouseY = 0;
    let windowWidth = 0;
    let windowHeight = 0;

    // Card dimensions (approximate + margin)
    const CARD_WIDTH = 340;
    const CARD_HEIGHT = 160;
    const OFFSET = 20;

    $: panelX = mouseX + OFFSET;
    $: panelY = mouseY + OFFSET;

    // Adjust position if it goes off screen
    $: safeX =
        panelX + CARD_WIDTH > windowWidth
            ? mouseX - CARD_WIDTH - OFFSET
            : panelX;

    $: safeY =
        panelY + CARD_HEIGHT > windowHeight
            ? mouseY - CARD_HEIGHT - OFFSET
            : panelY;

    /** @param {MouseEvent} e */
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Config for text exclusion zone (where the big label will be)
    const TEXT_ZONE_WIDTH = 400;
    const TEXT_ZONE_HEIGHT = 240; // Increased for stacked text

    /**
     * Generate safe slots for a region, excluding the center
     * @param {number} count - number of items
     * @param {number} startY - region start Y
     * @param {number} regionHeight - region height
     * @param {number} seed - unique seed for deterministic shuffle
     */
    function generateSafeSlots(count, startY, regionHeight, seed) {
        /** @type {{x: number, y: number}[]} */
        const slots = [];
        // Determine grid size
        // We want tight packing but enough for the count
        const availableArea =
            width * regionHeight - TEXT_ZONE_WIDTH * TEXT_ZONE_HEIGHT;
        const areaPerItem = availableArea / (count * 1.5); // 1.5 factor for spacing

        let cellSize = Math.sqrt(areaPerItem);
        // Clamp cell size to be reasonable
        cellSize = Math.max(cellSize, 60);

        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(regionHeight / cellSize);

        const localCenterX = width / 2;
        const localCenterY = startY + regionHeight / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Cell center coordinates
                const cx = (c + 0.5) * (width / cols);
                const cy = startY + (r + 0.5) * (regionHeight / rows);

                // Check if inside exclusion zone (Text Zone)
                // We add some buffer to the text zone
                if (
                    Math.abs(cx - localCenterX) < TEXT_ZONE_WIDTH / 2 + 20 &&
                    Math.abs(cy - localCenterY) < TEXT_ZONE_HEIGHT / 2 + 20
                ) {
                    continue;
                }

                slots.push({ x: cx, y: cy });
            }
        }

        // Deterministic shuffle using the seed
        // We use a simple seeded random for consistent slot assignment
        let m = slots.length;
        while (m) {
            // Using deterministicValue helper to simulate random
            const r = deterministicValue(m, seed + m);
            const i = Math.floor(r * m--);
            const t = slots[m];
            slots[m] = slots[i];
            slots[i] = t;
        }

        return slots;
    }

    // Calculate grid layout
    $: cols = Math.ceil(Math.sqrt(videos.length));
    $: rows = Math.ceil(videos.length / cols);
    $: cellWidth = width / cols;
    $: cellHeight = height / rows;
    $: coverSize = Math.min(cellWidth, cellHeight) * 0.7;

    // Category groupings for clustering
    $: catVideos = videos.filter((v) => v?.category === "cat");
    $: animeVideos = videos.filter((v) => v?.category === "anime");
    $: otherVideos = videos.filter((v) => v?.category === "other");
    $: total = catVideos.length + animeVideos.length + otherVideos.length;

    // Pre-compute category index for each video (based on rank for determinism)
    $: categoryIndexMap = (() => {
        /** @type {Map<number, number>} */
        const map = new Map();
        let catIdx = 0,
            animeIdx = 0,
            otherIdx = 0;
        for (const v of videos) {
            if (!v) continue;
            if (v.category === "cat") map.set(v.rank, catIdx++);
            else if (v.category === "anime") map.set(v.rank, animeIdx++);
            else map.set(v.rank, otherIdx++);
        }
        return map;
    })();

    // Proportional heights for each category region
    $: catHeight = (catVideos.length / total) * height;
    $: animeHeight = (animeVideos.length / total) * height;
    $: otherHeight = (otherVideos.length / total) * height;

    // Category start Y positions
    $: catStartY = 0;
    $: animeStartY = catHeight;
    $: otherStartY = catHeight + animeHeight;

    // Generate slots for each category
    $: catSlots = generateSafeSlots(catVideos.length, catStartY, catHeight, 1);
    $: animeSlots = generateSafeSlots(
        animeVideos.length,
        animeStartY,
        animeHeight,
        2,
    );
    $: otherSlots = generateSafeSlots(
        otherVideos.length,
        otherStartY,
        otherHeight,
        3,
    );

    /**
     * Calculate clustered position for a video within its category region
     * Uses slot-based positioning to avoid center text
     * @param {typeof videos[0]} video
     * @param {number} categoryCount
     * @param {number} regionStartY
     * @param {number} regionHeight
     */
    function getClusteredPosition(
        video,
        categoryCount,
        regionStartY,
        regionHeight,
    ) {
        if (!video) return { x: 0, y: 0 };

        const localIndex = categoryIndexMap.get(video.rank) ?? 0;

        // Pick the slot list based on category
        let slots = [];
        if (video.category === "cat") slots = catSlots;
        else if (video.category === "anime") slots = animeSlots;
        else slots = otherSlots;

        // Fallback if no slots (shouldn't happen with correct sizing)
        if (slots.length === 0)
            return { x: width / 2, y: regionStartY + regionHeight / 2 };

        // Assign to a slot
        const slotIndex = localIndex % slots.length;
        const slot = slots[slotIndex];

        // Add deterministic jitter
        const jitterFactorX = deterministicValue(video.rank, 10);
        const jitterFactorY = deterministicValue(video.rank, 11);

        // Jitter within +/- 20px
        const jitterX = (jitterFactorX - 0.5) * 40;
        const jitterY = (jitterFactorY - 0.5) * 40;

        return {
            x: slot.x + jitterX,
            y: slot.y + jitterY,
        };
    }

    /**
     * Get the final position for a video (clustered or grid)
     * @param {typeof videos[0]} video
     * @param {number} gridX
     * @param {number} gridY
     */
    function getFinalPosition(video, gridX, gridY) {
        if (!clustered || !video) return { x: gridX, y: gridY };

        if (video.category === "cat") {
            return getClusteredPosition(
                video,
                catVideos.length,
                catStartY,
                catHeight,
            );
        } else if (video.category === "anime") {
            return getClusteredPosition(
                video,
                animeVideos.length,
                animeStartY,
                animeHeight,
            );
        } else {
            return getClusteredPosition(
                video,
                otherVideos.length,
                otherStartY,
                otherHeight,
            );
        }
    }
</script>

<svelte:window
    on:mousemove={handleMouseMove}
    bind:innerWidth={windowWidth}
    bind:innerHeight={windowHeight}
/>

<div
    class="starfield-container"
    style:width="{width}px"
    style:height="{height}px"
>
    {#if !clustered}
        <div class="explore-bg-title">
            <img src={BilibiliLogo} alt="Bilibili" class="bg-logo" />
            <div class="bg-text">TOP100哈基米相关视频</div>
        </div>
    {/if}

    <div class="category-backgrounds">
        {#if clustered}
            <div
                class="bg-strip"
                style:top="{catStartY}px"
                style:height="{catHeight}px"
                style:background={CATEGORY_COLORS.cat.bg}
            >
                <div class="bg-content" style:color="#FF6B6B">
                    <div class="bg-label">猫咪</div>
                    <div class="bg-count">{catVideos.length}</div>
                </div>
            </div>
            <div
                class="bg-strip"
                style:top="{animeStartY}px"
                style:height="{animeHeight}px"
                style:background={CATEGORY_COLORS.anime.bg}
            >
                <div class="bg-content" style:color="#00D4FF">
                    <div class="bg-label">动漫</div>
                    <div class="bg-count">{animeVideos.length}</div>
                </div>
            </div>
            <div
                class="bg-strip"
                style:top="{otherStartY}px"
                style:height="{otherHeight}px"
                style:background={CATEGORY_COLORS.other.bg}
            >
                <div class="bg-content" style:color="#FFB347">
                    <div class="bg-label">其他</div>
                    <div class="bg-count">{otherVideos.length}</div>
                </div>
            </div>
        {/if}
    </div>

    <svg {width} {height} class="starfield-svg">
        <defs>
            <!-- Category glow filters -->
            <filter id="glow-cat" color-interpolation-filters="sRGB">
                <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    flood-color="#FF6B6B"
                    flood-opacity="0.7"
                />
            </filter>
            <filter id="glow-anime" color-interpolation-filters="sRGB">
                <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="5"
                    flood-color="#00D4FF"
                    flood-opacity="0.8"
                />
            </filter>
            <filter id="glow-other" color-interpolation-filters="sRGB">
                <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    flood-color="#FFB347"
                    flood-opacity="0.7"
                />
            </filter>
        </defs>

        <!-- (SVG Backgrounds Removed) -->

        {#each videos as video, i (video?.rank ?? i)}
            {#if video}
                {@const row = Math.floor(i / cols)}
                {@const col = i % cols}
                {@const baseX = col * cellWidth + cellWidth / 2}
                {@const baseY = row * cellHeight + cellHeight / 2}
                {@const detOffsetX = deterministicValue(video.rank, 5)}
                {@const detOffsetY = deterministicValue(video.rank, 6)}
                {@const offsetX = (detOffsetX - 0.5) * cellWidth * 0.3}
                {@const offsetY = (detOffsetY - 0.5) * cellHeight * 0.3}
                {@const gridX = baseX + offsetX}
                {@const gridY = baseY + offsetY}
                {@const pos = getFinalPosition(video, gridX, gridY)}
                {@const finalX = pos.x}
                {@const finalY = pos.y}
                {@const size = coverSize * video.scale * (clustered ? 0.85 : 1)}
                {@const halfSize = size / 2}
                {@const borderColor =
                    video.category === "cat"
                        ? "#FF6B6B"
                        : video.category === "anime"
                          ? "#00D4FF"
                          : "#FFB347"}
                {@const borderStyle =
                    video.category === "other" ? "dashed" : "solid"}

                {@const centerX = width / 2}
                {@const centerY = height / 2}
                {@const fromCenterX = centerX - finalX}
                {@const fromCenterY = centerY - finalY}

                <foreignObject
                    x={finalX - halfSize - 4}
                    y={finalY - halfSize - 4}
                    width={size + 8}
                    height={size + 8}
                    class="video-star-wrapper"
                    class:is-clustered={clustered}
                >
                    <div
                        class="video-card"
                        class:cat={video.category === "cat"}
                        class:anime={video.category === "anime"}
                        class:other={video.category === "other"}
                        style="
                            width: {size + 8}px;
                            height: {size + 8}px;
                            position: relative;
                            --delay: {video.delay}s;
                            --from-center-x: {fromCenterX}px;
                            --from-center-y: {fromCenterY}px;
                        "
                        on:mouseenter={() => (selectedVideo = video)}
                        on:mouseleave={() => (selectedVideo = null)}
                        role="img"
                        aria-label="视频: {video.title}"
                    >
                        <!-- Circle border behind the cover -->
                        <div
                            class="circle-border"
                            style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: {size + 8}px;
                                height: {size + 8}px;
                                border: 2.5px {borderStyle} {borderColor};
                                border-radius: 50%;
                                box-sizing: border-box;
                            "
                        ></div>
                        <!-- Square cover on top -->
                        <img
                            src={video.url}
                            alt={video.title}
                            style="
                                position: absolute;
                                top: 4px;
                                left: 4px;
                                width: {size}px;
                                height: {size}px;
                                object-fit: cover;
                            "
                        />
                    </div>
                </foreignObject>
            {/if}
        {/each}
    </svg>

    <!-- Info Panel (HUD Card) -->
    <div
        class="info-panel"
        class:visible={selectedVideo}
        style:top="{safeY}px"
        style:left="{safeX}px"
    >
        {#if selectedVideo}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="panel-content">
                <div class="panel-image">
                    <img src={selectedVideo.url} alt={selectedVideo.title} />
                </div>

                <div class="panel-info">
                    <div class="info-header">
                        <span class="rank-number"
                            >全站排行第{selectedVideo.rank}名</span
                        >
                        <div
                            class="category-dot"
                            class:cat={selectedVideo.category === "cat"}
                            class:anime={selectedVideo.category === "anime"}
                            class:other={selectedVideo.category === "other"}
                        ></div>
                    </div>
                    <h3 class="video-title">{selectedVideo.title}</h3>
                    <div class="info-footer">
                        <span class="category-text">
                            {#if selectedVideo.category === "cat"}#猫咪
                            {:else if selectedVideo.category === "anime"}#动漫
                            {:else}#其他{/if}
                        </span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .starfield-container {
        position: relative;
        overflow: visible;
        background: #fafafa;
        /* Radial gradient for depth */
        background: radial-gradient(
            circle at 50% 50%,
            #ffffff 0%,
            #f5f5f7 100%
        );
    }

    .explore-bg-title {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        opacity: 0.15;
        z-index: 0;
        pointer-events: none;
        width: 100%;
    }

    .bg-logo {
        height: 180px;
        width: auto;
    }

    .bg-text {
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 96px;
        font-weight: 900;
        color: #333;
        letter-spacing: 0.1em;
        text-align: center;
    }

    .starfield-svg {
        display: block;
        overflow: visible;
    }

    /* Video card styles using foreignObject */
    .video-star-wrapper {
        overflow: visible;
        /* Position transitions for smooth clustering animation */
        transition:
            x 0.8s ease-out,
            y 0.8s ease-out,
            width 0.8s ease-out,
            height 0.8s ease-out;
    }

    .video-card {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 4px;
        transform-origin: center center;
        /* Fly-in animation */
        opacity: 0;
        animation: fadeInStar 0.5s ease-out forwards;
        animation-delay: var(--delay);
        /* Hover transition */
        transition:
            transform 0.2s ease-out,
            box-shadow 0.2s ease-out;
    }

    .video-card:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .video-card.cat:hover {
        box-shadow: 0 0 20px rgba(255, 107, 107, 0.6);
    }

    .video-card.anime:hover {
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
    }

    .video-card.other:hover {
        box-shadow: 0 0 20px rgba(255, 179, 71, 0.6);
    }

    .video-card img {
        display: block;
    }

    /* Category Backgrounds (HTML) */
    .category-backgrounds {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; /* Let clicks pass to video cards */
        z-index: 0;
    }

    .bg-strip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 100vw; /* Full screen width */
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        animation: fadeInRegion 0.8s ease-out forwards;
        overflow: hidden;
    }

    .bg-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
        z-index: 0;
        opacity: 0.25; /* Increased visibility */
    }

    .bg-label {
        font-family: var(--font-serif);
        font-weight: 900;
        font-size: clamp(60px, 12vw, 150px);
        letter-spacing: 0.1em;
        line-height: 1;
        white-space: nowrap;
        user-select: none;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .bg-count {
        font-family: "Courier New", monospace;
        font-size: clamp(30px, 6vw, 60px);
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-top: -15px; /* Reduced spacing */
        opacity: 0.9;
    }

    @keyframes fadeInRegion {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    /* Info Panel - HUD Style (Redesigned) */
    .info-panel {
        position: fixed;
        /* auto positioning via inline style */
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.1s ease-out; /* faster transition for follow */
        transform: none; /* remove translateY for smoother following */
    }

    .info-panel.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .panel-content {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        width: 340px;
        padding: 12px;
        box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(12px);
    }

    .panel-image {
        flex-shrink: 0;
        width: 120px;
        aspect-ratio: 16 / 9;
        border-radius: 4px;
        overflow: hidden;
        background: #f0f0f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .panel-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .panel-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 67px; /* Match approximately image height */
    }

    .info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .rank-number {
        font-family: "Courier New", monospace; /* ID style */
        font-size: 11px;
        font-weight: 700;
        color: #999;
        letter-spacing: 0.05em;
    }

    .category-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        opacity: 0.8;
    }
    .category-dot.cat {
        background: #ff6b6b;
    }
    .category-dot.anime {
        background: #00d4ff;
    }
    .category-dot.other {
        background: #ffb347;
    }

    .video-title {
        font-family: var(--font-serif);
        font-size: 14px;
        color: #333;
        margin: 0 0 auto 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-weight: 700;
    }

    .info-footer {
        margin-top: 6px;
    }

    .category-text {
        font-size: 10px;
        color: #888;
        padding: 2px 6px;
        background: #f5f5f5;
        border-radius: 4px;
    }

    /* Animations - fly in from center */
    @keyframes fadeInStar {
        from {
            opacity: 0;
            transform: translate(var(--from-center-x), var(--from-center-y))
                scale(0.3);
        }
        to {
            opacity: 1;
            transform: translate(0, 0) scale(1);
        }
    }

    /* Responsive - Mobile fallback */
    @media (max-width: 768px) {
        .info-panel {
            bottom: 20px;
            right: 20px;
            width: calc(100% - 40px);
            max-width: 300px;
        }

        .panel-content {
            width: 100%;
        }
    }
</style>
