<script>
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import VideoGrid from "$lib/components/charts/VideoGrid.svelte";
    import VideoStarfield from "$lib/components/charts/VideoStarfield.svelte";
    import NetworkGraph from "$lib/components/charts/NetworkGraph.svelte";
    import WordCloud from "$lib/components/charts/WordCloud.svelte";
    import BalanceScale from "$lib/components/charts/BalanceScale.svelte";
    import WaveformPlayer from "$lib/components/charts/WaveformPlayer.svelte";
    import MusicJukebox from "$lib/components/charts/MusicJukebox.svelte";
    import CandlestickChart from "$lib/components/charts/CandlestickChart.svelte";
    import ChatDialogue from "$lib/components/ChatDialogue.svelte";
    import Model3DViewer from "$lib/components/Model3DViewer.svelte";
    import DanmakuRain from "$lib/components/DanmakuRain.svelte";
    import TypewriterIntro from "$lib/components/TypewriterIntro.svelte";
    import TypewriterOutro from "$lib/components/TypewriterOutro.svelte";

    import timeline from "$lib/data/timeline.json";
    import network from "$lib/data/network_v2.json";
    import comments from "$lib/data/comments.json";
    import videos from "$lib/data/videos.json";
    import jiuyangStock from "$lib/data/jiuyang_stock.json";

    const lifeWeekLogo =
        "https://hxc3aw3nnnycdgo6.public.blob.vercel-storage.com/LifeWeek_logo.png";
    const matikanetannhauser =
        "https://hxc3aw3nnnycdgo6.public.blob.vercel-storage.com/Matikanetannhauser.png";
    const maoDie =
        "https://hxc3aw3nnnycdgo6.public.blob.vercel-storage.com/MaoDie.png";
    const soymilkModel =
        "https://hxc3aw3nnnycdgo6.public.blob.vercel-storage.com/soymilk.glb";

    const script = {
        title: "我们走遍了所有的哈基米视频",
        cover: {
            paragraphs: [
                "2025年11月中旬，一款叫<b>哈基米南北绿豆浆植物饮料</b>的产品在电商平台横空出世，然后在一两天内迅速走红，卖到断货。实际上，<b>哈基米</b>并不是新梗，早在2023年，它就登榜《三联生活周刊》年度热梗。",
                "在社交平台上，<b>哈基米</b>通常被当作猫咪的代名词，随后泛指一切萌宠。一些博主将<b>哈基米</b>和<b>南北绿豆</b>等词语融入歌曲进行改编，再附加魔性的拟声词，创作出许多<b>哈基米音乐</b>，如《蓝莲哈》《基米说》。",
                '随后，许多网络视频以该系列音乐作为BGM，使得<b>哈基米</b>一梗广为流传，火遍各大社交平台。<br>以哔哩哔哩为例，在<b>哈基米</b>热门视频的评论区里，可以看到这些内容：<br>"踹我一脚让我再听一遍吧，我什么都会干的。"<br>"我觉得我活着就是为了听到这个。"<br>"我闺女差8天满6个月听这个从出生起第一次笑出声。"',
            ],
        },
        exploration:
            "B站（哔哩哔哩）是哈基米视频诞生的摇篮。<br>你能看懂背景里的这些视频封面吗？",
        chapters: [
            {
                id: 1,
                title: "“哈基米”与猫咪的强关联从何而来？",
                paragraphs: [
                    "相信不少人都在猫咪视频里听过<b>哈基米</b>这段旋律，但其实它原本和猫可以说毫无关系。作为日语はちみ（hachimi）的音译，<b>哈基米</b>本意是一种蜂蜜饮料。它最早的出处，是番剧《赛马娘》第二季，里面的角色东海帝王哼的一首洗脑小曲儿。",
                    "这首歌后来被二创反复搬运，离开原语境太久，终于在2022年迎来<b>重大转折</b>——哔哩哔哩博主京桥刹那将《CLANNAD》的BGM与东海帝王的哼唱混在一起，创作了“哈基米莫南北绿豆”的鬼畜神曲。没错，就是现在疯狂给你洗脑的那个版本。",
                    "可爱的音乐配上俏皮的动漫角色，让这首歌备受萌宠赛道的青睐，又因为<b>mi</b>的发音与<b>咪</b>类似，而与海量猫咪视频绑定，最终在网友心里潜移默化形成了<b>哈基米=可爱小猫</b>的认知。仅2023年，抖音<b>哈基米挑战</b>这个话题的累计播放量就超过十亿次。哈基米也成了许多萌宠区up主们没活儿了也要整一个的流量密码。",
                ],
            },
            {
                id: 2,
                title: "哈基米是块砖，哪里需要往哪搬",
                paragraphs: [
                    "当哈基米与猫咪完成深度绑定，又凭借魔性旋律站稳萌宠赛道后，这场狂欢并未止步于此。",
                    "一个梗如果只服务猫，那它顶多只能晋升为猫圈顶流。但哈基米不一样，作为一颗万能螺丝钉，它具有极强的适配性。哪里需要可爱，它去可爱；哪里需要抽象，它去抽象；哪里需要救场，它去救场……",
                    "别的梗是来上网的，它是来上班的。你会发现它的分支越来越多：猫、赛马娘、鬼畜、生活记录、美食、音乐……甚至足球都来凑热闹。",
                ],
            },
            {
                id: 3,
                title: "从耳朵到购物车，只差一个<b>手滑</b>",
                paragraphs: [
                    "我们常说，人多的地方，就会有摊位。流量多的地方，也会有链接。你可以理解为，当一个梗从<b>大家哈哈哈</b>进化到<b>大家都认识</b>，下一步可能就是：<b>大家开始买点啥。</b>",
                    "于是时间线来到开头提到的2025年11月中旬，九阳豆业推出了<b>哈基米南北绿豆浆植物饮料</b>。从产品本身看，其配料表只有大豆、绿豆、水、白砂糖和冰糖，主打0脂肪，无乳糖。作为流量新贵，它的走红之路也很<b>互联网</b>：你买的可能不是绿豆浆，而是一张<b>我参与过这场热梗</b>的门票。价格更是精准拿捏人性：15袋装29.9元，卡在一个极其微妙的区间。",
                    "资本市场也跟着起哄，因为名字里带着<b>九阳</b>，A股上市公司九阳股份被股民误当成<b>豆浆概念股</b>热捧，股价一度连板，公司不得不紧急澄清。要知道，九阳股份曾在10月底发布了Q3季度财报，但当时也仅仅只涨了0.9%。公司不得不紧急出面澄清自己与九阳豆业早无关系。<br><br>据悉，九阳豆浆是九阳豆业旗下商标，该公司最初由九阳股份全资持股。但2023年时，九阳股份对外宣称，为了更好聚焦小家电主业，推进公司长期可持续发展，公司把九阳豆业的全部股份都转让给了Solar Blue (HK) Limited。这是一家由九阳股份实控人王旭宁全资持股的公司，一番变动下来，九阳股份不再持有九阳豆浆的股份，但王旭宁间接持有其49.65%的股权。",
                ],
            },
            {
                id: 4,
                title: "“哈基米音乐” 到底为啥<b>戳中</b>我们？",
                paragraphs: [
                    "<b>你也许不认识我，但你一定听过我的哈基米音乐</b>，这对于许多人来说是相当真实的写照。<br><br>哪怕你从来没有关注过任何关于哈基米的信息，也很难逃过从无数短视频中突然蹦出来的一声<b>哈基米</b>。像互联网在你耳朵里自动续费了个会员，到期也不提醒，直接给你续上下一条。",
                    "那它到底凭什么这么洗脑？哈基米音乐有着十分统一的特征：乐句由<b>哈基米</b>、<b>曼波</b>等简短、重复的音节构成，电子调音使其呈现出魔性、机械的听觉效果，音效们被拼贴使用，宛如一锅杂烩。",
                    "传统歌曲是通过旋律与歌词结合的方式来传递情感与思想，哈基米音乐则彻底抛弃了有意义的歌词，仅仅保留旋律的节奏快感，抽空了语言的重负。<br><br>以互联网二创歌曲《蓝莲哈》和《跳楼基》为例，它们的歌词是这样的：“哈基米喔南北绿豆，阿西嗨呀库乃路”“哈基米南北绿豆，阿西噶阿西”，让人完全摸不着头脑。<br><br>也正因如此，听众无需理解作品的意义就能沉醉其中，这种<b>无意义</b>本身，是对信息爆炸时代<b>意义过度饱和</b>的一种回应，也是年轻人对思想重负的一种调节，正如哔哩哔哩用户在评论区所说的：“半夜加完班回来看了这个心情变好了一点。”",
                ],
            },
            {
                id: 5,
                title: "哈基米音乐的泛化也带来了语言的解放。",
                paragraphs: [
                    "人们开始用<b>哈基</b>开头来组装各种拼好词：<br>男人叫<b>哈基帅</b>，<br>女人叫<b>哈基美</b>，<br>大狗叫<b>哈基汪</b>，<br>聪明通人性的猫咪叫<b>哈基米德</b>。<br>当你觉得某个创意已经是登峰造极、可以称得上<br><b>基米本天成，哈谢偶得之</b><br>的时候，<br>你再看看你后面，<br>就会发现这种<b>家里需要请哈基高</b>的天才，<br>在这个时代还有无数个。",
                ],
            },
        ],
        // User will add new conclusion content later
        conclusion: {
            title: "",
            paragraphs: [],
        },
    };

    // Intro paragraphs for typewriter effect
    const introParagraphs = [
        `哈基米你是不是自己都不知道自己咋来的？`,
        `其实，我更想问的是：
我到底是怎么被你洗脑的？`,
        `事情发生在一个非常普通，
也非常危险的瞬间。`,
        `我一不小心打开哔哩哔哩，
又一不小心点进一个啥哈基米视频。`,
        `下一秒，脑子被按下了上头快捷键：
耳朵负责循环，手指负责下一条，理智负责下线。`,
        `更诡异的是：
这事儿还不止我一个人中招！`,
    ];

    // Outro paragraphs for typewriter effect (Final Conclusion)
    const outroParagraphs = [
        `事情最终还是回到了原点：
我们本来只是想研究一个网络热梗的流变，
结果研究着研究着，又想听一遍。`,
        `所以如果你此刻又忍不住想点开下一条，
也别怪自己意志薄弱。`,
        `毕竟在这个信息爆炸的时代，
<b>哈基米，也是来打卡的。</b>`,
    ];

    let showIntro = true;
    let showOutro = false;
    let introStartPage = 0;
    let readerCount = 1; // Will be updated from Vercel KV
    let hasCountedVisit = false; // Prevent double counting

    // Check localStorage on mount to skip intro if already seen
    function checkIntroSeen() {
        if (typeof window !== "undefined") {
            const seen = localStorage.getItem("hachimi-intro-seen");
            if (seen === "true") {
                showIntro = false;
            }
        }
    }

    function handleIntroComplete() {
        showIntro = false;
        // Save to localStorage so intro won't show again on refresh
        if (typeof window !== "undefined") {
            localStorage.setItem("hachimi-intro-seen", "true");
        }
    }

    function showIntroFromCover() {
        // Return to the last intro page (index 5 for 6 paragraphs)
        introStartPage = 5;
        showIntro = true;
    }

    let currentStep = 0;
    let progress = 0;
    let innerWidth = 800;
    let innerHeight = 600;

    // Track if user has selected a song (required before proceeding to final chapter 4 paragraph)
    let hasSongSelected = false;

    // Handler for when user selects a song in MusicJukebox
    function handleSongSelected() {
        hasSongSelected = true;
    }

    $: chartWidth = Math.min(600, innerWidth * 0.85);
    $: chartHeight = Math.min(450, innerHeight * 0.55);

    // Map steps to visualization types
    // Map steps to visualization types
    const stepToViz = [
        "intro", // 0: 封面 - 第一段
        "intro", // 1: 封面 - 第二段
        "intro", // 2: 封面 - 第三段
        "grid", // 3: 第一章 - 封面墙
        "explore", // 4: 自由探索封面（滚动距离）
        "cluster", // 5: 聚类动画
        "network", // 6: 第二章 - 网络图
        "balance", // 7: 第三章(上) - 豆浆+聊天
        "balance", // 8: 第三章(下) - 豆浆+K线
        "waveform", // 9: 第四章(上) - 波形 + 前两段文字
        "waveform", // 10: 第四章(下) - 波形 + 第三段文字 (需选歌后才能滚动到)
        "conclusion", // 11: 第五章 - 显示章节5文字面板
        "outro", // 12: 结语 - TypewriterOutro
    ];

    $: currentViz = stepToViz[currentStep] || "intro";
    $: balanceStage =
        currentStep >= 7 ? Math.min(2, Math.floor(progress * 3)) : 0;
    $: chatStage = currentStep >= 7 ? Math.min(5, Math.floor(progress * 6)) : 0;

    // Auto-show outro when reaching outro step
    $: if (currentViz === "outro" && !showOutro) {
        showOutro = true;
        // Increment visitor count when entering outro for the first time
        if (!hasCountedVisit) {
            hasCountedVisit = true;
            fetch("/api/visitor-count", { method: "POST" })
                .then((res) => res.json())
                .then((data) => {
                    if (data.count) readerCount = data.count;
                })
                .catch(console.error);
        }
    }

    function handleOutroPrev() {
        showOutro = false;
        // Scroll back to Step 11 (Chapter 5) to prevent immediate re-triggering of outro
        // because we are currently at Step 12's scroll position
        if (typeof document !== "undefined") {
            const steps = document.querySelectorAll(".step");
            if (steps[11]) {
                steps[11].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }

    /** @type {Element[]} */
    let stepElements = [];

    // Scroll gate: track if scrolling should be blocked
    let scrollLocked = false;
    let lockedScrollY = 0;

    function handleScroll() {
        if (typeof window === "undefined") return;

        const viewportCenter = window.innerHeight / 2;

        // Check if we're above all steps (at the hero/cover section)
        if (stepElements.length > 0) {
            const firstStepRect = stepElements[0].getBoundingClientRect();
            if (firstStepRect.top > viewportCenter) {
                // We're above all steps - show intro/hero visualization
                if (currentStep !== 0) {
                    currentStep = 0;
                }
                scrollLocked = false;
                return;
            }
        }

        // Check for gap between Step 9 and Step 10 (gate position)
        if (stepElements.length > 10 && !hasSongSelected) {
            const step9Rect = stepElements[9].getBoundingClientRect();
            const step10Rect = stepElements[10].getBoundingClientRect();

            // Check if viewport center is in the gap between Step 9 and Step 10
            if (
                step9Rect.bottom < viewportCenter &&
                step10Rect.top > viewportCenter
            ) {
                // We're in the gap! Calculate progress within the gap
                const gapStart = step9Rect.bottom;
                const gapEnd = step10Rect.top;
                const gapSize = gapEnd - gapStart;
                const progressInGap = (viewportCenter - gapStart) / gapSize;

                // Lock at midpoint (50%) of the gap
                if (progressInGap >= 0.5) {
                    if (!scrollLocked) {
                        scrollLocked = true;
                        lockedScrollY = window.scrollY;
                    }
                    // Keep at Step 9
                    if (currentStep !== 9) {
                        currentStep = 9;
                    }
                    return;
                } else {
                    scrollLocked = false;
                }
            }
        }

        for (let i = 0; i < stepElements.length; i++) {
            const rect = stepElements[i].getBoundingClientRect();

            if (rect.top < viewportCenter && rect.bottom > viewportCenter) {
                // If at Step 10+ without song selected, lock and scroll back
                if (i >= 10 && !hasSongSelected) {
                    if (!scrollLocked) {
                        scrollLocked = true;
                        lockedScrollY = window.scrollY - 50;
                        window.scrollTo(0, lockedScrollY);
                    }
                } else {
                    scrollLocked = false;
                }

                if (currentStep !== i) {
                    currentStep = i;
                }
                progress = Math.max(
                    0,
                    Math.min(1, (viewportCenter - rect.top) / rect.height),
                );
                return;
            }
        }
    }

    // Wheel event handler to block scrolling when locked
    /** @param {WheelEvent} event */
    function handleWheel(event) {
        if (scrollLocked && !hasSongSelected && event.deltaY > 0) {
            // Block downward scroll
            event.preventDefault();
            window.scrollTo(0, lockedScrollY);
        }
    }

    // Touch event handler for mobile
    let touchStartY = 0;
    /** @param {TouchEvent} event */
    function handleTouchStart(event) {
        touchStartY = event.touches[0].clientY;
    }

    /** @param {TouchEvent} event */
    function handleTouchMove(event) {
        if (scrollLocked && !hasSongSelected) {
            const touchY = event.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            if (deltaY > 0) {
                // Block downward scroll (swiping up)
                event.preventDefault();
                window.scrollTo(0, lockedScrollY);
            }
        }
    }

    // When song is selected, unlock scrolling
    $: if (hasSongSelected) {
        scrollLocked = false;
    }

    onMount(() => {
        checkIntroSeen();
        stepElements = Array.from(document.querySelectorAll(".step"));

        // Check if user is past the gate position on page load (e.g., after refresh)
        // If so, assume they've already selected a song
        if (stepElements.length > 10) {
            const viewportCenter = window.innerHeight / 2;
            const step10Rect = stepElements[10].getBoundingClientRect();
            // If Step 10 is above the viewport center, user is past the gate
            if (step10Rect.top < viewportCenter) {
                hasSongSelected = true;
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        window.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        handleScroll();
    });

    onDestroy(() => {
        if (typeof window !== "undefined") {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
        }
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svelte:head>
    <title>{script.title}</title>
    <meta
        name="description"
        content="探索哈基米梗的奇妙漂流——从赛马娘到猫咪视频的文化流变"
    />
</svelte:head>

<main class:scroll-locked={scrollLocked}>
    <!-- Typewriter Introduction Pages -->
    {#if showIntro}
        <TypewriterIntro
            texts={introParagraphs}
            startPage={introStartPage}
            on:complete={handleIntroComplete}
        />
    {/if}

    <!-- Typewriter Outro Pages (Chapter 5 / Conclusion) -->
    {#if showOutro}
        <TypewriterOutro
            texts={outroParagraphs}
            {readerCount}
            on:complete={() => (showOutro = false)}
            on:prev={handleOutroPrev}
        />
    {/if}

    <!-- Hero Section - Magazine Cover Style -->
    <header
        class="hero magazine-style"
        on:wheel={(e) => {
            if (!showIntro && e.deltaY < 0) {
                e.preventDefault();
                showIntroFromCover();
            }
        }}
    >
        <DanmakuRain />

        <!-- Main content -->
        <div class="hero-content">
            <h1 class="hero-headline animate-fade-in">
                年度十大热梗，30岁以下请进
            </h1>
            <p class="hero-warning animate-fade-in" style="--delay: 0.1s">
                爆梗警告！！
            </p>

            <!-- Dictionary-style sticky note -->
            <div class="sticky-note animate-fade-in" style="--delay: 0.2s">
                <div class="tape tape-top"></div>
                <div class="note-content">
                    <!-- Word header with pinyin -->
                    <div class="word-header">
                        <span class="word-pinyin"
                            >hā jī mǐ · hachimi · はちみ
                        </span>
                    </div>

                    <!-- Main word -->
                    <h2 class="word-main">哈基米</h2>

                    <!-- Definition -->
                    <div class="word-definition">
                        <p class="definition-text">
                            出自猫猫视频的背景音乐，哈基米直译是蜂蜜水，但因为调音后的可爱曲调和猫猫的形象非常适配而走红。
                        </p>
                    </div>
                </div>

                <!-- Magazine logo - positioned below the sticky note -->
                <a
                    href="https://mp.weixin.qq.com/s/jA9MQlmZ1ZB8oTW7meVTGQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="magazine-logo-wrapper animate-fade-in"
                    style="--delay: 0.4s"
                >
                    <span class="from-text">释义参考</span>
                    <img
                        src={lifeWeekLogo}
                        alt="生活周刊"
                        class="magazine-logo-img"
                    />
                </a>
            </div>
        </div>

        <!-- Scroll Hint -->
        <div class="scroll-hint animate-fade-in" style="--delay: 0.6s">
            <span class="scroll-text">继续阅读</span>
            <span class="scroll-arrow">↓</span>
        </div>

        <!-- Character images on cover -->
        <div class="cover-characters">
            <img
                src={matikanetannhauser}
                alt="东海帝王"
                class="cover-char left"
            />
            <img src={maoDie} alt="猫咪" class="cover-char right" />
        </div>
    </header>

    <!-- Scrollytelling Section -->
    <section class="scrolly-section">
        <div class="scrolly-container">
            <!-- Sticky visualization area -->
            <div
                class="scrolly-graphic"
                class:transparent={currentViz === "intro"}
            >
                <div
                    class="viz-wrapper"
                    class:wide-layout={currentViz === "conclusion"}
                >
                    {#if currentViz === "intro"}
                        <div
                            class="viz-intro"
                            in:fade={{ duration: 400 }}
                            out:fade={{ duration: 300 }}
                        ></div>
                    {:else if currentViz === "grid" || currentViz === "explore" || currentViz === "cluster"}
                        <div
                            class="viz-fade-wrapper"
                            in:fade={{ duration: 400 }}
                            out:fade={{ duration: 300 }}
                        >
                            <VideoStarfield
                                width={innerWidth}
                                height={innerHeight}
                                clustered={currentViz === "cluster"}
                            />
                        </div>
                    {:else if currentViz === "network"}
                        <div
                            class="viz-fade-wrapper"
                            in:fade={{ duration: 400 }}
                            out:fade={{ duration: 300 }}
                        >
                            <NetworkGraph
                                data={network}
                                width={Math.min(950, innerWidth * 0.95)}
                                height={Math.min(650, innerHeight * 0.8)}
                            />
                        </div>
                    {:else if currentViz === "waveform" || currentViz === "conclusion"}
                        <div
                            class="viz-fade-wrapper"
                            class:conclusion-layout={currentViz ===
                                "conclusion"}
                            in:fade={{ duration: 400 }}
                            out:fade={{ duration: 300 }}
                        >
                            <div class="jukebox-container">
                                <MusicJukebox
                                    showComparison={true}
                                    conclusionMode={currentViz === "conclusion"}
                                    highlightPullup={currentStep === 9 &&
                                        !hasSongSelected}
                                    on:songSelected={handleSongSelected}
                                />
                            </div>

                            <!-- Always render panel but control visibility with CSS -->
                            <div
                                class="conclusion-text-panel-wrapper"
                                class:visible={currentViz === "conclusion"}
                            >
                                <div class="conclusion-text-panel">
                                    <div class="step-chapter">
                                        <span class="chapter-num">05</span>
                                    </div>
                                    <h2
                                        class="step-title"
                                        style="margin-top: 15px;"
                                    >
                                        {@html script.chapters[4].title}
                                    </h2>
                                    <p>
                                        {@html script.chapters[4].paragraphs[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Preloaded 3D Model Section -->
                    <div
                        class="chapter4-split"
                        class:visible={currentViz === "balance"}
                    >
                        <div
                            class="chapter4-model"
                            class:model-center={currentStep === 7}
                            class:model-left={currentStep !== 7}
                        >
                            <Model3DViewer
                                src={soymilkModel}
                                alt="九阳豆浆机 3D 模型"
                                width={Math.min(840, innerWidth * 0.66)}
                                height={Math.min(900, innerHeight * 1.0)}
                                autoRotate={true}
                                cameraOrbit="30deg 70deg 5.4m"
                            />
                        </div>

                        <!-- Chat Overlay (Step 7) -->
                        {#if currentStep === 7}
                            <div
                                class="overlay-wrapper"
                                transition:fade={{ duration: 500 }}
                            >
                                <ChatDialogue
                                    visible={true}
                                    split={true}
                                    {progress}
                                />
                            </div>
                        {/if}

                        <!-- Chart (Step 8 only) -->
                        {#if currentStep === 8}
                            <div
                                class="chapter4-right-panel"
                                transition:fade={{ duration: 500 }}
                            >
                                <div class="chapter4-chart">
                                    <CandlestickChart
                                        data={jiuyangStock.data}
                                        width={Math.min(650, innerWidth * 0.55)}
                                        height={Math.min(
                                            550,
                                            innerHeight * 0.7,
                                        )}
                                        eventDate={jiuyangStock.event_date}
                                    />
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Scrolling text content -->
            <!-- Scrolling text content -->
            <div class="scrolly-text">
                <!-- Steps 0-2: Intro hook (Cover) -->
                {#each script.cover.paragraphs as p, i}
                    <div class="step" class:is-active={currentStep === i}>
                        <p class="step-hook">{@html p}</p>
                    </div>
                {/each}

                <!-- Step 3: Chapter 1: Origin -->
                <div class="step" class:is-active={currentStep === 3}>
                    <div class="step-chapter">
                        <span class="chapter-num">01</span>
                    </div>
                    <h2 class="step-title">{@html script.chapters[0].title}</h2>
                    {#each script.chapters[0].paragraphs as p}
                        <p>{@html p}</p>
                    {/each}
                </div>

                <!-- Step 4: Exploration (empty step for scrolling distance) -->
                <div class="step" class:is-active={currentStep === 4}>
                    <p>{@html script.exploration}</p>
                </div>

                <!-- Step 5: Clustering Animation -->
                <div class="step" class:is-active={currentStep === 5}>
                    <div class="step-chapter">
                        <span class="chapter-num">02</span>
                    </div>
                    <h2 class="step-title">{@html script.chapters[1].title}</h2>
                    <p>{@html script.chapters[1].paragraphs[0]}</p>
                    <p>{@html script.chapters[1].paragraphs[1]}</p>
                </div>

                <!-- Step 6: Network Graph -->
                <div class="step" class:is-active={currentStep === 6}>
                    <p>{@html script.chapters[1].paragraphs[2]}</p>
                </div>

                <!-- Step 7: Commercialization Part 1 (Chat) -->
                <div class="step" class:is-active={currentStep === 7}>
                    <div class="step-chapter">
                        <span class="chapter-num">03</span>
                    </div>
                    <h2 class="step-title">{@html script.chapters[2].title}</h2>
                    <p>{@html script.chapters[2].paragraphs[0]}</p>
                    <p>{@html script.chapters[2].paragraphs[1]}</p>
                </div>

                <!-- Step 8: Commercialization Part 2 (Chart) -->
                <div class="step" class:is-active={currentStep === 8}>
                    <p>{@html script.chapters[2].paragraphs[2]}</p>
                </div>

                <!-- Step 9: Audio challenge Part 1 -->
                <div class="step" class:is-active={currentStep === 9}>
                    <div class="step-chapter">
                        <span class="chapter-num">04</span>
                    </div>
                    <h2 class="step-title">{@html script.chapters[3].title}</h2>
                    <p>{@html script.chapters[3].paragraphs[0]}</p>
                    <p>{@html script.chapters[3].paragraphs[1]}</p>
                </div>

                <!-- Step 10: Audio challenge Part 2 (requires song selection) -->
                <div class="step" class:is-active={currentStep === 10}>
                    <p>{@html script.chapters[3].paragraphs[2]}</p>
                </div>

                <!-- Step 11: Chapter 5 - 语言的解放 -->
                <div
                    class="step step-conclusion"
                    class:is-active={currentStep === 11}
                    style="opacity: 0; pointer-events: none; min-height: 80vh;"
                >
                    <!-- Chapter 5 content is in the conclusion panel -->
                </div>

                <!-- Step 12: Final Outro / 结语 -->
                <div
                    class="step step-outro"
                    class:is-active={currentStep === 12}
                    style="opacity: 0; pointer-events: none; min-height: 80vh;"
                >
                    <!-- Outro content is in TypewriterOutro -->
                </div>
            </div>
        </div>
    </section>
</main>

<style>
    main {
        min-height: 100vh;
    }

    /* Scroll locked state - disable interactions except for jukebox */
    main.scroll-locked {
        cursor: not-allowed;
    }

    main.scroll-locked .scrolly-text {
        pointer-events: none;
    }

    main.scroll-locked .hero {
        pointer-events: none;
    }

    /* Keep only album galleries interactive when scroll is locked */
    main.scroll-locked :global(.gallery-column) {
        pointer-events: auto;
        cursor: pointer;
    }

    /* ==================== HERO SECTION - MAGAZINE STYLE ==================== */
    .hero.magazine-style {
        position: sticky; /* Changed from relative to sticky */
        top: 0;
        z-index: 0; /* Lower z-index so scrolly-section covers it */
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 60px 80px;
        overflow: hidden;
        /* Paper texture background - more visible */
        background-color: #e5dfd0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"),
            linear-gradient(180deg, #ebe5d6 0%, #ddd7c8 100%);
    }

    /* Paper grain texture overlay - visible */
    .hero.magazine-style::before {
        content: "";
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(100, 85, 70, 0.04) 1px,
            rgba(100, 85, 70, 0.04) 2px
        );
        pointer-events: none;
        z-index: 1;
    }

    .hero-content {
        position: relative;
        z-index: 2; /* Keep content above background elements */
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .hero-headline {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: clamp(2.8rem, 6vw, 4.5rem);
        font-weight: 900;
        color: #1a1a1a;
        margin-bottom: 0;
        line-height: 1.1;
        text-align: left;
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
    }

    .hero-warning {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: clamp(1.8rem, 4.2vw, 2.64rem);
        font-weight: 900;
        color: #c41e1e;
        margin-bottom: var(--space-12);
        text-align: left;
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: var(--delay, 0s);
    }

    /* Dictionary-style Sticky Note */
    .sticky-note {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(180deg, #fffef5 0%, #f8f6eb 100%);
        border: 1px solid #d4d0c0;
        padding: 28px 32px;
        width: 380px;
        box-shadow:
            4px 6px 16px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        opacity: 0;
        animation: fadeInNote 0.6s ease-out forwards;
        animation-delay: var(--delay, 0s);
        z-index: 10;
    }

    .note-content {
        text-align: left;
    }

    .word-header {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
        margin-bottom: var(--space-2);
    }

    .word-pinyin {
        font-family: "Inter", sans-serif;
        font-size: 1.1rem;
        color: #666;
    }

    .word-type {
        font-size: 0.85rem;
        color: #999;
    }

    .word-main {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: 3rem;
        font-weight: 900;
        color: #1a1a1a;
        margin: 0 0 var(--space-4) 0;
        line-height: 1.2;
    }

    .word-definition {
        border-left: 3px solid #c41e1e;
        padding-left: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .definition-text {
        font-family: "Noto Sans SC", sans-serif;
        font-size: 0.95rem;
        line-height: 1.7;
        color: #444;
        margin: 0;
    }

    .word-tags {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
    }

    .tag {
        font-size: 0.75rem;
        padding: 4px 10px;
        background: rgba(196, 30, 30, 0.1);
        color: #c41e1e;
        border-radius: 3px;
        font-family: "Noto Sans SC", sans-serif;
    }

    .tape {
        position: absolute;
        width: 60px;
        height: 20px;
        background: rgba(255, 255, 220, 0.7);
        top: -10px;
        left: 50%;
        transform: translateX(-50%) rotate(2deg);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .polaroid-inner {
        border: 1px solid #ddd;
        padding: var(--space-3);
        background: white;
    }

    .polaroid-header {
        display: flex;
        justify-content: space-between;
        font-size: 8px;
        color: #999;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-2);
        text-transform: uppercase;
    }

    .pinyin-row {
        display: flex;
        justify-content: center;
        gap: var(--space-6);
        font-size: var(--font-size-lg);
        color: #333;
        margin-bottom: var(--space-2);
    }

    .hanzi-row {
        display: flex;
        justify-content: center;
        gap: var(--space-3);
    }

    .hanzi-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border: 2px solid #1a1a1a;
        font-size: 2rem;
        font-weight: 700;
        font-family: "Noto Sans SC", sans-serif;
    }

    /* Magazine Logo */
    .magazine-logo-wrapper {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: var(--space-4);
        display: flex;
        align-items: center;
        gap: var(--space-3);
        text-decoration: none;
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: var(--delay, 0s);
        white-space: nowrap;
    }

    .from-text {
        font-family: "Source Han Serif CN Heavy", "Noto Serif SC", serif;
        font-size: 1.1rem;
        font-weight: 500;
        color: #666;
        margin-top: -15px;
        margin-right: -5px;
    }

    .magazine-logo-img {
        height: 64px;
        width: auto;
        display: block;
    }

    .logo-main {
        font-size: var(--font-size-2xl);
        font-weight: 900;
        font-family: "Noto Serif SC", serif;
    }

    .logo-sub {
        font-size: 8px;
        margin-left: 2px;
        margin-right: 2px;
        opacity: 0.8;
        text-transform: uppercase;
    }

    .logo-weekly {
        font-size: var(--font-size-lg);
        font-weight: 700;
        font-family: "Noto Sans SC", sans-serif;
    }

    .scroll-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-self: center;
        margin-top: auto;
        gap: var(--space-3);
        color: #888;
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: var(--delay, 0s);
    }

    .scroll-line {
        width: 1px;
        height: 60px;
        background: linear-gradient(to bottom, #d42f2f, transparent);
        animation: pulse 2s ease-in-out infinite;
    }

    /* Scroll Hint */
    .scroll-hint {
        position: absolute;
        bottom: 2%;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 10;
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: var(--delay, 0s);
    }

    .scroll-text {
        font-family: "Source Han Serif CN", "Noto Serif SC", serif;
        font-size: 0.9rem;
        font-weight: 500;
        color: #666;
        letter-spacing: 0.15em;
        animation: textPulse 2s ease-in-out infinite;
    }

    .scroll-arrow {
        font-size: 1.5rem;
        color: #c41e1e;
        animation: arrowBounce 1.5s ease-in-out infinite;
    }

    @keyframes textPulse {
        0%,
        100% {
            opacity: 0.6;
        }
        50% {
            opacity: 1;
        }
    }

    @keyframes arrowBounce {
        0%,
        100% {
            transform: translateY(0);
            opacity: 0.7;
        }
        50% {
            transform: translateY(8px);
            opacity: 1;
        }
    }

    /* Cover page character images */
    .cover-characters {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 250px;
        pointer-events: none;
        z-index: 1;
    }

    .cover-char {
        max-height: 250px;
        width: auto;
        object-fit: contain;
        position: absolute;
        bottom: 0;
    }

    .cover-char.left {
        left: 40px;
    }

    .cover-char.right {
        right: 40px;
    }

    /* ==================== SCROLLYTELLING ==================== */
    .scrolly-section {
        position: relative;
        z-index: 10; /* Above sticky hero */
    }

    .scrolly-container {
        position: relative;
    }

    .scrolly-graphic {
        position: fixed;
        inset: 0;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        z-index: 0;
        pointer-events: none;
        background: var(--color-bg);
        transition: background-color 0.5s ease;
    }

    .scrolly-graphic.transparent {
        background: transparent;
    }

    .scrolly-graphic > * {
        pointer-events: auto;
    }

    .viz-wrapper {
        position: relative;
        width: 100%;
        max-width: 900px;
        min-height: 500px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: max-width 0.5s ease;
    }

    .viz-wrapper.wide-layout {
        max-width: 1200px;
    }

    .viz-fade-wrapper {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    /* Intro visualization */
    .viz-intro {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
    }

    .cat-icon {
        font-size: 120px;
        transition: transform var(--transition-slower);
    }

    .cat-icon.active {
        animation: float 3s ease-in-out infinite;
    }

    .viz-caption {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
    }

    .viz-conclusion {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
    }

    .conclusion-flow {
        display: flex;
        align-items: center;
        gap: var(--space-4);
    }

    .flow-item {
        font-size: 72px;
    }

    .flow-arrow {
        font-size: var(--font-size-2xl);
        color: var(--color-text-muted);
    }

    /* Chapter 4: Split layout - 3D Model + Candlestick */
    .chapter4-split {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: var(--space-4);
        opacity: 0;
        visibility: hidden;
        z-index: -1;
        pointer-events: none;
        /* Fade out: fast opacity (150ms), delayed visibility/z-index */
        transition:
            opacity 0.15s ease-out,
            visibility 0s 0.15s,
            z-index 0s 0.15s;
    }

    .chapter4-split.visible {
        opacity: 1;
        visibility: visible;
        z-index: 5;
        pointer-events: auto;
        /* Fade in: smooth opacity (500ms), immediate z-index/visibility */
        transition:
            opacity 0.5s ease-in-out,
            visibility 0s,
            z-index 0s;
    }

    .chapter4-model {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chapter4-right-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        position: relative; /* For transitions inside */
    }

    .chapter4-chart {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    @media (max-width: 900px) {
        .chapter4-split {
            flex-direction: column;
            gap: var(--space-2);
        }

        .chapter4-model,
        .chapter4-chart {
            width: 100%;
            justify-content: center;
        }
    }

    /* Conclusion visualization */
    .viz-conclusion {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
    }

    .conclusion-flow {
        display: flex;
        align-items: center;
        gap: var(--space-4);
    }

    .flow-item {
        font-size: 64px;
        transition: transform var(--transition-normal);
    }

    .flow-item:hover {
        transform: scale(1.1);
    }

    .flow-arrow {
        font-size: var(--font-size-2xl);
        color: var(--color-text-muted);
    }

    /* ==================== STEP CARDS ==================== */
    .scrolly-text {
        position: relative;
        z-index: 10;
        max-width: var(--step-max-width);
        margin: 0 auto;
        padding: var(--space-4);
        padding-top: 85vh;
        padding-bottom: 50vh;
        pointer-events: none; /* Allow clicks to pass through to visualization */
    }

    .step {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        padding: var(--space-6);
        background: var(--step-bg);
        border: 1px solid var(--step-border);
        border-radius: 0;
        margin-bottom: 150vh;
        box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.12),
            0 2px 4px rgba(0, 0, 0, 0.08);
        /* All steps always fully visible - no opacity animation */
        opacity: 1;
        transition: none !important;
        animation: none !important;
        transform: none !important;
        filter: none !important;
        pointer-events: auto; /* Step cards remain clickable */
    }

    .step.is-active {
        opacity: 1;
        transform: none;
        filter: none;
    }

    .step-chapter {
        display: flex;
        align-items: baseline;
        gap: var(--space-2);
        margin-bottom: var(--space-1);
    }

    .chapter-num {
        font-family: var(--font-serif);
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-accent);
        opacity: 0.25;
        line-height: 1;
    }

    .step-title {
        font-family: var(--font-serif);
        font-size: var(--font-size-xl);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--space-2);
    }

    .step p {
        color: var(--color-text-secondary);
        line-height: 1.8;
        margin-bottom: var(--space-2);
    }

    .step p:last-child {
        margin-bottom: 0;
    }

    .step-hook {
        font-size: var(--font-size-lg);
        color: var(--color-text);
        line-height: 1.9;
    }

    .step-annotation {
        background: rgba(255, 255, 255, 0.92);
        border-left: 3px solid var(--color-accent);
    }

    .step-annotation p {
        font-size: var(--font-size-sm);
    }

    .step-conclusion {
        text-align: center;
        padding: var(--space-8);
    }

    .conclusion-title {
        font-size: var(--font-size-2xl);
        color: var(--color-text);
        margin-bottom: var(--space-4);
        line-height: 1.4;
    }

    /* ==================== FOOTER ==================== */
    .site-footer {
        position: relative;
        z-index: 20;
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--step-border);
        padding: var(--space-12) var(--space-4);
    }

    .footer-content {
        text-align: center;
    }

    .footer-source {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-2);
    }

    .footer-credits {
        color: var(--color-text-muted);
        font-size: var(--font-size-xs);
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 768px) {
        .hero-headline {
            font-size: clamp(2rem, 10vw, 3rem);
        }

        .hero-warning {
            font-size: var(--font-size-base);
        }

        .cat-icon {
            font-size: 80px;
        }

        .flow-item {
            font-size: 48px;
        }

        .step {
            padding: var(--space-4);
            margin-bottom: 80vh;
        }

        .chapter-num {
            font-size: var(--font-size-2xl);
        }
    }

    /* Step Styling Override for Conclusion */
    .step-conclusion {
        margin-left: auto;
        margin-right: 5%;
        max-width: 450px !important;
        text-align: left;
    }

    /* Mobile adjustments */
    @media (max-width: 900px) {
        .step-conclusion {
            margin: 0 auto;
            max-width: 100% !important;
        }
    }
    /* Conclusion Layout */
    .conclusion-layout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-8);
        width: 100%;
        padding: 0 var(--space-4);
    }

    /* Jukebox container with smooth position transition */
    .jukebox-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 400px;
        /* Remove margin/position transitions from here to rely on internal transform */
        z-index: 5;
    }

    /* In waveform mode, jukebox is centered in the viewport */
    .viz-fade-wrapper:not(.conclusion-layout) .jukebox-container {
        flex: 0 0 auto;
        margin: 0 auto;
    }

    /* In non-conclusion mode, ensure container is centered */
    .viz-fade-wrapper:not(.conclusion-layout) {
        justify-content: center;
    }

    /* Text panel wrapper - handles layout space and transition */
    /* Text panel wrapper - absolute positioned to avoid layout reflow */
    .conclusion-text-panel-wrapper {
        position: absolute;
        right: 5%;
        top: 50%;
        width: 450px;
        transform: translateY(-50%) translateX(20px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 4;
    }

    /* When visible, fade in and slide to position */
    .conclusion-text-panel-wrapper.visible {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
        pointer-events: auto;
    }

    /* In conclusion mode, jukebox moves left by adding margin */
    /* Since container is flex centered, margin-right pushes it left */
    /* We moved this logic to internal component for smoother animation */
    /* .conclusion-layout .jukebox-container {
        flex: 0 0 auto;
        margin-right: 500px;
    } */

    @media (max-width: 1200px) {
        /* .conclusion-layout .jukebox-container {
            margin-right: 40%;
        } */
        .conclusion-text-panel-wrapper {
            width: 35%;
        }
    }

    /* Inner panel styling */
    .conclusion-text-panel {
        width: 100%;
        background: rgba(255, 255, 255, 0.95);
        padding: var(--space-8);
        border-radius: 4px;
        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            0 4px 6px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.05);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
    }

    .conclusion-text-panel p {
        font-family: "Noto Serif SC", serif;
        font-size: 1.05rem;
        line-height: 1.8;
        color: #4a4a4a;
        margin-bottom: var(--space-4);
        text-align: justify;
    }

    .conclusion-text-panel p:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 1000px) {
        .conclusion-layout {
            flex-direction: column;
            gap: var(--space-4);
        }

        /* Reset absolute positioning for mobile */
        .conclusion-text-panel-wrapper {
            position: relative;
            right: auto;
            top: auto;
            width: 100%;
            transform: none !important;
            margin-top: var(--space-4);
        }

        .conclusion-layout .jukebox-container {
            /* margin-right: 0 !important; */
        }

        .jukebox-container {
            min-width: auto;
            width: 100%;
            transform: scale(0.9);
        }

        .conclusion-text-panel {
            max-width: 100%;
            background: rgba(255, 255, 255, 0.95);
        }
    }

    /* Chapter 4 Split Layout & Transitions */
    .chapter4-split {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
    }

    .chapter4-split.visible {
        opacity: 1;
        pointer-events: auto;
    }

    .chapter4-model {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        transition: left 1s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .model-center {
        left: 50%;
    }

    .model-left {
        left: calc(10%);
    }

    .overlay-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .chapter4-right-panel {
        position: absolute;
        left: calc(65%);
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @keyframes breathe {
        0%,
        100% {
            opacity: 1;
            transform: translateY(0);
        }
        50% {
            opacity: 0.5;
            transform: translateY(6px);
        }
    }

    /* Custom fade-in animation for sticky note that preserves centering transform */
    @keyframes fadeInNote {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
        }
    }
</style>
