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
      :rows="reponseJson.lines || 3"
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
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px;">
        <input type="radio" value="yes" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Oui' : 'Yes' }}
      </label>
      <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px;">
        <input type="radio" value="no" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Non' : 'No' }}
      </label>
    </div>

    <!-- Oui / Non + commentaire -->
    <div v-else-if="questionType === 'question_yes_no_comment'" style="padding:4px;">
      <div style="display:flex; gap:16px; align-items:center; margin-bottom:6px;">
        <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px;">
          <input type="radio" value="yes" v-model="currentValue" @change="emitYesNoComment" />
          {{ lang === 'fr' ? 'Oui' : 'Yes' }}
        </label>
        <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:#333; font-size:11px;">
          <input type="radio" value="no" v-model="currentValue" @change="emitYesNoComment" />
          {{ lang === 'fr' ? 'Non' : 'No' }}
        </label>
      </div>
      <input
        type="text"
        v-model="commentValue"
        @input="emitYesNoComment"
        :placeholder="lang === 'fr' ? 'Commentaire...' : 'Comment...'"
        style="width:100%; padding:6px; border:1px solid #555; border-radius:4px; color:#333; background:var(--Color-AdoptinViolet1); font-size:11px;"
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

    <!-- Fallback -->
    <div v-else style="color:#999; font-style:italic; font-size:11px; padding:4px;">
      Type non reconnu : {{ questionType }}
    </div>

  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue';

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

    const questionType = computed(() => reponseJson.value.type || 'free_text');

    function emitValue() {
      emit('trigger-event', {
        name: 'change',
        event: { value: currentValue.value },
      });
    }

    function emitMultiValue() {
      emit('trigger-event', {
        name: 'change',
        event: { value: multiValues.value },
      });
    }

    function emitYesNoComment() {
      emit('trigger-event', {
        name: 'change',
        event: { value: currentValue.value, comment: commentValue.value },
      });
    }

    function updateCell(rowKey, colKey, value) {
      tableCells[rowKey + '_' + colKey] = value;
      emit('trigger-event', {
        name: 'change',
        event: { value: { ...tableCells } },
      });
    }

    return {
      currentValue,
      multiValues,
      commentValue,
      tableCells,
      lang,
      displayJson,
      reponseJson,
      questionType,
      emitValue,
      emitMultiValue,
      emitYesNoComment,
      updateCell,
    };
  },
};
</script>