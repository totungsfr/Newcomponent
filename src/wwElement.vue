<template>
  <div class="adoptin-dynamic-input">
    <!-- Saisie libre -->
    <textarea
      v-if="questionType === 'free_text'"
      :placeholder="getLabel(displayJson, 'hint')"
      :rows="reponseJson.lines || 3"
      v-model="currentValue"
      @input="emitValue"
    />

    <!-- Slider -->
    <div v-else-if="questionType === 'slider'" class="slider-wrapper">
      <input
        type="range"
        :min="reponseJson.min || 0"
        :max="reponseJson.max || 10"
        v-model="currentValue"
        @input="emitValue"
      />
      <span>{{ currentValue }}</span>
    </div>

    <!-- Choix unique -->
    <div v-else-if="questionType === 'single_choice'" class="choices-wrapper">
      <label
        v-for="choice in reponseJson.choices"
        :key="choice.uuid"
        class="choice-item"
      >
        <input
          type="radio"
          :value="choice.uuid"
          v-model="currentValue"
          @change="emitValue"
        />
        {{ getLabel(choice.label, 'label') }}
      </label>
    </div>

    <!-- Vrai / Faux -->
    <div v-else-if="questionType === 'true_false'" class="choices-wrapper">
      <label class="choice-item">
        <input type="radio" value="true" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Vrai' : 'True' }}
      </label>
      <label class="choice-item">
        <input type="radio" value="false" v-model="currentValue" @change="emitValue" />
        {{ lang === 'fr' ? 'Faux' : 'False' }}
      </label>
    </div>

    <!-- Fallback -->
    <div v-else class="fallback">
      Type de question non reconnu : {{ questionType }}
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

    // Langue courante FR par défaut
    const lang = computed(() => props.content.lang || 'fr');

    // JSON d'affichage passé en prop
    const displayJson = computed(() => {
      try {
        return typeof props.content.displayJson === 'string'
          ? JSON.parse(props.content.displayJson)
          : props.content.displayJson || {};
      } catch {
        return {};
      }
    });

    // JSON de réponse passé en prop
    const reponseJson = computed(() => {
      try {
        return typeof props.content.reponseJson === 'string'
          ? JSON.parse(props.content.reponseJson)
          : props.content.reponseJson || {};
      } catch {
        return {};
      }
    });

    // Type de question extrait du reponseJson
    const questionType = computed(() => reponseJson.value.type || 'free_text');

    // Récupère le label dans la bonne langue
    function getLabel(obj, field) {
      if (!obj) return '';
      const target = field ? obj[field] : obj;
      if (!target) return '';
      return target[lang.value] || target['fr'] || target['en'] || '';
    }

    // Émet la valeur vers WeWeb
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
      getLabel,
      emitValue,
    };
  },
};
</script>

<style scoped>
.adoptin-dynamic-input {
  width: 100%;
  font-family: inherit;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  resize: vertical;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.choices-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.fallback {
  color: #999;
  font-style: italic;
}
</style>
