<script lang="ts">
export const widget = {
  priority: 10,
  flows: ['closeout'],
  width: 1,
  name: 'Report',
  icons: [
    { name: 'sym_o_frame_inspect', color: '#3ac9df' },
    { name: 'picture_as_pdf', color: '#e6c229' },
  ],
};
</script>

<!-- src/components/PdfPreviewDialog.vue -->
<template>
  <div class="preview-root column no-wrap">
    <q-bar>
      <div class="text-weight-medium">{{ title }}</div>
      <q-space />
      <q-btn
        flat
        dense
        icon="picture_as_pdf"
        :disable="!pdfSrc"
        @click="openInTab"
        title="Open in new tab"
      />
      <q-btn flat dense icon="print" :disable="!pdfSrc" title="Print" />
      <q-btn flat dense icon="download" :disable="busy" title="Download" />
    </q-bar>

    <div class="preview-body col q-pa-none">
      <div v-if="busy" class="flex flex-center fit">
        <q-spinner size="32px" />
      </div>

      <PdfCanvas v-if="pdfSrc" :src="pdfSrc" class="pdf-frame" />

      <div v-else class="q-pa-md">
        Couldn’t render inline.
        <q-btn flat label="Open in new tab" @click="openInTab" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import compileTypstPdf from './utils/pdf';
import PdfCanvas from './components/PdfCanvas.vue';
import { typstTemplate } from 'src/types/useTypstTemplate';

const iframeKey = ref<number>(0);

//const fileName = ref<string>('report.pdf');

const title = ref<string>('Inventory Report');

const busy = ref<boolean>(false);
const pdfSrc = ref<Uint8Array | null>(null);

watch(typstTemplate, () => buildPreview());

/** Build a Blob URL for the current props */
async function buildPreview(): Promise<void> {
  busy.value = true;

  const content = typstTemplate.value;

  pdfSrc.value = await compileTypstPdf(content);

  iframeKey.value++;
  busy.value = false;
}

/* ---------- UI actions ---------- */
function openInTab(): void {
  /*if (!pdfUrl.value) return;
  window.open(pdfUrl.value, '_blank', 'noopener,noreferrer');*/
}

/*async function downloadPdf(): Promise<void> {
  // If we have a URL already, reuse it; otherwise build once.
  if (!pdfUrl.value) await buildPreview();
  const link = document.createElement('a');
  link.href = pdfUrl.value ?? '';
  link.download = fileName.value ?? 'report.pdf';
  link.click();
}

function printPdf(): void {
  // Best compatibility: open in new tab and let the browser print UI handle it.
  openInTab();
}*/

onMounted(async () => {
  await buildPreview();

  void nextTick(() => {
    const el = document.querySelector('.pdf-frame');
    console.log('pdf-frame size:', el?.clientWidth, el?.clientHeight);
  });
});
</script>

<style scoped>
.preview-body {
  width: calc(320px);
  height: calc((320px * 792 / 612));
  display: flex;
} /* allow children to grow */
.pdf-frame {
  width: calc(320px - 10px);
  height: calc(((320px) * 792 / 612));
  display: block;
  border: 0;
  flex: 1 1 auto;
  padding: 5px;
}
</style>
