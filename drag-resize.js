/*
  CSS custom property | Description | Default
  ------------------- | ----------- | -------
  `--drag-resize-handle-size` | draggable edge/corner size | 8px;
  `--drag-resize-corner-color` | color for resizable corner | '';
  `--drag-resize-edge-padding` | padding for resizable edges | '';
  `--drag-resize-edge-border` | border for resizable edges | '';
  `--drag-resize-corner-border` | border for resizable corners | '';
  `--drag-resize-container` | Mixin applied to resize container | {};
  `--drag-resize-move-cursor` | move cursor | move;
  `--drag-resize-top-cursor` | top cursor | ns-resize;
  `--drag-resize-bottom-cursor` | bottom cursor | ns-resize;
  `--drag-resize-left-cursor` | left cursor | ew-resize;
  `--drag-resize-right-cursor` | right cursor | ew-resize;
  `--drag-resize-top-left-cursor` | top-left cursor | nw-resize;
  `--drag-resize-top-right-cursor` | top-right cursor | ne-resize;
  `--drag-resize-bottom-left-cursor` | bottom-left cursor | sw-resize;
  `--drag-resize-bottom-right-cursor` | bottom-right cursor | se-resize;
*/

import { PolymerElement,html } from '../@polymer/polymer/polymer-element.js';

import { GestureEventListeners } from '../@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { FlattenedNodesObserver } from '../@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../@webcomponents/shadycss/entrypoints/apply-shim.js';

/**
 * `drag-resize`
 * A touch friendly draggable and/or resizable container.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class DragResize extends GestureEventListeners(PolymerElement) {

  static get properties() {
    return {
      /**
        * Which directions the container can be dragged.
        * Any combination of `up`, `down`, `left`, or `right`; or `none`.
        */
      drag: {
        type: String,
        value: 'up down left right',
        observer: '_dragChanged',
        reflectToAttribute: true
      },
      /**
        * Which edges allow resize.
        * Any combination of `top`, `bottom`, `left`, or `right`; or `none`.
        * A corner is enabled when both of its adjacent sides are enabled.
        */
      resize: {
        type: String,
        value: 'top bottom left right',
        observer: '_resizeChanged',
        reflectToAttribute: true
      },

      /**
        * True if draggable in at least one direction.
        */
      draggable: {
        type: Boolean,
        value: false,
        readOnly: true,
        reflectToAttribute: true
      },
      /**
        * True if resizable on at least one edge.
        */
      resizable: {
        type: Boolean,
        value: false,
        readOnly: true,
        reflectToAttribute: true
      },
      
      left: {
        type: Number,
        notify: true
      },
      top: {
        type: Number,
        notify: true
      },
      width: {
        type: Number,
        notify: true
      },
      height: {
        type: Number,
        notify: true
      },
      scale: {
        type: Number,
        value: 1
      }
    };
  }

  static get template() {
    return html`
    <style>
      :host {
        display: inline-block;
        --drag-resize-handle-size: 8px;
        --drag-resize-move-cursor: move;
        --drag-resize-top-cursor: ns-resize;
        --drag-resize-bottom-cursor: ns-resize;
        --drag-resize-left-cursor: ew-resize;
        --drag-resize-right-cursor: ew-resize;
        --drag-resize-top-left-cursor: nw-resize;
        --drag-resize-top-right-cursor: ne-resize;
        --drag-resize-bottom-left-cursor: sw-resize;
        --drag-resize-bottom-right-cursor: se-resize;
        --drag-resize-corner-background: white;
        --drag-resize-edge-border: 1px dashed #333;
        --drag-resize-corner-border: 1px solid #333;

        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        position: relative;
        box-sizing: border-box;
        display: block;
        @apply --drag-resize-container;
      }

      :host([resize~=top]) {
        padding-top: var(--drag-resize-edge-padding);
      }
      :host([resize~=bottom]) {
        padding-bottom: var(--drag-resize-edge-padding);
      }
      :host([resize~=left]) {
        padding-left: var(--drag-resize-edge-padding);
      }
      :host([resize~=right]) {
        padding-right: var(--drag-resize-edge-padding);
      }

      :host([draggable]) #overlay {
        cursor: var(--drag-resize-move-cursor);
        z-index: 1000;
      }
      :host div {
        position: absolute;
      }
      #overlay {
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }

      .top.edge, .bottom.edge {
        height: var(--drag-resize-handle-size);
        left: 0;
        right: 0;
      }
      .left.edge, .right.edge {
        width: var(--drag-resize-handle-size);
        top: 0;
        bottom: 0;
      }

      .corner {
        width: calc(var(--drag-resize-handle-size));
        height: calc(var(--drag-resize-handle-size));
        background: var(--drag-resize-corner-background);
        border: var(--drag-resize-corner-border);
      }

      .top.edge {
        top: 0;
        border-top: var(--drag-resize-edge-border);
        cursor: var(--drag-resize-top-cursor);
      }
      .bottom.edge {
        bottom: 0;
        border-bottom: var(--drag-resize-edge-border);
        cursor: var(--drag-resize-bottom-cursor);
      }
      .left.edge {
        left: 0;
        border-left: var(--drag-resize-edge-border);
        cursor: var(--drag-resize-left-cursor);
      }
      .right.edge {
        right: 0;
        border-right: var(--drag-resize-edge-border);
        cursor: var(--drag-resize-right-cursor);
      }

      .top.corner {
        top: calc(var(--drag-resize-handle-size) / -2);
      }
      .bottom.corner {
        bottom: calc(var(--drag-resize-handle-size) / -2);
      }
      .left.corner {
        left: calc(var(--drag-resize-handle-size) / -2);
      }
      .right.corner {
        right: calc(var(--drag-resize-handle-size) / -2);
      }

      .top.left {
        cursor: var(--drag-resize-top-left-cursor);
      }
      .top.right {
        cursor: var(--drag-resize-top-right-cursor);
      }
      .bottom.left {
        cursor: var(--drag-resize-bottom-left-cursor);
      }
      .bottom.right {
        cursor: var(--drag-resize-bottom-right-cursor);
      }
    </style>
    <slot></slot>
    <div id="overlay" draggable on-track="_onDrag">
      <div draggable class="top edge" hidden$="[[!resizeTop]]" on-track="_onResize"></div>
      <div draggable class="right edge" hidden$="[[!resizeRight]]" on-track="_onResize"></div>
      <div draggable class="bottom edge" hidden$="[[!resizeBottom]]" on-track="_onResize"></div>
      <div draggable class="left edge" hidden$="[[!resizeLeft]]" on-track="_onResize"></div>
      <div draggable class="top left corner" hidden$="[[!resizeTopLeft]]" on-track="_onResize"></div>
      <div draggable class="top right corner" hidden$="[[!resizeTopRight]]" on-track="_onResize"></div>
      <div draggable class="bottom left corner" hidden$="[[!resizeBottomLeft]]" on-track="_onResize"></div>
      <div draggable class="bottom right corner" hidden$="[[!resizeBottomRight]]" on-track="_onResize"></div>
    </div>
    `;
  }

  static get observers() {
    return [
      'updateSize(width,height)',
      'updatePosition(top,left)'
    ];
  }

  updateSize(width,height) {
    if (this.box) {
      this.box.style.height = height + 'px';
      this.box.style.width = width + 'px';
    }
  }

  updatePosition(top,left) {
    if (typeof top != "undefined" && typeof left != "undefined") {
      this.style.top = `${top}px`;
      this.style.left = `${left}px`;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    let slot = this.shadowRoot.querySelector('slot');
    this._observer = new FlattenedNodesObserver(slot,
      info => {
        this.box = slot.assignedNodes({flatten:true})
          .filter(n => n.nodeType === Node.ELEMENT_NODE)[0];
        this.initialTop = this.offsetTop;
        this.initialLeft = this.offsetLeft;
        this.initialHeight = this.box.offsetHeight;
        this.initialWidth = this.box.offsetWidth;
        this.top = this.initialTop;
        this.left = this.initialLeft;
        this.height = this.initialHeight;
        this.width = this.initialWidth;
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
  }

  reset() {
    if (!this.box) return;
    this.style.top = `${this.initialTop}px`;
    this.style.left = `${this.initialLeft}px`;
    this.box.style.height = this.initialHeight + 'px';
    this.box.style.width = this.initialWidth + 'px';
    this.top = this.initialTop;
    this.left = this.initialLeft;
  }

  _resizeChanged(edges) {
    if (typeof edges != 'string') return;
    this.resizeTop = edges.includes('top');
    this.resizeBottom = edges.includes('bottom');
    this.resizeLeft = edges.includes('left');
    this.resizeRight = edges.includes('right');
    this.resizeTopLeft = this.resizeTop && this.resizeLeft;
    this.resizeTopRight = this.resizeTop && this.resizeRight;
    this.resizeBottomLeft = this.resizeBottom && this.resizeLeft;
    this.resizeBottomRight = this.resizeBottom && this.resizeRight;
    this._setResizable(this.resizeTop || this.resizeBottom
      || this.resizeLeft || this.resizeRight);
  }

  _dragChanged(drag) {
    if (typeof drag != 'string') return;
    this.dragUp = drag.includes('up');
    this.dragDown = drag.includes('down');
    this.dragLeft = drag.includes('left');
    this.dragRight = drag.includes('right');
    this._setDraggable(this.dragUp || this.dragDown
      || this.dragLeft || this.dragRight);
  }

  _onResize(e, track) {
    if (!this.resizable) return;

    // Stop from dragging as well.
    e.stopPropagation();

    // Fix for half-pixel ddx/y when touching.
    const dx = Math.round((track.ddx || 0)/this.scale);
    const dy = Math.round((track.ddy || 0)/this.scale);

    // if (track.state == 'start') {
      // console.log('resizing', e.target.id, this.box);
    // }

    // Remember top-left point between runs.
    if (this.top === undefined) this.top = this.box.offsetTop || 0;
    if (this.left === undefined) this.left = this.box.offsetLeft || 0;

    // Values to change
    let top = this.top;
    let left = this.left;
    let height = this.box.offsetHeight;
    let width = this.box.offsetWidth;
    let changed = false;

    // If this line is moved to the top, resizing fails.
    const translate = this._sidesToTranslate(this.box);

    if (e.target.classList.contains('top')) {
      height += -dy;
      if (height < 0) height = 0;
      else if (translate.top) top += dy;
      changed = true;
    } else if (e.target.classList.contains('bottom')) {
      height += dy;
      if (height < 0) height = 0;
      else if (translate.bottom) top += -dy;
      changed = true;
    }

    if (e.target.classList.contains('left')) {
      width += -dx;
      if (width < 0) width = 0;
      else if (translate.left) left += dx;
      changed = true;
    } else if (e.target.classList.contains('right')) {
      width += dx;
      if (width < 0) width = 0;
      else if (translate.right) left += dx;
      changed = true;
    }

    if (changed) {
      this.fire('resize', track);
      this.top = top;
      this.left = left;
      this.width = width;
      this.height = height;
    }

    if (track.state == 'end') {
      e.target.blur();
    }
  }

  _onDrag(e, track) {
    if (!this.draggable) return;

    const dx = Math.round((track.dx || 0)/this.scale);
    const dy = Math.round((track.dy || 0)/this.scale);

    // Remember top-left point between runs.
    if (this.top === undefined) this.top = this.box.offsetTop || 0;
    if (this.left === undefined) this.left = this.box.offsetLeft || 0;

    if (track.state == 'start') {
      // console.log('dragging...');
      this._dragStartTop = this.top;
      this._dragStartLeft = this.left;
    }

    // Values to change
    let top = this._dragStartTop;
    let left = this._dragStartLeft;
    let changed = false;

    if ((this.dragUp && dy <= 0) || this.dragDown && dy >= 0) {
      top += dy;
      changed = true;
    }
    if ((this.dragLeft && dx <= 0) || this.dragRight && dx >= 0) {
      left += dx;
      changed = true;
    }

    // console.log(top, left, dx, dy)
    if (changed) {
      this.fire('drag', track);
      this.top = top;
      this.left = left;
    }
  }

  _sidesToTranslate(element) {
    let top = this.offsetTop;
    let left = this.offsetLeft;
    element.style.height = (element.offsetHeight + 2) + 'px';
    element.style.width = (element.offsetWidth + 2) + 'px';
    return {
      top: this.offsetTop == top,
      left: this.offsetLeft == left,
      bottom: this.offsetTop == top - 2,
      right: this.offsetLeft == left - 2,
    };
  }

  /** Copy the Polymer 1.x fire implementation. */
  fire(name, data, options = {}) {
    options.detail = data;
    if (options.bubbles === undefined) options.bubbles = true;
    if (options.composed === undefined) options.composed = true;
    this.dispatchEvent(new CustomEvent(name, options));
  }

  /**
   * Triggered when the element is resized.
   * @event resize
   * @param {track} object The on-track event detail.
   */

  /**
   * Triggered when the element is dragged.
   * @event drag
   * @param {track} object The on-track event detail.
   */
}
window.customElements.define('drag-resize', DragResize);
