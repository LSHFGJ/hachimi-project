<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import scrollama from "scrollama";

  const dispatch = createEventDispatcher();

  /** @type {number} */
  export let offset = 0.5;

  /** @type {boolean} */
  export let debug = false;

  /** @type {HTMLElement} */
  let container;

  /** @type {any} */
  let scroller;

  /** @type {number} */
  let currentStepInternal = 0;

  /** @type {number} */
  let progressInternal = 0;

  onMount(() => {
    scroller = scrollama();

    scroller
      .setup({
        step: ".step",
        offset,
        debug,
        progress: true,
      })
      .onStepEnter(({ index }) => {
        currentStepInternal = index;
        dispatch("stepchange", { step: index, progress: progressInternal });
      })
      .onStepProgress(({ index, progress: p }) => {
        progressInternal = p;
        dispatch("progress", { step: index, progress: p });
      });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      scroller.resize();
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    if (scroller) {
      scroller.destroy();
    }
  });
</script>

<div class="scrolly-wrapper" bind:this={container}>
  <slot currentStep={currentStepInternal} progress={progressInternal} />
</div>

<style>
  .scrolly-wrapper {
    position: relative;
  }
</style>
