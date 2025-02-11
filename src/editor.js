import { html, LitElement } from "lit";
import styles from './editor.styles';

export class WeekPlannerCardEditor extends LitElement {
    static styles = styles;

    connectedCallback() {
        super.connectedCallback();
        console.log('WeekPlannerCardEditor: Connected');
        this.loadCustomElements();
    }

    async loadCustomElements() {
        console.log('WeekPlannerCardEditor: Loading custom elements...');
        if (!customElements.get("ha-entity-picker")) {
            console.log('WeekPlannerCardEditor: Loading entity picker...');
            await customElements.get("hui-entities-card").getConfigElement();
            console.log('WeekPlannerCardEditor: Entity picker loaded');
        }
    }

    static get properties() {
        return {
            hass: {},
            _config: {},
        };
    }

    setConfig(config) {
        console.log('WeekPlannerCardEditor: Setting config:', config);
        this._config = config;
    }

    _valueChanged(event) {
        const target = event.target;
        let value = target.value;

        if (target.tagName === 'HA-SWITCH') {
            value = target.checked;
        }

        console.log('WeekPlannerCardEditor: Value changed:', {
            field: target.attributes.name.value,
            value: value
        });

        this.setConfigValue(target.attributes.name.value, value);
    }

    getConfigValue(key, defaultValue) {
        if (!this._config) {
            console.log('WeekPlannerCardEditor: No config available');
            return '';
        }

        defaultValue = defaultValue ?? '';
        const value = key.split('.').reduce((o, i) => o[i] ?? defaultValue, this._config) ?? defaultValue;
        console.log('WeekPlannerCardEditor: Getting config value:', { key, value, defaultValue });
        return value;
    }

    setConfigValue(key, value) {
        console.log('WeekPlannerCardEditor: Setting config value:', { key, value });
        const config = JSON.parse(JSON.stringify(this._config));
        const keyParts = key.split('.');
        const lastKeyPart = keyParts.pop();
        const lastObject = keyParts.reduce((objectPart, keyPart) => {
            if (!objectPart[keyPart]) {
                objectPart[keyPart] = {};
            }
            return objectPart[keyPart];
        }, config);
        if (value === '') {
            delete lastObject[lastKeyPart];
        } else {
            lastObject[lastKeyPart] = value;
        }
        this._config = config;

        this.dispatchConfigChangedEvent();
    }

    dispatchConfigChangedEvent() {
        console.log('WeekPlannerCardEditor: Dispatching config changed event:', this._config);
        const configChangedEvent = new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(configChangedEvent);
    }
}
