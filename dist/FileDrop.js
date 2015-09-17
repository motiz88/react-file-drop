"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var FileDrop = (function (_React$Component) {
    _inherits(FileDrop, _React$Component);

    function FileDrop() {
        var _this = this;

        _classCallCheck(this, FileDrop);

        _get(Object.getPrototypeOf(FileDrop.prototype), "constructor", this).apply(this, arguments);

        this.displayName = "FileDrop";
        this.state = {
            draggingOverFrame: false,
            draggingOverTarget: false
        };

        this._handleDrop = function (event) {
            event.preventDefault();
            if (_this.props.onDrop) {
                var files = event.dataTransfer ? event.dataTransfer.files : event.frame ? event.frame.files : event.target.files;
                _this.props.onDrop(files, event);
            }
        };

        this._handleDragOver = function (event) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = _this.props.dropEffect;

            // set active drag state only when file is dragged into
            // (in mozilla when file is dragged effect is "uninitialized")
            var effectAllowed = event.dataTransfer.effectAllowed;
            if (effectAllowed === "all" || effectAllowed === "uninitialized") {
                _this.setState({
                    draggingOverTarget: true
                });
            }

            if (_this.props.onDragOver) _this.props.onDragOver(event);
        };

        this._handleDragLeave = function (event) {
            _this.setState({
                draggingOverTarget: false
            });
            if (_this.props.onDragLeave) _this.props.onDragLeave(event);
        };

        this._handleFrameDrag = function (event) {
            // We are listening for events on the 'frame', so every time the user drags over any element in the frame's tree,
            // the event bubbles up to the frame. By keeping count of how many "dragenters" we get, we can tell if they are still
            // "draggingOverFrame" (b/c you get one "dragenter" initially, and one "dragenter"/one "dragleave" for every bubble)
            _this._dragCount += event.type === "dragenter" ? 1 : -1;
            if (_this._dragCount === 1) {
                _this.setState({
                    draggingOverFrame: true
                });
                if (_this.props.onFrameDragEnter) _this.props.onFrameDragEnter(event);
            } else if (_this._dragCount === 0) {
                if (_this.props.onFrameDragLeave) _this.props.onFrameDragLeave(event);
                _this.setState({
                    draggingOverFrame: false
                });
            }
        };

        this._handleFrameDrop = function (event) {
            _this.resetDragging();
            if (_this.props.onFrameDrop) _this.props.onFrameDrop(event);
        };

        this._handleWindowDragOverOrDrop = function (event) {
            event.preventDefault();
        };
    }

    _createClass(FileDrop, [{
        key: "resetDragging",
        value: function resetDragging() {
            this._dragCount = 0;
            this.setState({
                draggingOverFrame: false,
                draggingOverTarget: false
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var fileDropTarget;
            var fileDropTargetStyles = [{}, (this.props.dropTargetStyles || {}).base];
            if (this.props.targetAlwaysVisible || this.state.draggingOverFrame) {
                fileDropTargetStyles.push((this.props.dropTargetStyles || {}).draggingOverFrame);
                if (this.state.draggingOverTarget) fileDropTargetStyles.push((this.props.dropTargetStyles || {}).draggingOverTarget);
                fileDropTarget = _react2["default"].createElement(
                    "div",
                    { style: _extends.apply(undefined, fileDropTargetStyles) },
                    this.props.children
                );
            }
            return _react2["default"].createElement(
                "div",
                { style: this.props.style,
                    onDrop: this._handleDrop,
                    onDragLeave: this._handleDragLeave,
                    onDragOver: this._handleDragOver
                },
                fileDropTarget,
                _react2["default"].createElement("input", { type: "file",
                    ref: function (fileInput) {
                        _this2._fileInput = fileInput;
                    },
                    style: { display: 'none' },
                    onChange: this._handleDrop
                })
            );
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.frame !== this.props.frame) {
                this.resetDragging();
                this.stopFrameListeners(this.props.frame);
                this.startFrameListeners(nextProps.frame);
            }
        }
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {
            this.startFrameListeners();
            this._dragCount = 0;
            if (typeof global.addEventListener === 'function') {
                global.addEventListener("dragover", this._handleWindowDragOverOrDrop);
                global.addEventListener("drop", this._handleWindowDragOverOrDrop);
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.stopFrameListeners();
            if (typeof global.removeEventListener === 'function') {
                global.removeEventListener("dragover", this._handleWindowDragOverOrDrop);
                global.removeEventListener("drop", this._handleWindowDragOverOrDrop);
            }
        }
    }, {
        key: "stopFrameListeners",
        value: function stopFrameListeners(frame) {
            frame = frame || this.props.frame;
            if (frame) {
                frame.removeEventListener("dragenter", this._handleFrameDrag);
                frame.removeEventListener("dragleave", this._handleFrameDrag);
                frame.removeEventListener("drop", this._handleFrameDrop);
            }
        }
    }, {
        key: "startFrameListeners",
        value: function startFrameListeners(frame) {
            frame = frame || this.props.frame;
            if (frame) {
                frame.addEventListener("dragenter", this._handleFrameDrag);
                frame.addEventListener("dragleave", this._handleFrameDrag);
                frame.addEventListener("drop", this._handleFrameDrop);
            }
        }
    }, {
        key: "open",
        value: function open() {
            if (!this._fileInput) return;
            var fileInput = _react2["default"].findDOMNode(this._fileInput);
            fileInput.value = null;
            fileInput.click();
        }
    }], [{
        key: "propTypes",
        value: {
            onDrop: _react2["default"].PropTypes.func,
            onDragOver: _react2["default"].PropTypes.func,
            onDragLeave: _react2["default"].PropTypes.func,
            dropEffect: _react2["default"].PropTypes.oneOf(["copy", "move", "link", "none"]),
            targetAlwaysVisible: _react2["default"].PropTypes.bool,
            frame: function frame(props, propName, componentName) {
                var prop = props[propName];
                if (prop !== global.document && prop !== global && !(prop instanceof HTMLElement)) {
                    return new Error("Warning: Prop `" + propName + "` must be one of the following: document, window, or an HTMLElement!");
                }
            },
            onFrameDragEnter: _react2["default"].PropTypes.func,
            onFrameDragLeave: _react2["default"].PropTypes.func,
            onFrameDrop: _react2["default"].PropTypes.func,
            style: _react2["default"].PropTypes.object,
            dropTargetStyles: _react2["default"].PropTypes.shape({
                base: _react2["default"].PropTypes.object,
                draggingOverFrame: _react2["default"].PropTypes.object,
                draggingOverTarget: _react2["default"].PropTypes.object
            })
        },
        enumerable: true
    }, {
        key: "defaultProps",
        value: {
            dropEffect: "copy",
            frame: global.document,
            targetAlwaysVisible: false
        },
        enumerable: true
    }]);

    return FileDrop;
})(_react2["default"].Component);

exports["default"] = FileDrop;
module.exports = exports["default"];