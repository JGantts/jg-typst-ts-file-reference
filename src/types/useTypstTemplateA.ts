/// <reference types="vite/client" />
import { shallowRef } from 'vue';
import tpl from 'src/templates/category-totalsA.typ?raw';

export const typstTemplateA = shallowRef<string>(tpl);

// HMR: reload when the .typ changes
if (import.meta.hot) {
  type RawModule = { default: string };
  const isRawModule = (m: unknown): m is RawModule =>
    typeof m === 'object' &&
    m !== null &&
    'default' in m &&
    typeof (m as { default: unknown }).default === 'string';

  import.meta.hot.accept(['src/templates/category-totalsA.typ?raw'], (mods) => {
    const mod = mods[0];
    if (isRawModule(mod)) {
      typstTemplateA.value = mod.default;
    }
  });
}
