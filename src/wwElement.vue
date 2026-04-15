<template>
  <div style="width:100%; font-family:inherit; box-sizing:border-box;">

    <!-- Saisie libre -->
    <textarea
      v-if="questionType === 'free_text'"
      :rows="reponseJson.lines || 3"
      v-model="currentValue"
      @input="emitValue"
      style="width:100%; padding:8px; border:2px solid #555; border-radius:4px; color:#333; background:#fff; font-size:14px; display:block;"
    />

    <!-- Slider -->
    <div v-else-if="questionType === 'slider'" style="display:flex; align-items:center; gap:12px;">
      <input
        type="range"
        :min="reponseJson.min || 0"
        :max="reponseJson.max || 10"
        v-model="currentValue"
        @input="emitValue"
        style="width:100%;"
      />
      <span style="color:#333; min-width:30px;">{{ currentValue }}</span>
    </div>

    <!-- Choix unique -->
    <div v-else-if="questionType === 'single_choice'" style="padding:8px;">
      <div
        v-for="choice in reponseJson.choices"
        :key="choice.uuid"
        style="padding:4px; color:#333; display:flex; align-items:center; gap:8px;"
      >
        <input
          type="radio"
          :value="choice.uuid"
          v-model="currentValue"
          @change="emitValue"
        />
        <span style="color:#333;">{{ choice.label ? choice.label.fr : '' }}</span>
      </div>
    </div>

    <!-- Vrai / Faux -->
    <div v-else-if="questionType === 'true_false'" style="display:flex; gap:16px; padding:8px;">
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-size:14px;">
        <input type="radio" value="true" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Vrai' : 'True' }}
      </label>
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-size:14px;">
        <input type="radio" value="false" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Faux' : 'False' }}
      </label>
    </div>

    <!-- Fallback -->
    <div v-else style="color:#999; font-style:italic; font-size:14px; padding:8px;">
      Type non reconnu : {{ questionType }}
    </div>

  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwElementState: { type: Object, required: true },
  },
  emits: ['trigger-event', 'update:content:effect'],

  setup(props, { emit }) {
    const currentValue = ref(null);

    const lang = computed(() => props.content.lang || 'fr');

    const displayJson = computed(() => {
      try {
        return typeof props.content.displayJson === 'string'
          ? JSON.parse(props.content.displayJson)
          : props.content.displayJson || {};
      } catch {
        return {};
      }
    });

    const reponseJson = computed(() => {
      try {
        return typeof props.content.reponseJson === 'string'
          ? JSON.parse(props.content.reponseJson)
          : props.content.reponseJson || {};
      } catch {
        return {};
      }
    });

    const questionType = computed(() => reponseJson.value.type || 'free_text');

    function emitValue() {
      emit('trigger-event', {
        name: 'change',
        event: { value: currentValue.value },
      });
    }

    return {
      currentValue,
      lang,
      displayJson,
      reponseJson,
      questionType,
      emitValue,
    };
  },
};
</script>