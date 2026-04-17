<template>
  <div style="width:100%; font-family:inherit; box-sizing:border-box; font-size:11px;">

    <!-- araignee : sliders uniquement, graphique à venir -->
    <div v-if="questionType === 'araignee'" style="width:100%; padding:4px;">
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div
          v-for="dim in araigneeDimensions"
          :key="dim.key"
          style="display:flex; align-items:center; gap:12px;"
        >
          <span style="font-size:11px; color:#333; width:200px; flex-shrink:0;">
            {{ lang === 'en' ? dim.label_en : dim.label_fr }}
          </span>
          <input
            type="range"
            min="1"
            max="7"
            step="1"
            :value="araigneeValues[dim.key]"
            @input="onAraigneeInput(dim.key, $event.target.value)"
            style="flex:1;"
          />
          <span style="font-size:11px; font-weight:500; color:#333; width:16px; text-align:right;">
            {{ araigneeValues[dim.key] }}
          </span>
        </div>
      </div>
    </div>

    <div v-else style="color:#999; font-style:italic; font-size:11px; padding:4px;">
      En cours de développement : {{ questionType }}
    </div>

  </div>
</template>

<script>
import { ref, computed, reactive, watch } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwElementState: { type: Object, required: true },
  },
  emits: ['trigger-event', 'update:content:effect'],

  setup(props, { emit }) {
    const lang = computed(() => props.content.lang || 'fr');
    const araigneeValues = reactive({});

    const displayJson = computed(() => {
      const val = props.content.displayJson;
      if (!val) return {};
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return {}; }
    });

    const reponseJson = computed(() => {
      const val = props.content.reponseJson;
      if (!val) return {};
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return {}; }
    });

    const questionType = computed(() =>
      props.content.blockCode || reponseJson.value.type || 'free_text'
    );

    const araigneeDimensions = computed(() =>
      displayJson.value?.dimensions || []
    );

    watch([questionType, araigneeDimensions], () => {
      if (questionType.value === 'araignee') {
        araigneeDimensions.value.forEach(dim => {
          if (araigneeValues[dim.key] === undefined) {
            araigneeValues[dim.key] = reponseJson.value?.[dim.key] || 4;
          }
        });
      }
    }, { immediate: true });

    function onAraigneeInput(key, rawVal) {
      araigneeValues[key] = parseInt(rawVal);
      const response = {};
      araigneeDimensions.value.forEach(dim => {
        response[dim.key] = araigneeValues[dim.key] || 4;
      });
      emit('trigger-event', { name: 'change', event: { value: response } });
    }

    return {
      lang, displayJson, reponseJson, questionType,
      araigneeDimensions, araigneeValues,
      onAraigneeInput,
    };
  },
};
</script>