export default {
    editor: {
        label: { en: 'Adoptin Dynamic Input', fr: 'Saisie Dynamique Adoptin' },
        icon: 'text-input',
    },
    triggerEvents: [
        { name: 'change', label: { en: 'On change' }, event: { value: '' }, default: true },
    ],
    properties: {
        blockCode: {
            label: { en: 'Block code', fr: 'Code bloc' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
        },
        displayJson: {
            label: { en: 'Display JSON', fr: 'JSON Affichage' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '{}',
        },
        reponseJson: {
            label: { en: 'Response JSON', fr: 'JSON Réponse' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '{}',
        },
        lang: {
            label: { en: 'Language', fr: 'Langue' },
            type: 'TextSelect',
            section: 'settings',
            bindable: true,
            defaultValue: 'fr',
            options: {
                options: [
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                ],
            },
        },
    },
};