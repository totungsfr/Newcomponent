<template>
  <div style="width:100%; font-family:inherit; box-sizing:border-box; font-size:11px;">

    <!-- Question depuis display_json -->
    <div v-if="displayJson && (displayJson.question_fr || displayJson.question_en)"
         style="font-weight:bold; margin-bottom:6px; color:#333; font-size:11px;">
      {{ lang === 'fr' ? displayJson.question_fr : displayJson.question_en }}
    </div>

    <!-- Saisie libre courte -->
    <input
      v-if="questionType === 'question_text_short'"
      type="text"
      v-model="currentValue"
      @input="emitValue"
      style="width:100%; padding:6px; border:1px solid #555; border-radius:4px; color:#333; background:var(--Color-AdoptinViolet1); font-size:11px; display:block;"
    />

    <!-- Saisie libre longue -->
    <textarea
      v-else-if="questionType === 'question_text_long' || questionType === 'free_text'"
      :rows="3"
      v-model="currentValue"
      @input="emitValue"
      style="width:100%; padding:6px; border:1px solid #555; border-radius:4px; color:#333; background:var(--Color-AdoptinViolet1); font-size:11px; display:block;"
    />

    <!-- Slider -->
    <div v-else-if="questionType === 'question_scale_single' || questionType === 'slider'"
         style="display:flex; align-items:center; gap:8px;">
      <input
        type="range"
        :min="reponseJson.min || 0"
        :max="reponseJson.max || 10"
        v-model="currentValue"
        @input="emitValue"
        style="width:100%;"
      />
      <span style="color:#333; min-width:24px; font-size:11px;">{{ currentValue }}</span>
    </div>

    <!-- Choix unique -->
    <div v-else-if="questionType === 'question_single_choice' || questionType === 'single_choice'"
         style="display:flex; flex-wrap:wrap; gap:6px; padding:4px;">
      <div
        v-for="choice in reponseJson.choices"
        :key="choice.uuid"
        style="display:flex; align-items:center; gap:4px; width:calc(33% - 4px); color:#333;"
      >
        <input type="radio" :value="choice.uuid" v-model="currentValue" @change="emitValue" />
        <span style="color:#333; font-size:11px;">{{ choice.label ? (lang === 'fr' ? choice.label.fr : choice.label.en) : '' }}</span>
      </div>
    </div>

    <!-- Choix multiple -->
    <div v-else-if="questionType === 'question_multi_choice'"
         style="display:flex; flex-wrap:wrap; gap:6px; padding:4px;">
      <div
        v-for="choice in reponseJson.choices"
        :key="choice.uuid"
        style="display:flex; align-items:center; gap:4px; width:calc(33% - 4px); color:#333;"
      >
        <input
          type="checkbox"
          :value="choice.uuid"
          v-model="multiValues"
          @change="emitMultiValue"
        />
        <span style="color:#333; font-size:11px;">{{ choice.label ? (lang === 'fr' ? choice.label.fr : choice.label.en) : '' }}</span>
      </div>
    </div>

    <!-- Oui / Non -->
    <div v-else-if="questionType === 'question_yes_no'"
         style="display:flex; gap:16px; padding:4px; align-items:center;">
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px; white-space:nowrap;">
        <input type="radio" value="yes" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? (displayJson.labels && displayJson.labels.yes_fr || 'Oui') : (displayJson.labels && displayJson.labels.yes_en || 'Yes') }}
      </label>
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px; white-space:nowrap;">
        <input type="radio" value="no" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? (displayJson.labels && displayJson.labels.no_fr || 'Non') : (displayJson.labels && displayJson.labels.no_en || 'No') }}
      </label>
    </div>

    <!-- Oui / Non + commentaire sur une ligne -->
    <div v-else-if="questionType === 'question_yes_no_comment'"
         style="display:flex; gap:12px; align-items:center; padding:4px;">
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px; white-space:nowrap;">
        <input type="radio" value="yes" v-model="currentValue" @change="emitYesNoComment" />
        {{ lang === 'fr' ? (displayJson.labels && displayJson.labels.yes_fr || 'Oui') : (displayJson.labels && displayJson.labels.yes_en || 'Yes') }}
      </label>
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px; white-space:nowrap;">
        <input type="radio" value="no" v-model="currentValue" @change="emitYesNoComment" />
        {{ lang === 'fr' ? (displayJson.labels && displayJson.labels.no_fr || 'Non') : (displayJson.labels && displayJson.labels.no_en || 'No') }}
      </label>
      <input
        type="text"
        v-model="commentValue"
        @input="emitYesNoComment"
        :placeholder="lang === 'fr' ? 'Commentaire...' : 'Comment...'"
        style="flex:1; padding:4px; border:1px solid #555; border-radius:4px; color:#333; background:var(--Color-AdoptinViolet1); font-size:11px;"
      />
    </div>

    <!-- Tableau -->
    <div v-else-if="questionType === 'question_table'" style="padding:4px; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr>
            <th style="border:1px solid #ccc; padding:4px; background:#f5f5f5; color:#333;"></th>
            <th
              v-for="col in displayJson.columns"
              :key="col.key"
              style="border:1px solid #ccc; padding:4px; background:#f5f5f5; color:#333; font-weight:bold;"
            >
              {{ lang === 'fr' ? col.label_fr : col.label_en }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in displayJson.rows" :key="row.key">
            <td style="border:1px solid #ccc; padding:4px; color:#333; font-weight:bold; background:#f5f5f5;">
              {{ lang === 'fr' ? row.label_fr : row.label_en }}
            </td>
            <td
              v-for="col in displayJson.columns"
              :key="col.key"
              style="border:1px solid #ccc; padding:2px;"
            >
              <input
                type="text"
                :value="tableCells[row.key + '_' + col.key] || ''"
                @input="updateCell(row.key, col.key, $event.target.value)"
                style="width:100%; border:none; padding:4px; font-size:11px; color:#333; background:var(--Color-AdoptinViolet1);"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Araignee -->
    <div v-else-if="questionType === 'araignee'" style="width:100%; padding:4px;">
      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
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
            :value="araigneeValues[dim.key] || 4"
            @input="onAraigneeInput(dim.key, $event.target.value)"
            style="flex:1;"
          />
          <span style="font-size:11px; font-weight:500; color:#333; width:16px; text-align:right;">
            {{ araigneeValues[dim.key] || 4 }}
          </span>
        </div>
      </div>
      <div style="position:relative; width:100%; max-width:400px; margin:0 auto;">
        <canvas :id="'araignee-' + uid"></canvas>
      </div>
    </div>

    <!-- En cours de développement -->
    <div v-else style="color:#999; font-style:italic; font-size:11px; padding:4px;">
      En cours de développement : {{ questionType }}
    </div>

  </div>
</template>

<script>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwElementState: { type: Object, required: true },
  },
  emits: ['trigger-event', 'update:content:effect'],

  setup(props, { emit }) {
    const currentValue = ref(null);
    const multiValues = ref([]);
    const commentValue = ref('');
    const tableCells = reactive({});
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

    // Araignee — dimensions depuis display_json
    const araigneeDimensions = computed(() => {
      if (questionType.value !== 'araignee') return [];
      return displayJson.value?.dimensions || [];
    });

    function initAraigneeValues() {
      araigneeDimensions.value.forEach(dim => {
        araigneeValues[dim.key] = reponseJson.value?.[dim.key] || 4;
      });
    }

    function emitAraigneeValue() {
      const response = {};
      araigneeDimensions.value.forEach(dim => {
        response[dim.key] = araigneeValues[dim.key] || 4;
      });
      emit('trigger-event', {
        name: 'change',
        event: { value: response },
      });
    }

    function onAraigneeInput(key, rawVal) {
      araigneeValues[key] = parseInt(rawVal);
      emitAraigneeValue();
      updateChart();
    }

    function initChart() {
      nextTick(() => {
        const canvas = document.getElementById('araignee-' + props.uid);
        if (!canvas) return;
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
        const tickColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
        const fillColor = isDark ? 'rgba(83,74,183,0.35)' : 'rgba(83,74,183,0.20)';
        chartInstance = new Chart(canvas, {
          type: 'radar',
          data: {
            labels: araigneeDimensions.value.map(d => lang.value === 'en' ? d.label_en : d.label_fr),
            datasets: [{
              data: araigneeDimensions.value.map(d => araigneeValues[d.key] || 4),
              backgroundColor: fillColor,
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
                  color: tickColor,
                  backdropColor: 'transparent',
                  font: { size: 11 },
                  callback: v => String(v),
                },
                grid: { color: gridColor },
                angleLines: { color: gridColor },
                pointLabels: {
                  font: { size: 11 },
                  color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)',
                }
              }
            }
          }
        });
      });
    }

    function updateChart() {
      if (!chartInstance) return;
      chartInstance.data.datasets[0].data =
        araigneeDimensions.value.map(d => araigneeValues[d.key] || 4);
      chartInstance.update();
    }

    // Fonctions existantes
    function emitValue() {
      emit('trigger-event', { name: 'change', event: { value: currentValue.value } });
    }

    function emitMultiValue() {
      emit('trigger-event', { name: 'change', event: { value: multiValues.value } });
    }

    function emitYesNoComment() {
      emit('trigger-event', { name: 'change', event: { value: currentValue.value, comment: commentValue.value } });
    }

    function updateCell(rowKey, colKey, value) {
      tableCells[rowKey + '_' + colKey] = value;
      emit('trigger-event', { name: 'change', event: { value: { ...tableCells } } });
    }

    onMounted(() => {
      if (questionType.value === 'araignee') {
        initAraigneeValues();
        initChart();
      }
    });

    watch(questionType, (val) => {
      if (val === 'araignee') {
        initAraigneeValues();
        initChart();
      }
    });

    onBeforeUnmount(() => {
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    });

    return {
      currentValue, multiValues, commentValue, tableCells,
      lang, displayJson, reponseJson, questionType,
      araigneeDimensions, araigneeValues,
      emitValue, emitMultiValue, emitYesNoComment, updateCell,
      onAraigneeInput,
    };
  },
};
</script>