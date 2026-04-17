<template>
  <div style="width:100%; font-family:inherit; box-sizing:border-box; font-size:11px;">

    <div v-if="questionType === 'araignee'" style="width:100%; padding:4px;">
      <div style="display:flex; flex-direction:column; gap:3px; margin-bottom:12px;">
        <div
          v-for="dim in araigneeDimensions"
          :key="dim.key"
          style="display:flex; align-items:center; gap:8px;"
        >
          <span style="font-size:10px; color:#555; width:160px; flex-shrink:0;">
            {{ lang === 'en' ? dim.label_en : dim.label_fr }}
          </span>
          <input
            type="range"
            min="1"
            max="7"
            step="1"
            :value="araigneeValues[dim.key]"
            @input="onAraigneeInput(dim.key, $event.target.value)"
            style="flex:1; height:3px;"
          />
          <span style="font-size:10px; font-weight:500; color:#555; width:12px; text-align:right;">
            {{ araigneeValues[dim.key] }}
          </span>
        </div>
      </div>
      <div style="position:relative; width:100%; max-width:600px; margin:0 auto;">
        <canvas :id="'araignee-' + uid"></canvas>
      </div>
    </div>

    <div v-else style="color:#999; font-style:italic; font-size:11px; padding:4px;">
      En cours de développement : {{ questionType }}
    </div>

  </div>
</template>

<script>
import { ref, computed, reactive, watch, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwElementState: { type: Object, required: true },
  },
  emits: ['trigger-event', 'update:content:effect'],

  setup(props, { emit }) {
    const araigneeValues = reactive({});
    let chartInstance = null;

    const lang = computed(() => props.content.lang || 'fr');

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

    async function initChart() {
      await nextTick();
      const canvas = document.getElementById('araignee-' + props.uid);
      if (!canvas) return;
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
      chartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: araigneeDimensions.value.map(d => lang.value === 'en' ? d.label_en : d.label_fr),
          datasets: [{
            data: araigneeDimensions.value.map(d => araigneeValues[d.key] || 4),
            backgroundColor: 'rgba(83,74,183,0.20)',
            borderColor: '#534AB7',
            borderWidth: 2,
            pointBackgroundColor: '#534AB7',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              min: 0, max: 7,
              ticks: {
                stepSize: 1,
                color: '#555',
                backdropColor: 'transparent',
                font: { size: 10 },
                callback: v => String(v),
              },
              grid: { color: 'rgba(0,0,0,0.10)' },
              angleLines: { color: 'rgba(0,0,0,0.10)' },
              pointLabels: {
                font: { size: 11 },
                color: '#333',
              }
            }
          }
        }
      });
    }

    function updateChart() {
      if (!chartInstance) return;
      chartInstance.data.datasets[0].data =
        araigneeDimensions.value.map(d => araigneeValues[d.key] || 4);
      chartInstance.update();
    }

    watch([questionType, araigneeDimensions], () => {
      if (questionType.value === 'araignee') {
        araigneeDimensions.value.forEach(dim => {
          if (araigneeValues[dim.key] === undefined) {
            araigneeValues[dim.key] = reponseJson.value?.[dim.key] || 4;
          }
        });
        initChart();
      }
    }, { immediate: true });

    function onAraigneeInput(key, rawVal) {
      araigneeValues[key] = parseInt(rawVal);
      const response = {};
      araigneeDimensions.value.forEach(dim => {
        response[dim.key] = araigneeValues[dim.key] || 4;
      });
      emit('trigger-event', { name: 'change', event: { value: response } });
      updateChart();
    }

    onBeforeUnmount(() => {
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    });

    return {
      lang, displayJson, reponseJson, questionType,
      araigneeDimensions, araigneeValues,
      onAraigneeInput,
    };
  },
};
</script>
