// @flow
import CodemirrorView from './impl/codeEditor/views/CodemirrorView';
import template from './impl/codeEditor/templates/codeEditor.html';
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';

const showModes = {
    normal: 'normal',
    button: 'button'
};

const classes = {
    buttonMode: 'dev-code-editor-button-mode'
};

const defaultOptions = {
    mode: 'expression',
    height: 300,
    showMode: showModes.normal,
    ontologyService: null,
    lineSeparator: undefined,
    config: null
};

/**
 * @name NumberEditorView
 * @memberof module:Core.form.editors
 * @class Редактор выражений и скриптов. Поддерживаемый тип данных: <code>Sting</code>.
 * @extends module:Core.form.editors.base.BaseEditorView
 * @param {String} [options.mode='expression'] Определяет тип редактора:<ul>
 *     <li><code>'expression'</code> - редактор выражений.</li>
 *     <li><code>'script'</code> - редактор C#-скриптов.</li></ul>
 * @param {Number} [options.height=150] Высота редактора в пикселях.
 * */

export default (formRepository.editors.Code = BaseEditorView.extend({
    className: 'dev-code-editor-field editor',

    regions: {
        editorContainer: '.js-code-codemirror-container'
    },

    focusElement: 'textarea',

    ui: {
        editor: '.js-code-codemirror-container',
        editBtn: '.js-code-button-edit',
        clearBtn: '.js-code-button-clear'
    },

    events: {
        'click @ui.editBtn': '__onEdit',
        'click @ui.clearBtn': '__onClear',
        keydown: '__handleKeydown'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);
    },

    onRender() {
        if (this.options.showMode === showModes.button) {
            this.ui.editor.hide();
            this.el.classList.add(classes.buttonMode);
            this.__setEditBtnText();
        } else {
            this.showEditor();
            this.ui.editBtn.hide();
            this.ui.clearBtn.hide();
        }
    },

    showEditor() {
        if (this.editor) {
            return;
        }
        this.editor = new CodemirrorView(this.options);

        this.editor.on('change', this.__change, this);
        this.editor.on('minimize', () => this.__onMinimize());
        this.showChildView('editorContainer', this.editor);
        this.editor.setValue(this.value || '');
        if (this.readonly) {
            this.__setReadonly(this.readonly);
        }
    },

    focus() {
        if (this.options.showMode === showModes.button) {
            this.showEditor();
            this.ui.editor.show();
            this.editor.maximize();
        } else {
            this.editor.codemirror.focus();
        }
        this.hasFocus = true;
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }

        this.value = value;

        this.__setEditBtnText();

        if (updateUi) {
            this.editor.setValue(value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    __change() {
        const value = this.editor.getValue() || null;
        this.__value(value, false, true);
    },

    __onEdit(e) {
        if (!this.editor) {
            this.showEditor();
        }
        this.ui.editor.show();
        this.editor.maximize();
        e.stopPropagation();
    },

    __onMinimize() {
        if (this.options.showMode === showModes.button) {
            this.ui.editor.hide();
        }
    },

    __onClear() {
        this.__value(null, true, true);
    },

    __handleKeydown(e) {
        e.stopPropagation();
    },

    __setEditBtnText() {
        if (this.value) {
            if (this.getReadonly()) {
                this.ui.editBtn.text(LocalizationService.get('CORE.FORM.EDITORS.CODE.SHOW'));
            } else {
                this.ui.editBtn.text(LocalizationService.get('CORE.FORM.EDITORS.CODE.EDIT'));
            }
        } else {
            this.ui.editBtn.text(LocalizationService.get('CORE.FORM.EDITORS.CODE.EMPTY'));
        }
    },

    __setReadonly(readonly) {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
        this.editor?.setReadonly(readonly);
        if (this.options.showMode === showModes.button) {
            this.__setEditBtnText();
        }
    }
}));
