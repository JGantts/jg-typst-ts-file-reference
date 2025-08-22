<!-- PdfCanvas.vue -->
<template>
  <div ref="host" class="pdf-stack" :class="{ ready }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getDocument } from 'pdfjs-dist';

const props = defineProps<{ src: string | Uint8Array }>();
const host = ref<HTMLDivElement | null>(null);
const ready = ref(false);

async function render() {
  if (!host.value || !props.src) return;

  ready.value = false;
  // lock current height so outer layout stays stable during render
  const prevH = host.value.offsetHeight;
  if (prevH) host.value.style.minHeight = `${prevH}px`;

  const task =
    typeof props.src === 'string'
      ? getDocument({ url: props.src })
      : getDocument({ data: props.src });

  const pdf = await task.promise;

  const frag = document.createDocumentFragment();
  for (let p = 1; p <= 1; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    frag.appendChild(canvas);
  }

  // single mutation instead of N appends
  host.value.replaceChildren(frag);

  // release minHeight next frame -> exactly one resize event
  requestAnimationFrame(() => {
    if (host.value) host.value.style.minHeight = '';
    ready.value = true;
  });
}

onMounted(render);
watch(() => props.src, render);
</script>

<style scoped>
.pdf-stack {
  visibility: hidden;
}
.pdf-stack.ready {
  visibility: visible;
}
</style>
