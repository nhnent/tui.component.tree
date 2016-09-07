'use strict';
var Tree = require('../src/js/tree');
var util = require('../src/js/util');

describe('Tree', function() {
    var tree, treeEditable, rootNodeId;
    var firstChildId, lastChildId;
    var firstChildElement, lastChildElement;
    var data = [
        {title: 'A', state: 'closed', children: [
            {title: '1'},
            {title: '2'},
            {title: '3'}
        ]},
        {title: 'B'}
    ];

    beforeEach(function() {
        loadFixtures('basicFixture.html');

        tree = new Tree(data, {
            rootElement: 'treeRoot',
            template: {
                internalNode:
                    '<button type="button" class="{{toggleBtnClass}}">{{stateLabel}}</button>' +
                    '<span class="{{textClass}}">{{title}}</span>' +
                    '<ul>{{children}}</ul>',
                leafNode:
                    '<span class="{{textClass}}">{{title}}</span>'
            }
        });

        rootNodeId = tree.getRootNodeId();
        firstChildId = tree.getChildIds(rootNodeId)[0];
        lastChildId = tree.getChildIds(rootNodeId)[1];

        firstChildElement = document.getElementById(firstChildId);
        lastChildElement = document.getElementById(lastChildId);

        tree.enableFeature('Editable', {
            editableClassName: tree.classNames.textClass,
            dataKey: 'text'
        });

        treeEditable = tree.enabledFeatures.Editable;
    });

    describe('createChildNode()', function() {
        it('should show children nodes when parent node is not leaf node.', function() {
            var stateLabel;
            var toggleBtnClass = tree.classNames.toggleBtnClass;
            var expected = tree.stateLabels.closed;

            tree.createChildNode(firstChildId);

            stateLabel = util.getElementsByClassName(firstChildElement, toggleBtnClass)[0];

            expect(stateLabel.innerHTML).toBe(expected);
        });

        it('should add toggle button when parent node is leaf node.', function() {
            var stateLabels;
            var toggleBtnClass = tree.classNames.toggleBtnClass;
            var expected = tree.stateLabels.closed;

            tree.createChildNode(lastChildId);

            stateLabels = util.getElementsByClassName(lastChildElement, toggleBtnClass);

            expect(stateLabels.length).toBe(1);
            expect(stateLabels[0].innerHTML).toBe(expected);
        });

        it('should fire "successResponse" when Ajax feature is enabled.', function() {
            jasmine.Ajax.install();

            spyOn(treeEditable, '_onSuccessResponse');

            tree.enableFeature('Ajax', {
                command: {
                    read: {
                        url: 'api/test'
                    }
                }
            });
            tree.createChildNode(lastChildId);
            tree.fire('successAjaxResponse');

            expect(treeEditable._onSuccessResponse).toHaveBeenCalled();

            jasmine.Ajax.uninstall();
        });
    });

    describe('editNode()', function() {
        it('should create input element in selected node.', function() {
            var inputElements = firstChildElement.getElementsByTagName('input');

            tree.editNode(firstChildId);
            expect(inputElements.length).toBe(1);
        });

        it('should hide text label of selected node.', function() {
            var textClass = tree.classNames.textClass;
            var textLabel = util.getElementsByClassName(firstChildElement, textClass)[0];

            tree.editNode(firstChildId);

            expect(textLabel.style.display).toBe('none');
        });
    });
});
