import React from 'react';

export default class FileDrop extends React.Component {
    displayName = "FileDrop"

    static propTypes = {
        onDrop: React.PropTypes.func,
        onDragOver: React.PropTypes.func,
        onDragLeave: React.PropTypes.func,
        dropEffect: React.PropTypes.oneOf(["copy", "move", "link", "none"]),
        targetAlwaysVisible: React.PropTypes.bool,
        frame: function(props, propName, componentName) {
            var prop = props[propName];
            if (prop !== global.document && prop !== global && !(prop instanceof HTMLElement)) {
                return new Error("Warning: Prop `" + propName + "` must be one of the following: document, window, or an HTMLElement!");
            }
        },
        onFrameDragEnter: React.PropTypes.func,
        onFrameDragLeave: React.PropTypes.func,
        onFrameDrop: React.PropTypes.func,
        style: React.PropTypes.object,
        dropTargetStyles: React.PropTypes.shape({
            base: React.PropTypes.object,
            draggingOverFrame: React.PropTypes.object,
            draggingOverTarget: React.PropTypes.object
        })
    }

    static defaultProps = {
        dropEffect: "copy",
        frame: global.document,
        targetAlwaysVisible: false
    }

    state = {
        draggingOverFrame: false,
        draggingOverTarget: false
    }

    resetDragging() {
        this._dragCount = 0;
        this.setState({
            draggingOverFrame: false,
            draggingOverTarget: false
        });
    }

    _handleDrop = (event) => {
        event.preventDefault();
        if (this.props.onDrop) {
            var files = (event.dataTransfer) ? event.dataTransfer.files : (event.frame) ? event.frame.files : event.target.files;
            this.props.onDrop(files, event);
        }
    }

    _handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = this.props.dropEffect;

        // set active drag state only when file is dragged into
        // (in mozilla when file is dragged effect is "uninitialized")
        var effectAllowed = event.dataTransfer.effectAllowed;
        if (effectAllowed === "all" || effectAllowed === "uninitialized") {
            this.setState({
                draggingOverTarget: true
            });
        }

        if (this.props.onDragOver) this.props.onDragOver(event);
    }

    _handleDragLeave = (event) => {
        this.setState({
            draggingOverTarget: false
        });
        if (this.props.onDragLeave) this.props.onDragLeave(event);
    }

    _handleFrameDrag = (event) => {
        // We are listening for events on the 'frame', so every time the user drags over any element in the frame's tree,
        // the event bubbles up to the frame. By keeping count of how many "dragenters" we get, we can tell if they are still
        // "draggingOverFrame" (b/c you get one "dragenter" initially, and one "dragenter"/one "dragleave" for every bubble)
        this._dragCount += (event.type === "dragenter" ? 1 : -1);
        if (this._dragCount === 1) {
            this.setState({
                draggingOverFrame: true
            });
            if (this.props.onFrameDragEnter) this.props.onFrameDragEnter(event);
        } else if (this._dragCount === 0) {
            if (this.props.onFrameDragLeave) this.props.onFrameDragLeave(event);
            this.setState({
                draggingOverFrame: false
            });
        }
    }

    _handleFrameDrop = (event) => {
        this.resetDragging();
        if (this.props.onFrameDrop) this.props.onFrameDrop(event);
    }

    render() {
        var fileDropTarget;
        var fileDropTargetStyles = [{}, (this.props.dropTargetStyles || {}).base];
        if (this.props.targetAlwaysVisible || this.state.draggingOverFrame) {
            fileDropTargetStyles.push((this.props.dropTargetStyles || {}).draggingOverFrame);
            if (this.state.draggingOverTarget) fileDropTargetStyles.push((this.props.dropTargetStyles || {}).draggingOverTarget);
            fileDropTarget = <div style={Object.assign(...fileDropTargetStyles)}>{this.props.children}</div>;
        }
        return (
            <div style={this.props.style}
                onDrop={this._handleDrop}
                onDragLeave={this._handleDragLeave}
                onDragOver={this._handleDragOver}
            >
                {fileDropTarget}
                <input type='file'
                    ref={fileInput => {this._fileInput = fileInput;}}
                    style= {{display: 'none'}}
                    onChange={this._handleDrop}
                />
            </div>
        );
    }

    _handleWindowDragOverOrDrop = (event) => {
        event.preventDefault();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.frame !== this.props.frame) {
            this.resetDragging();
            this.stopFrameListeners(this.props.frame);
            this.startFrameListeners(nextProps.frame);
        }
    }


    componentWillMount() {
        this.startFrameListeners();
        this._dragCount = 0;
        if (typeof global.addEventListener === 'function') {
            global.addEventListener("dragover", this._handleWindowDragOverOrDrop);
            global.addEventListener("drop", this._handleWindowDragOverOrDrop);
        }
    }

    componentWillUnmount() {
        this.stopFrameListeners();
        if (typeof global.removeEventListener === 'function') {
            global.removeEventListener("dragover", this._handleWindowDragOverOrDrop);
            global.removeEventListener("drop", this._handleWindowDragOverOrDrop);
        }
    }

    stopFrameListeners(frame) {
        frame = frame || this.props.frame;
        if (frame) {
            frame.removeEventListener("dragenter", this._handleFrameDrag);
            frame.removeEventListener("dragleave", this._handleFrameDrag);
            frame.removeEventListener("drop", this._handleFrameDrop);
        }
    }

    startFrameListeners(frame) {
        frame = frame || this.props.frame;
        if (frame) {
            frame.addEventListener("dragenter", this._handleFrameDrag);
            frame.addEventListener("dragleave", this._handleFrameDrag);
            frame.addEventListener("drop", this._handleFrameDrop);
        }
    }

    open() {
        if (!this._fileInput)
            return;
        var fileInput = React.findDOMNode(this._fileInput);
        fileInput.value = null;
        fileInput.click();
    }
}
