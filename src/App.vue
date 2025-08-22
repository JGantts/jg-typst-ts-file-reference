<template>
  <div>
    <div>
      <PdfCanvas v-if="pdfSrcA" :src="pdfSrcA" class="pdf-frame" />

      <div v-else class="q-pa-md">
        {{ pdfErrA }}
      </div>
    </div>

    <div>
      <PdfCanvas v-if="pdfSrcB" :src="pdfSrcB" class="pdf-frame" />

      <div v-else class="q-pa-md">
        {{ pdfErrB }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import compileTypstPdf from './utils/pdf';
import PdfCanvas from './components/PdfCanvas.vue';
import { typstTemplateA } from 'src/types/useTypstTemplateA';
import { typstTemplateB } from 'src/types/useTypstTemplateB';

const pdfSrcA = ref<Uint8Array | null>(null);
const pdfErrA = ref<string | null>(null);

const pdfSrcB = ref<Uint8Array | null>(null);
const pdfErrB = ref<string | null>(null);

watch(typstTemplateA, () => buildPreview());
watch(typstTemplateB, () => buildPreview());

/** Build a Blob URL for the current props */
async function buildPreview(): Promise<void> {
  const contentA = typstTemplateA.value;
  const contentB = typstTemplateB.value;

  try{ 
  pdfSrcA.value = await compileTypstPdf(contentA);
  }catch(e){
    pdfErrA.value = JSON.stringify(e) ?? "Unknown error";
    throw e;
  }
  try{
  pdfSrcB.value = await compileTypstPdf(contentB);
  }catch(e){
    console.log(e)
    pdfErrB.value = JSON.stringify(e) ?? "Unknown error";
    throw e;
  }
}


onMounted(async () => {
  await buildPreview();
});
</script>

<style scoped>
.preview-body {
  width: calc(2*320px);
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
