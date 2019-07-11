import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';
import NodeBehavior from '../behaviors/NodeBehavior';
import ExpandBehavior from '../behaviors/ExpandBehavior';

const iconNames = {
    collapse: 'chevron-right',
    expand: 'chevron-down'
};

export default Marionette.CollectionView.extend({
    initialize(options: { model: any, unNamedType?: string, stopNestingType?: string }) {
        this.collection = options.model.get(options.model.childrenAttribute);
        if (this.model.collapsed == null) {
            this.model.collapsed = true;
        }
    },

    templateContext() {
        return {
            text: this.__getNodeName(),
            eyeIconClass: this.__getIconClass(),
            expandIconClass: iconNames.expand
        };
    },

    childView(childModel) {
        return NodeViewFactory.getNodeView({
            model: childModel,
            unNamedType: this.options.unNamedType,
            stopNestingType: this.options.stopNestingType,
            forceBranchType: this.options.forceBranchType
        });
    },

    childViewOptions() {
        const { parent, model, ...res } = this.options;
        return res;
    },

    childViewContainer: '.js-branch-collection',

    behaviors: {
        NodeBehavior: {
            behaviorClass: NodeBehavior
        },
        ExpandBehavior: {
            behaviorClass: ExpandBehavior
        }
    },

    ...NodeViewConfig(template, 'js-branch-item branch-item')
});
